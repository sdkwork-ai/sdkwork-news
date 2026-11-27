#!/usr/bin/env node
/**
 * News entity-linking importer.
 *
 * The news module owns content and entity attribution; the company / market
 * modules own the entities. This tool builds the entity dictionary (from a JSON
 * fixture or the sdkwork-company seeds), matches dictionaries against news
 * items, and emits idempotent SQL for:
 *
 * - `news_entity`                entity registry (company / industry / sector / instrument)
 * - `news_entity_link`           item -> entity attribution with confidence and extractor version
 * - `news_entity_feed`           per-entity feed read model for published items
 * - `news_entity_extraction_run` run ledger (items scanned, links/feeds written)
 *
 * Matching is intentionally conservative:
 * - Chinese names match as literal substrings.
 * - Latin names match on word boundaries.
 * - Tickers only match when written as `$AAPL` / `(AAPL)` or as a standalone
 *   uppercase token of at least four characters; one- and two-letter tickers are
 *   never matched bare.
 * - Generic industry/sector titles (其他, 综合, 未分类, Miscellaneous, Other) are
 *   excluded so a macro story does not inherit a fake sector.
 *
 * Cross-module references are stable ids only (`company_id`, `listing_id`,
 * `industry_id`, `sector_id`); no cross-database foreign key is created.
 *
 * Usage:
 *   node tools/news_entity_link_import.mjs --check
 *   node tools/news_entity_link_import.mjs --company-root ../sdkwork-company --items .cache/items.json --emit-sql .cache/entity-links.sql
 *   node tools/news_entity_link_import.mjs --dictionary tests/fixtures/company-news-dictionary.json --fixture-items tests/fixtures/company-news-items.json --apply
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TOOL_DIR, "..");
const DEFAULT_COMPANY_ROOT = path.resolve(REPO_ROOT, "..", "sdkwork-company");
const EXTRACTOR_VERSION = "news-entity-linker@2";
const TENANT_ID = "100001";
const require = createRequire(import.meta.url);

const GENERIC_TITLES = new Set([
  "其他",
  "其它",
  "综合",
  "综合Ⅱ",
  "未分类",
  "其他制造业",
  "其他服务业",
  "Miscellaneous",
  "Other",
  "Multi-Sector Companies",
]);

function parseArgs(argv) {
  const options = {
    check: false,
    apply: false,
    scanDb: false,
    companyRoot: DEFAULT_COMPANY_ROOT,
    dictionary: "",
    fixtureItems: "",
    items: "",
    emitSql: "",
    tenant: TENANT_ID,
    limit: 0,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--check") options.check = true;
    else if (token === "--apply") options.apply = true;
    else if (token === "--scan-db") options.scanDb = true;
    else if (token === "--company-root") options.companyRoot = path.resolve(argv[++index] ?? "");
    else if (token === "--dictionary") options.dictionary = argv[++index] ?? "";
    else if (token === "--fixture-items") options.fixtureItems = argv[++index] ?? "";
    else if (token === "--items") options.items = argv[++index] ?? "";
    else if (token === "--emit-sql") options.emitSql = argv[++index] ?? "";
    else if (token === "--tenant") options.tenant = argv[++index] ?? TENANT_ID;
    else if (token === "--limit") options.limit = Number(argv[++index] ?? 0);
  }
  return options;
}

function sqlText(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "NULL";
  return String(Math.trunc(Number(value)));
}

function sha1(value) {
  return createHash("sha1").update(String(value), "utf8").digest("hex");
}

function shortHash(value) {
  return sha1(value).slice(0, 16);
}

function parseTuples(text) {
  const tuples = [];
  let index = 0;
  while (index < text.length) {
    if (text[index] !== "(") {
      index += 1;
      continue;
    }
    let cursor = index + 1;
    while (cursor < text.length && /\s/u.test(text[cursor])) cursor += 1;
    if (text[cursor] !== "'") {
      index += 1;
      continue;
    }
    const fields = [];
    let field = "";
    let inQuote = false;
    let closed = false;
    for (let scan = cursor; scan < text.length; scan += 1) {
      const character = text[scan];
      if (inQuote) {
        if (character === "'") {
          if (text[scan + 1] === "'") {
            field += "'";
            scan += 1;
          } else inQuote = false;
        } else field += character;
      } else if (character === "'") {
        inQuote = true;
      } else if (character === ",") {
        fields.push(field.trim());
        field = "";
      } else if (character === ")") {
        fields.push(field.trim());
        tuples.push(fields);
        index = scan;
        closed = true;
        break;
      } else field += character;
    }
    if (!closed) break;
    index += 1;
  }
  return tuples;
}

let options = parseArgs([]);

/**
 * Derive news-matching English short names from a published legal name.
 *
 * News head lines write `Kweichow Moutai` or `Tencent Holdings`, never
 * `Kweichow Moutai Co.,Ltd.` or `Tencent Holdings Limited`. Most enriched legal
 * names therefore fail to match the way an article writes them.
 *
 * The derivation is deliberately conservative: it strips only trailing corporate
 * forms and the punctuation attached to them, never interior words.
 *
 * @param {string} legalName
 * @returns {string[]} candidate short names, longest first
 */
export function deriveEnglishShortNames(legalName) {
  const raw = String(legalName ?? "")
    .normalize("NFKC")
    .replace(/[\u3000\s]+/gu, " ")
    .trim();
  if (!raw) return [];

  // Corporate forms, strictly longest-first: `Company Limited` must be tried
  // before `Co`, or the bare `Co` alternative consumes `Co` inside `Company`.
  // The short European forms require a word boundary, otherwise `Chase` loses
  // its `se`.
  const SUFFIX =
    /(?:\s*[,，.]?\s*(?:Company\s+Limited|Pte\s*\.?\s*Ltd\s*\.?|Co\s*\.?\s*[,.]\s*Ltd\s*\.?|Co\s*\.?\s+Ltd\s*\.?|Co\s*\.?|Company|Limited|Ltd\s*\.?|Incorporated|Inc\s*\.?|Corporation|Corp\s*\.?|PLC|plc|(?<![A-Za-z])(?:SE|AG|NV|SA|SpA)))\s*$/iu;
  const GROUP_SUFFIX =
    /(?:\s*,?\s*(?:Group\s+)?Holdings?(?:\s+Limited|\s+Ltd\.?|\s+Inc\.?)?)\s*$/iu;
  const TRAILING = /[\s,，.、;；:：&\-]+$/u;

  const out = [];
  const push = (value) => {
    const cleaned = value
      // A trailing conjunction is left behind when `& Co.` is stripped.
      .replace(TRAILING, "")
      .replace(/\s{2,}/gu, " ")
      .trim();
    // A Latin short name needs at least three letters and must not be a
    // generic word on its own.
    if (cleaned.length < 3) return;
    if (!/[A-Za-z]{3}/u.test(cleaned)) return;
    if (!out.includes(cleaned)) out.push(cleaned);
  };

  push(raw);
  let current = raw;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = current.replace(SUFFIX, "").replace(TRAILING, "").trim();
    if (next === current) break;
    current = next;
    push(current);
  }
  // A holding-company vehicle is usually referred to without `Holdings`.
  const withoutGroup = current.replace(GROUP_SUFFIX, "");
  if (withoutGroup !== current) push(withoutGroup);

  return out;
}

/**
 * Short names that would attribute one article to two different legal entities.
 *
 * A derived short form is only safe as a search name when exactly one legal
 * entity claims it. Companies that share a legal name (an A-share and its
 * H-share listing) are one entity, so their shared short form is fine; names
 * such as `Costar Group` claimed by both CoStar Group Co.,Ltd. and CoStar Group
 * Inc. must be dropped or the linker would merge two issuers.
 *
 * The result is scoped to the supplied map rather than cached at module level,
 * so a caller building dictionaries from two different company roots never sees
 * the first root's collisions.
 *
 * @param {Map<string, string>} englishByCompany
 * @returns {Set<string>} lower-cased colliding candidates
 */
function collidingShortNames(englishByCompany) {
  const normalize = (value) => String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/gu, "");
  const byCandidate = new Map();
  for (const legalName of englishByCompany.values()) {
    const entity = normalize(legalName);
    for (const candidate of deriveEnglishShortNames(legalName)) {
      const key = candidate.toLowerCase();
      if (!byCandidate.has(key)) byCandidate.set(key, new Set());
      byCandidate.get(key).add(entity);
    }
  }
  return new Set(
    [...byCandidate.entries()]
      .filter(([, entities]) => entities.size > 1)
      .map(([candidate]) => candidate),
  );
}

/**
 * @param {string} companyRoot
 * @returns {Array<{ entityType: string, entityKey: string, symbol: string|null, displayName: string, marketCode: string|null, searchNames: string[] }>}
 */
export function buildDictionaryFromCompanySeeds(companyRoot) {
  const read = (name) => readFileSync(path.join(companyRoot, "database", "seeds", "common", name), "utf8");
  const profiles = parseTuples(read("008_listed_company_profiles.sql"))
    .filter((fields) => fields[0]?.startsWith("company-listed-"))
    .map((fields) => ({ id: fields[0], name: fields[3] }));
  const demoProfiles = parseTuples(read("003_company_profiles.sql"))
    .filter((fields) => fields[0]?.startsWith("company-profile-"))
    .map((fields) => ({ id: fields[0], name: fields[3] }));
  const listings = parseTuples(read("009_listed_company_listings.sql"))
    .filter((fields) => fields[0]?.startsWith("company-listing-"))
    .map((fields) => ({
      id: fields[0],
      companyId: fields[3],
      marketCode: fields[4],
      exchangeCode: fields[5],
      ticker: fields[7],
      status: fields[11],
    }));
  const industries = [
    ...parseTuples(read("001_company_industries.sql")),
    ...parseTuples(read("006_company_industry_taxonomy.sql")),
  ]
    .filter((fields) => fields[0]?.startsWith("company-industry-"))
    .map((fields) => ({
      id: fields[0],
      title: fields[4],
      standard: fields[8],
    }));
  const sectors = parseTuples(read("018_company_sectors.sql"))
    .filter((fields) => fields[0]?.startsWith("company-sector-"))
    .map((fields) => ({ id: fields[0], title: fields[5], titleEn: fields[6], kind: fields[7] }));

  // The company domain publishes its localized display values through
  // `<resource>_translation` tables (see sdkwork-company
  // docs/architecture/tech/TECH-company-database-i18n.md). Reading those
  // instead of re-deriving names keeps one source of truth: an English article
  // and a Chinese article resolve the same company id.
  const englishByCompany = new Map();
  const enByIndustry = new Map();
  const enBySector = new Map();
  const readTranslations = (file) => {
    try {
      return parseTuples(read(file));
    } catch {
      return [];
    }
  };
  for (const fields of readTranslations("033_company_profile_translations.sql")) {
    // (id, tenant, organization, companyId, locale, fieldName, value, ...)
    const [, , , companyId, locale, fieldName, value] = fields;
    if (fieldName !== "display_name" || locale !== "en-US") continue;
    if (!companyId?.startsWith("company-")) continue;
    if (value) englishByCompany.set(companyId, value);
  }
  for (const fields of readTranslations("032_company_dictionary_translations.sql")) {
    // (id, tenant, organization, <subject>Id, locale, fieldName, value, ...)
    const [id, , , subjectId, locale, fieldName, value] = fields;
    if (fieldName !== "title" || !value) continue;
    // The zh-CN title is already the base-table projection, so only the English
    // values add new matching surface here.
    if (locale === "en-US" && id?.includes("-industry-")) enByIndustry.set(subjectId, value);
    if (locale === "en-US" && id?.includes("-sector-")) enBySector.set(subjectId, value);
  }

  const colliding = collidingShortNames(englishByCompany);

  /**
   * Every name an article may use for a company: the published Chinese name, the
   * English legal name, and the short English forms head lines actually write.
   * A short form claimed by two different legal entities is excluded.
   */
  const companySearchNames = (companyId, displayName) => {
    const names = [displayName];
    const english = englishByCompany.get(companyId);
    if (english) {
      for (const candidate of deriveEnglishShortNames(english)) {
        if (colliding.has(candidate.toLowerCase())) continue;
        names.push(candidate);
      }
      // The legal name itself is authoritative even when a shorter form is
      // ambiguous, so it is always searchable.
      if (!names.includes(english)) names.push(english);
    }
    return [...new Set(names.filter(Boolean))];
  };

  const companyNames = new Map();
  for (const profile of [...profiles, ...demoProfiles]) {
    companyNames.set(profile.id, profile.name);
  }
  const marketPriority = { CN_A: 1, HK: 2, US: 3 };
  const primaryListing = new Map();
  for (const listing of listings) {
    if (listing.status !== "listed") continue;
    const current = primaryListing.get(listing.companyId);
    if (!current || (marketPriority[listing.marketCode] ?? 9) < (marketPriority[current.marketCode] ?? 9)) {
      primaryListing.set(listing.companyId, listing);
    }
  }

  const entities = [];
  for (const profile of [...profiles, ...demoProfiles]) {
    const primary = primaryListing.get(profile.id);
    entities.push({
      entityType: "company",
      entityKey: profile.id,
      symbol: primary?.ticker ?? null,
      displayName: profile.name,
      marketCode: primary?.marketCode ?? null,
      searchNames: companySearchNames(profile.id, profile.name),
    });
  }
  for (const listing of listings) {
    if (listing.status !== "listed") continue;
    const name = companyNames.get(listing.companyId);
    if (!name) continue;
    entities.push({
      entityType: "instrument",
      entityKey: listing.id,
      symbol: listing.ticker,
      displayName: `${name} (${listing.ticker})`,
      marketCode: listing.marketCode,
      searchNames: [],
    });
  }
  for (const industry of industries) {
    if (GENERIC_TITLES.has(industry.title) || industry.title.length < 2) continue;
    entities.push({
      entityType: "industry",
      entityKey: industry.id,
      symbol: null,
      displayName: industry.title,
      marketCode: null,
      searchNames: [industry.title, enByIndustry.get(industry.id)].filter(Boolean),
    });
  }
  for (const sector of sectors) {
    if (GENERIC_TITLES.has(sector.title) || sector.title.length < 2) continue;
    entities.push({
      entityType: "sector",
      entityKey: sector.id,
      symbol: null,
      displayName: sector.title,
      marketCode: null,
      searchNames: [sector.title, sector.titleEn, enBySector.get(sector.id)].filter(Boolean),
    });
  }
  return entities;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isCjkName(value) {
  return /\p{Script=Han}/u.test(value);
}

/**
 * Whether a matched name needs corroboration before it can attribute an article.
 *
 * Short Chinese names collide with common vocabulary far too often to trust on
 * their own. English and four-plus-character Chinese names are distinctive enough
 * to stand alone.
 *
 * @param {string} name
 * @returns {boolean}
 */
export function needsCorroboration(name) {
  return isCjkName(name) && name.length <= 3;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/**
 * Whether the article attributes a short company name to the company itself.
 *
 * A bag-of-words check is not enough here. `机器人` is the everyday word "robot",
 * and business headlines almost always mention 公司 / 股份 / 涨停 somewhere, so a
 * proximity rule still attributes every humanoid-robot story to Siasun Robot
 * (300024). What actually distinguishes a company reference is one of the forms a
 * finance desk uses:
 *
 * - the security code in brackets: `机器人(300024)`, `机器人（SZ300024）`
 * - the name opening the headline with a colon: `机器人：拟收购…`
 * - the name directly bound to a disclosure verb: `机器人公告`, `机器人披露`
 *
 * Anything else is treated as the common noun and the article is not linked.
 *
 * @param {string} title
 * @param {string} text
 * @param {string} name
 * @param {string|null} ticker
 * @returns {boolean}
 */
export function isCorroborated(title, text, name, ticker) {
  const escaped = escapeRegExp(name);
  if (ticker) {
    const code = escapeRegExp(ticker);
    // `机器人(300024)`, `机器人（300024）`, `机器人(SZ300024)`.
    const bracket = new RegExp(`${escaped}\\s*[（(]\\s*[A-Z]{0,2}${code}\\s*[）)]`, "u");
    if (bracket.test(text)) return true;
  }
  // `机器人：…` / `机器人: …` at the start of the headline.
  const lead = new RegExp(`^\\s*${escaped}\\s*[：:]`, "u");
  if (lead.test(title)) return true;
  // `机器人公告…` / `机器人披露…` / `机器人发布…` directly bound to the name.
  const bound = new RegExp(`${escaped}\\s*(公告|披露|发布|股份|复牌|停牌)`, "u");
  if (bound.test(text)) return true;
  return false;
}

/**
 * @param {string} text
 * @param {string} name
 * @returns {boolean}
 */
export function matchesName(text, name) {
  if (!name || name.length < 2) return false;
  if (isCjkName(name)) {
    return text.includes(name);
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "iu").test(text);
}

/**
 * @param {string} text
 * @param {string} ticker
 * @returns {"explicit"|"bare"|null}
 */
export function matchesTicker(text, ticker) {
  if (!ticker) return null;
  const normalized = ticker.toUpperCase();
  if (!/^[A-Z][A-Z0-9.-]{0,9}$/u.test(normalized)) return null;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  if (new RegExp(`\\$${escaped}\\b`, "u").test(text) || new RegExp(`\\(${escaped}\\)`, "u").test(text)) {
    return "explicit";
  }
  if (normalized.length >= 4) {
    if (new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "u").test(text)) {
      return "bare";
    }
  }
  return null;
}

/**
 * Corporate event taxonomy carried by `news_event_link`.
 * The set is intentionally small and stable; new event types need a migration
 * or a documented extension because downstream timelines group by this value.
 */
export const EVENT_TYPES = [
  "earnings",
  "merger_acquisition",
  "ipo_listing",
  "regulatory",
  "dividend",
  "capital_action",
  "product",
  "management_change",
];

/**
 * Detect corporate event types from an item title and summary.
 * @param {string} title
 * @param {string} summary
 * @returns {string[]}
 */
export function detectEventTypes(title, summary = "") {
  const text = `${title}\n${summary}`;
  const detected = new Set();
  if (/财报|业绩|营收|净利润|季报|年报|亏损|盈利/u.test(text)) detected.add("earnings");
  if (/并购|收购|重组|合并|控制权|要约/u.test(text)) detected.add("merger_acquisition");
  if (/IPO|上市|招股|过会|注册生效|发行/u.test(text)) detected.add("ipo_listing");
  if (/处罚|立案|监管|问询|退市|风险警示|违规/u.test(text)) detected.add("regulatory");
  if (/分红|派息|股息/u.test(text)) detected.add("dividend");
  if (/回购|增持|减持|定增|可转债|配股|拆股/u.test(text)) detected.add("capital_action");
  if (/新品|新产品|产品发布|发布全新|扩产|投产|量产|订单/u.test(text)) detected.add("product");
  if (/辞任|卸任|任命|聘任|董事长|总经理|高管/u.test(text)) detected.add("management_change");
  return [...detected];
}

/**
 * Resolve an event date from explicit text or the publication date.
 * @param {string} text
 * @param {string | null | undefined} publishedAt
 * @returns {string}
 */
export function eventDateOf(text, publishedAt) {
  const match = /(20\d{2})[-年/.](\d{1,2})[-月/.](\d{1,2})/u.exec(text);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }
  if (publishedAt && /^\d{4}-\d{2}-\d{2}/u.test(publishedAt)) {
    return publishedAt.slice(0, 10);
  }
  return "1970-01-01";
}

/**
 * @param {string} title
 * @returns {"high"|"medium"|"low"}
 */
export function materialityOf(title) {
  if (/并购|重组|控制权|退市|立案|处罚|违约|暴雷|重大事故|停牌/u.test(title)) return "high";
  if (/财报|业绩|分红|回购|减持|IPO|上市|增发|可转债|定增/u.test(title)) return "medium";
  return "medium";
}

/**
 * @param {Array<object>} entities
 * @param {Array<object>} items
 * @param {string} tenantId
 * @returns {{ links: Array<object>, feeds: Array<object>, entityRows: Array<object>, perItem: Map<string, Array<object>> }}
 */
export function linkItems(entities, items, tenantId = TENANT_ID) {
  /** @type {Map<string, Array<{ role: string, confidenceBps: number, reason: string }>>} */
  const perItem = new Map();
  const matchedEntities = new Map();
  const links = [];
  const feeds = [];
  const events = [];
  for (const item of items) {
    const title = item.title ?? "";
    const summary = item.summary ?? "";
    const body = item.bodyMarkdown ?? item.body ?? "";
    const text = `${title}\n${summary}\n${body}`;
    /** @type {Map<string, { entity: object, role: string, confidenceBps: number, reason: string }>} */
    const best = new Map();
    for (const entity of entities) {
      let confidence = 0;
      let reason = "";
      let inTitle = false;
      for (const name of entity.searchNames ?? []) {
        if (!matchesName(text, name)) continue;
        // A short company name that is also a common noun must be corroborated by
        // a ticker or a company-designating word nearby, or it would attribute
        // every article about robots to 机器人 (300024).
        if (
          entity.entityType === "company" &&
          needsCorroboration(name) &&
          !isCorroborated(title, text, name, entity.symbol)
        ) {
          continue;
        }
        const typeWeight =
          entity.entityType === "company" ? 10000 : entity.entityType === "industry" ? 7000 : 6500;
        const lengthPenalty = name.length <= 3 ? 1000 : 0;
        const score = Math.max(confidence, typeWeight - lengthPenalty);
        if (score > confidence) {
          confidence = score;
          reason = `name:${name}`;
          inTitle = matchesName(title, name);
        }
      }
      const tickerMatch = matchesTicker(text, entity.symbol);
      if (tickerMatch) {
        const score = tickerMatch === "explicit" ? 8500 : 7000;
        if (score > confidence) {
          confidence = score;
          reason = `ticker:${entity.symbol}`;
          inTitle = matchesTicker(title, entity.symbol) !== null;
        }
      }
      if (confidence <= 0) continue;
      const role = inTitle && (entity.entityType === "company" || entity.entityType === "instrument") ? "subject" : "mention";
      const existing = best.get(entity.entityKey);
      if (!existing || confidence > existing.confidenceBps) {
        best.set(entity.entityKey, { entity, role, confidenceBps: confidence, reason });
      }
    }
    const itemLinks = [];
    const checksum = sha1(`${title}|${summary}|${body}`);
    const eventTypes = detectEventTypes(title, summary);
    const eventDate = eventDateOf(`${title}\n${summary}`, item.publishedAt);
    for (const entry of best.values()) {
      matchedEntities.set(`${entry.entity.entityType}|${entry.entity.entityKey}`, entry.entity);
      const link = {
        id: `news-entity-link-${shortHash(`${tenantId}|${item.id}|${entry.entity.entityKey}|${entry.role}`)}`,
        itemId: item.id,
        tenantId,
        entity: entry.entity,
        role: entry.role,
        confidenceBps: entry.confidenceBps,
        relevanceBps: entry.confidenceBps,
        reason: entry.reason,
        checksum,
      };
      links.push(link);
      itemLinks.push(link);
      if (entry.entity.entityType === "company" || entry.entity.entityType === "instrument") {
        for (const eventType of eventTypes) {
          events.push({
            id: `news-event-link-${shortHash(`${tenantId}|${item.id}|${entry.entity.entityKey}|${eventType}|${eventDate}`)}`,
            tenantId,
            itemId: item.id,
            entity: entry.entity,
            eventType,
            eventDate,
            materiality: materialityOf(title),
            confidenceBps: entry.confidenceBps,
            checksum,
          });
        }
      }
      if (item.status === "published" && item.publishedAt) {
        feeds.push({
          id: `news-entity-feed-${shortHash(`${tenantId}|${entry.entity.entityKey}|${item.id}`)}`,
          tenantId,
          entity: entry.entity,
          itemId: item.id,
          scoreBps: entry.confidenceBps,
          materiality: materialityOf(title),
          publishedAt: item.publishedAt,
        });
      }
    }
    perItem.set(item.id, itemLinks);
  }
  return {
    links,
    feeds,
    events,
    entityRows: [...matchedEntities.values()],
    perItem,
    perItemEvents: new Map(
      items.map((item) => [item.id, events.filter((event) => event.itemId === item.id)]),
    ),
  };
}

function buildSql(result, tenantId) {
  const now = new Date().toISOString();
  const runId = `news-entity-extraction-run-${shortHash(`${tenantId}|${now}`)}`;
  const itemIds = [...result.perItem.keys()];
  const itemArray = itemIds.length > 0
    ? `ARRAY[${itemIds.map((itemId) => sqlText(itemId)).join(",")}]::text[]`
    : "ARRAY[]::text[]";
  const lines = [
    "-- News entity-linking extraction generated by tools/news_entity_link_import.mjs.",
    `-- extractor_version: ${EXTRACTOR_VERSION}`,
    `-- generated_at: ${now}`,
    "",
    "-- Reconcile this extractor's derived rows for the scanned items before",
    "-- re-inserting, so an extractor-version change cannot leave stale links.",
    itemIds.length > 0
      ? `DELETE FROM news_entity_link WHERE tenant_id = ${sqlText(tenantId)} AND extractor_version LIKE 'news-entity-linker@%' AND item_id = ANY(${itemArray});`
      : "-- no items scanned",
    itemIds.length > 0
      ? `DELETE FROM news_event_link WHERE tenant_id = ${sqlText(tenantId)} AND extractor_version LIKE 'news-entity-linker@%' AND item_id = ANY(${itemArray});`
      : "",
    itemIds.length > 0
      ? `DELETE FROM news_entity_feed WHERE tenant_id = ${sqlText(tenantId)} AND item_id = ANY(${itemArray});`
      : "",
    "",
  ];
  if (result.entityRows.length > 0) {
    lines.push(
      "INSERT INTO news_entity (",
      "    id, tenant_id, organization_id, entity_type, entity_key, symbol,",
      "    display_name, market_code, locale, status, metadata_text, created_at, updated_at",
      ")",
      "VALUES",
      result.entityRows
        .map((entity) => {
          const id = `news-entity-${entity.entityType}-${shortHash(entity.entityKey)}`;
          return `    (${sqlText(id)}, ${sqlText(tenantId)}, '0', ${sqlText(entity.entityType)}, ${sqlText(entity.entityKey)}, ${sqlText(entity.symbol)}, ${sqlText(entity.displayName)}, ${sqlText(entity.marketCode)}, NULL, 'active', '{}', ${sqlText(now)}, ${sqlText(now)})`;
        })
        .join(",\n"),
      "ON CONFLICT (tenant_id, entity_type, entity_key) DO UPDATE SET",
      "    symbol = EXCLUDED.symbol,",
      "    display_name = EXCLUDED.display_name,",
      "    market_code = EXCLUDED.market_code,",
      "    status = EXCLUDED.status,",
      "    updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  if (result.links.length > 0) {
    const entityId = (entity) => `news-entity-${entity.entityType}-${shortHash(entity.entityKey)}`;
    lines.push(
      "INSERT INTO news_entity_link (",
      "    id, tenant_id, organization_id, item_id, entity_id, role,",
      "    relevance_bps, sentiment, confidence_bps, extractor_version,",
      "    source_checksum, status, created_at, updated_at",
      ")",
      "VALUES",
      result.links
        .map(
          (link) =>
            `    (${sqlText(link.id)}, ${sqlText(tenantId)}, '0', ${sqlText(link.itemId)}, ${sqlText(entityId(link.entity))}, ${sqlText(link.role)}, ${sqlNumber(link.relevanceBps)}, NULL, ${sqlNumber(link.confidenceBps)}, ${sqlText(EXTRACTOR_VERSION)}, ${sqlText(link.checksum)}, 'active', ${sqlText(now)}, ${sqlText(now)})`,
        )
        .join(",\n"),
      "ON CONFLICT (tenant_id, item_id, entity_id, role) DO UPDATE SET",
      "    relevance_bps = EXCLUDED.relevance_bps,",
      "    confidence_bps = EXCLUDED.confidence_bps,",
      "    extractor_version = EXCLUDED.extractor_version,",
      "    source_checksum = EXCLUDED.source_checksum,",
      "    status = EXCLUDED.status,",
      "    updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  if (result.feeds.length > 0) {
    const entityId = (entity) => `news-entity-${entity.entityType}-${shortHash(entity.entityKey)}`;
    lines.push(
      "INSERT INTO news_entity_feed (",
      "    id, tenant_id, organization_id, entity_id, item_id, score_bps,",
      "    materiality, published_at, computed_at, created_at, updated_at",
      ")",
      "VALUES",
      result.feeds
        .map(
          (feed) =>
            `    (${sqlText(feed.id)}, ${sqlText(tenantId)}, '0', ${sqlText(entityId(feed.entity))}, ${sqlText(feed.itemId)}, ${sqlNumber(feed.scoreBps)}, ${sqlText(feed.materiality)}, ${sqlText(feed.publishedAt)}, ${sqlText(now)}, ${sqlText(now)}, ${sqlText(now)})`,
        )
        .join(",\n"),
      "ON CONFLICT (tenant_id, entity_id, item_id) DO UPDATE SET",
      "    score_bps = EXCLUDED.score_bps,",
      "    materiality = EXCLUDED.materiality,",
      "    published_at = EXCLUDED.published_at,",
      "    computed_at = EXCLUDED.computed_at,",
      "    updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  if (result.events.length > 0) {
    const entityId = (entity) => `news-entity-${entity.entityType}-${shortHash(entity.entityKey)}`;
    lines.push(
      "INSERT INTO news_event_link (",
      "    id, tenant_id, organization_id, item_id, entity_id, event_type,",
      "    event_date, materiality, confidence_bps, extractor_version,",
      "    source_checksum, status, created_at, updated_at",
      ")",
      "VALUES",
      result.events
        .map(
          (event) =>
            `    (${sqlText(event.id)}, ${sqlText(tenantId)}, '0', ${sqlText(event.itemId)}, ${sqlText(entityId(event.entity))}, ${sqlText(event.eventType)}, ${sqlText(event.eventDate)}, ${sqlText(event.materiality)}, ${sqlNumber(event.confidenceBps)}, ${sqlText(EXTRACTOR_VERSION)}, ${sqlText(event.checksum)}, 'active', ${sqlText(now)}, ${sqlText(now)})`,
        )
        .join(",\n"),
      "ON CONFLICT (tenant_id, item_id, entity_id, event_type, event_date) DO UPDATE SET",
      "    materiality = EXCLUDED.materiality,",
      "    confidence_bps = EXCLUDED.confidence_bps,",
      "    extractor_version = EXCLUDED.extractor_version,",
      "    source_checksum = EXCLUDED.source_checksum,",
      "    status = EXCLUDED.status,",
      "    updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  lines.push(
    "INSERT INTO news_entity_extraction_run (",
    "    id, tenant_id, organization_id, extractor_version, scope, status,",
    "    items_scanned, links_written, feeds_written, events_written, started_at,",
    "    finished_at, error_message, created_at, updated_at",
    ")",
    "VALUES",
    `    (${sqlText(runId)}, ${sqlText(tenantId)}, '0', ${sqlText(EXTRACTOR_VERSION)}, 'all', 'completed', ${result.perItem.size}, ${result.links.length}, ${result.feeds.length}, ${result.events.length}, ${sqlText(now)}, ${sqlText(now)}, NULL, ${sqlText(now)}, ${sqlText(now)})`,
    "ON CONFLICT (id) DO UPDATE SET",
    "    status = EXCLUDED.status,",
    "    items_scanned = EXCLUDED.items_scanned,",
    "    links_written = EXCLUDED.links_written,",
    "    feeds_written = EXCLUDED.feeds_written,",
    "    events_written = EXCLUDED.events_written,",
    "    finished_at = EXCLUDED.finished_at,",
    "    updated_at = EXCLUDED.updated_at;",
    "",
  );
  return lines.join("\n");
}

function readJson(relative) {
  return JSON.parse(readFileSync(path.resolve(REPO_ROOT, relative), "utf8"));
}

function loadDictionary(options) {
  if (options.dictionary) {
    const payload = readJson(options.dictionary);
    return payload.entities ?? payload;
  }
  return buildDictionaryFromCompanySeeds(options.companyRoot);
}

function loadItems(options) {
  if (options.fixtureItems) {
    return readJson(options.fixtureItems);
  }
  if (options.items) {
    return readJson(options.items);
  }
  throw new Error("provide --fixture-items or --items (JSON array)");
}

function checkFixture() {
  const dictionary = readJson("tests/fixtures/company-news-dictionary.json").entities;
  const items = readJson("tests/fixtures/company-news-items.json");
  const result = linkItems(dictionary, items);
  const failures = [];
  const assertLink = (itemId, entityKey, role) => {
    if (!result.perItem.get(itemId)?.some((link) => link.entity.entityKey === entityKey && link.role === role)) {
      failures.push(`${itemId} missing ${entityKey}/${role}`);
    }
  };
  assertLink("news-item-maotai-q3", "company-listed-cn-600519", "subject");
  assertLink("news-item-maotai-q3", "company-sector-liquor", "mention");
  assertLink("news-item-semi", "company-listed-cn-688981", "subject");
  assertLink("news-item-semi", "company-sector-domestic-substitution", "mention");
  assertLink("news-item-aapl", "company-listing-us-aapl", "subject");
  if ((result.perItem.get("news-item-macro") ?? []).length !== 0) {
    failures.push("macro item must not link a company or sector");
  }
  if ((result.perItemEvents.get("news-item-macro") ?? []).length !== 0) {
    failures.push("macro item must not produce a corporate event");
  }
  if ((result.perItemEvents.get("news-item-maotai-q3") ?? []).every((event) => event.eventType !== "earnings")) {
    failures.push("maotai earnings item must produce an earnings event");
  }
  if ((result.perItemEvents.get("news-item-semi") ?? []).every((event) => event.eventType !== "product")) {
    failures.push("semi expansion item must produce a product event");
  }
  if (result.feeds.length === 0) {
    failures.push("published fixture items must produce feed rows");
  }
  if (result.events.length === 0) {
    failures.push("fixture items must produce event links");
  }
  if (failures.length > 0) {
    throw new Error(`entity-link fixture failed: ${failures.join("; ")}`);
  }
  process.stdout.write(
    `[news_entity_link_import] check ok items=${result.perItem.size} entities=${result.entityRows.length} links=${result.links.length} feeds=${result.feeds.length} events=${result.events.length}\n`,
  );
}

async function connectDatabase() {
  let pg;
  try {
    pg = require("pg");
  } catch {
    try {
      pg = require(
        path.resolve(REPO_ROOT, "..", "sdkwork-company", ".cache", "pg-client", "node_modules", "pg"),
      );
    } catch {
      throw new Error("database mode requires the pg module; install it or use --emit-sql");
    }
  }
  const client = new pg.Client({
    host: process.env.SDKWORK_DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.SDKWORK_DATABASE_PORT ?? 5432),
    database: process.env.SDKWORK_DATABASE_NAME ?? "sdkwork_ai_dev",
    user: process.env.SDKWORK_DATABASE_USERNAME ?? "sdkwork_ai_dev",
    password: process.env.SDKWORK_DATABASE_PASSWORD ?? "",
  });
  await client.connect();
  const schema = process.env.SDKWORK_DATABASE_SCHEMA;
  if (schema) {
    await client.query(`SET search_path TO ${schema.replaceAll(/[^a-zA-Z0-9_]/gu, "")}, public`);
  }
  return client;
}

async function applySql(sql) {
  const client = await connectDatabase();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

/**
 * @param {number} limit
 * @returns {Promise<Array<object>>}
 */
async function loadDatabaseItems(limit) {
  const client = await connectDatabase();
  try {
    const result = await client.query(
      `SELECT i.id, i.tenant_id, i.title, i.summary, i.status, i.published_at,
              COALESCE(b.body_markdown, '') AS body_markdown
       FROM news_item i
       LEFT JOIN news_item_body b ON b.item_id = i.id
       WHERE i.status = 'published' AND i.archived_at IS NULL
       ORDER BY i.published_at DESC NULLS LAST, i.id
       LIMIT $1`,
      [limit],
    );
    return result.rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      title: row.title,
      summary: row.summary,
      status: row.status,
      publishedAt: row.published_at,
      bodyMarkdown: row.body_markdown,
    }));
  } finally {
    await client.end();
  }
}

async function main() {
  options = parseArgs(process.argv.slice(2));
  if (options.check) {
    checkFixture();
    return;
  }
  const dictionary = loadDictionary(options);
  const allItems = options.scanDb
    ? await loadDatabaseItems(options.limit > 0 ? options.limit : 500)
    : loadItems(options);
  const items = options.scanDb || options.limit <= 0 ? allItems : allItems.slice(0, options.limit);
  const result = linkItems(dictionary, items, options.tenant);
  const sql = buildSql(result, options.tenant);
  if (options.emitSql) {
    const output = path.resolve(REPO_ROOT, options.emitSql);
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, sql, "utf8");
    process.stderr.write(`[news_entity_link_import] wrote ${path.relative(REPO_ROOT, output)}\n`);
  }
  if (options.apply) {
    await applySql(sql);
  }
  process.stdout.write(
    `[news_entity_link_import] items=${items.length} entities=${result.entityRows.length} links=${result.links.length} feeds=${result.feeds.length} events=${result.events.length}\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

