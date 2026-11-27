#!/usr/bin/env node
/**
 * News item importer for sdkwork-news.
 *
 * The module shipped with an empty bootstrap seed (0 items, 0 sources, 0
 * categories), so the entity linker and the per-entity feed could only ever run
 * against test fixtures. This tool gives the module a real initialization
 * snapshot:
 *
 * - `002_news_catalog.sql`  category and source dictionaries
 * - `003_news_items.sql`    published flash-news items
 *
 * Source: Eastmoney's public 7x24 finance flash list. Each entry carries an id,
 * a headline, a digest, a publish time and a canonical URL, which is exactly the
 * shape `news_item` needs.
 *
 * The snapshot is committed so a greenfield deployment initializes with real
 * content and the entity linker has something to attribute. Production keeps
 * ingesting through the module's own pipeline; this file is the bootstrap floor,
 * not the steady state.
 *
 * Usage:
 *   node tools/news_item_import.mjs             # fetch + write
 *   node tools/news_item_import.mjs --offline   # reuse cache
 *   node tools/news_item_import.mjs --check     # verify seeds
 *   node tools/news_item_import.mjs --pages 40  # deeper snapshot
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED_DIR = path.join(ROOT, "database", "seeds", "common");
const CATALOG_OUTPUT = path.join(SEED_DIR, "002_news_catalog.sql");
const ITEMS_OUTPUT = path.join(SEED_DIR, "003_news_items.sql");
const CACHE_PATH = path.join(ROOT, ".cache", "news-flash.json");
const MANIFEST = path.join(ROOT, "database", "imports", "news-items", "source.manifest.json");

const TENANT = "100001";
const SNAPSHOT = "2026-11-28T00:00:00Z";
const SOURCE_SLUG = "eastmoney-flash";
const FEED_BASE = "https://newsapi.eastmoney.com/kuaixun/v1/getlist_102_ajaxResult_50_";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; SDKWorkNews/1.0)",
  Referer: "https://finance.eastmoney.com/",
};
const DEFAULT_PAGES = 20;
const MAX_ATTEMPTS = 4;

/** Category dictionary. Flash items map to `finance-flash`. */
const CATEGORIES = [
  { slug: "finance-flash", title: "财经快讯", description: "7×24 小时财经快讯", priority: 10 },
  { slug: "company", title: "公司", description: "上市公司与产业公司动态", priority: 20 },
  { slug: "markets", title: "市场", description: "股票、债券、外汇与商品市场", priority: 30 },
  { slug: "policy", title: "政策", description: "监管、宏观政策与产业规划", priority: 40 },
  { slug: "global", title: "国际", description: "海外市场与国际事件", priority: 50 },
];

/** Source dictionary. */
const SOURCES = [
  {
    slug: SOURCE_SLUG,
    title: "东方财富 7×24 快讯",
    sourceType: "wire",
    trustTier: "standard",
    homepageUrl: "https://finance.eastmoney.com/",
  },
  {
    slug: "eastmoney-finance",
    title: "东方财富财经",
    sourceType: "publisher",
    trustTier: "standard",
    homepageUrl: "https://finance.eastmoney.com/",
  },
];

function parseArgs(argv) {
  const options = { offline: false, check: false, pages: DEFAULT_PAGES };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--offline") options.offline = true;
    else if (token === "--check") options.check = true;
    else if (token === "--pages") options.pages = Number(argv[++index] ?? DEFAULT_PAGES);
  }
  return options;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sqlText(value) {
  return `'${String(value ?? "").replace(/'/gu, "''")}'`;
}

function sqlNullable(value) {
  if (value === null || value === undefined) return "NULL";
  const text = String(value).trim();
  return text === "" ? "NULL" : sqlText(text);
}

function hash(value) {
  return createHash("sha1").update(String(value)).digest("hex").slice(0, 16);
}

/** Normalize a headline+digest into a one-line summary: strip the 【…】 lead-in. */
function toSummary(digest, title) {
  const raw = String(digest ?? "").replace(/^\s*【[^】]*】\s*/u, "").trim();
  const text = raw || String(title ?? "").trim();
  return text.replace(/\s+/gu, " ").slice(0, 600);
}

/** Eastmoney publishes `YYYY-MM-DD HH:mm:ss` in Asia/Shanghai; store ISO-8601 UTC. */
function toIsoUtc(localDateTime) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/u.exec(
    String(localDateTime ?? "").trim(),
  );
  if (!match) return null;
  // Shanghai is UTC+8 with no DST, so the offset is constant.
  const [, year, month, day, hour, minute, second] = match;
  const local = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return new Date(local - 8 * 3600 * 1000).toISOString().replace(".000Z", "Z");
}

function toSlug(id, title) {
  const digest = createHash("sha1").update(`${id}|${title}`).digest("hex").slice(0, 10);
  return `em-${id}-${digest}`;
}

async function fetchPages(pages, options) {
  if (options.offline && existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  }
  const collected = [];
  for (let page = 1; page <= pages; page += 1) {
    let payload = null;
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(`${FEED_BASE}${page}_.html`, { headers: HEADERS });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        // The payload is a `var ajaxResult={...};` assignment, not strict JSON.
        payload = JSON.parse(text.slice(text.indexOf("=") + 1).replace(/;\s*$/u, ""));
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_ATTEMPTS) await sleep(400 * 2 ** (attempt - 1));
      }
    }
    if (lastError) throw new Error(`flash page ${page}: ${lastError.message}`);
    const list = payload.LivesList ?? [];
    if (list.length === 0) break;
    collected.push(...list);
  }
  mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify(collected)}\n`);
  return collected;
}

/** Turn raw feed rows into deterministic `news_item` rows. */
function normalize(rawItems) {
  const bySlug = new Map();
  for (const raw of rawItems) {
    const id = String(raw.id ?? raw.newsid ?? "").trim();
    const title = String(raw.title ?? "").trim();
    if (!id || !title) continue;
    const publishedAt = toIsoUtc(raw.showtime);
    if (!publishedAt) continue;
    const slug = toSlug(id, title);
    if (bySlug.has(slug)) continue;
    bySlug.set(slug, {
      id: `news-item-${hash(slug)}`,
      slug,
      title: title.slice(0, 300),
      summary: toSummary(raw.digest, title),
      publishedAt,
      sourceUrl: String(raw.url_w ?? raw.url_unique ?? "").trim(),
      categorySlug: "finance-flash",
      authorName: String(raw.editor_name ?? "").trim() || null,
    });
  }
  return [...bySlug.values()].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt),
  );
}

function renderCatalog() {
  const lines = [
    "-- News category and source dictionaries.",
    "-- Generated by tools/news_item_import.mjs. Do not hand-edit.",
    `-- snapshot: ${SNAPSHOT}`,
    `-- categories: ${CATEGORIES.length}, sources: ${SOURCES.length}`,
    "",
    "INSERT INTO news_category (id, tenant_id, slug, title, description, priority, enabled, created_at, updated_at)",
    "VALUES",
    CATEGORIES.map(
      (category, index) =>
        `    (${sqlText(`news-category-${category.slug}`)}, ${sqlText(TENANT)}, ${sqlText(category.slug)}, ${sqlText(category.title)}, ${sqlNullable(category.description)}, ${category.priority}, TRUE, ${sqlText(SNAPSHOT)}, ${sqlText(SNAPSHOT)})${index === CATEGORIES.length - 1 ? "" : ","}`,
    ).join("\n"),
    "ON CONFLICT (tenant_id, slug) DO UPDATE SET",
    "    title = EXCLUDED.title,",
    "    description = EXCLUDED.description,",
    "    priority = EXCLUDED.priority,",
    "    enabled = EXCLUDED.enabled,",
    "    updated_at = EXCLUDED.updated_at;",
    "",
    "INSERT INTO news_source (",
    "    id, tenant_id, organization_id, slug, title, source_type, trust_tier,",
    "    locale, region, homepage_url, status, created_at, updated_at, version",
    ")",
    "VALUES",
    SOURCES.map(
      (source, index) =>
        `    (${sqlText(`news-source-${source.slug}`)}, ${sqlText(TENANT)}, '0', ${sqlText(source.slug)}, ${sqlText(source.title)}, ${sqlText(source.sourceType)}, ${sqlText(source.trustTier)}, 'zh-CN', 'CN', ${sqlNullable(source.homepageUrl)}, 'active', ${sqlText(SNAPSHOT)}, ${sqlText(SNAPSHOT)}, 0)${index === SOURCES.length - 1 ? "" : ","}`,
    ).join("\n"),
    "ON CONFLICT (tenant_id, slug) DO UPDATE SET",
    "    title = EXCLUDED.title,",
    "    source_type = EXCLUDED.source_type,",
    "    trust_tier = EXCLUDED.trust_tier,",
    "    homepage_url = EXCLUDED.homepage_url,",
    "    status = EXCLUDED.status,",
    "    updated_at = EXCLUDED.updated_at;",
    "",
  ];
  return lines.join("\n");
}

function renderItems(items) {
  const lines = [
    "-- Published finance flash-news items (initialization snapshot).",
    "-- Generated by tools/news_item_import.mjs. Do not hand-edit.",
    `-- source: ${SOURCE_SLUG}`,
    `-- snapshot: ${SNAPSHOT}`,
    `-- rows: ${items.length}`,
    "",
  ];
  if (items.length === 0) return lines.join("\n");
  const chunk = 250;
  for (let offset = 0; offset < items.length; offset += chunk) {
    const slice = items.slice(offset, offset + chunk);
    lines.push(
      "INSERT INTO news_item (",
      "    id, tenant_id, category_id, slug, title, summary, status, author_name,",
      "    featured, priority, estimated_read_minutes, published_at, created_at, updated_at",
      ")",
      "VALUES",
      slice
        .map(
          (item, index) =>
            `    (${sqlText(item.id)}, ${sqlText(TENANT)}, ${sqlText("news-category-finance-flash")}, ${sqlText(item.slug)}, ${sqlText(item.title)}, ${sqlText(item.summary)}, 'published', ${sqlNullable(item.authorName)}, FALSE, 100, 1, ${sqlText(item.publishedAt)}, ${sqlText(SNAPSHOT)}, ${sqlText(SNAPSHOT)})${index === slice.length - 1 ? "" : ","}`,
        )
        .join("\n"),
      "ON CONFLICT (tenant_id, slug) DO UPDATE SET",
      "    title = EXCLUDED.title,",
      "    summary = EXCLUDED.summary,",
      "    status = EXCLUDED.status,",
      "    published_at = EXCLUDED.published_at,",
      "    updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalogSql = renderCatalog();

  if (options.check) {
    for (const [file, expected] of [
      [CATALOG_OUTPUT, catalogSql],
      [ITEMS_OUTPUT, null],
    ]) {
      if (!existsSync(file)) throw new Error(`generated seed missing: ${file}`);
      const actual = readFileSync(file, "utf8");
      if (expected !== null && actual !== expected) {
        throw new Error(`seed is stale: ${path.relative(ROOT, file)}`);
      }
      if (expected === null) {
        const declared = Number(/-- rows: (\d+)/u.exec(actual)?.[1] ?? 0);
        const tuples = (actual.match(/\('news-item-[0-9a-f]{16}'/gu) ?? []).length;
        if (declared !== tuples) {
          throw new Error(`news item count drift declared=${declared} tuples=${tuples}`);
        }
      }
    }
    const items = readFileSync(ITEMS_OUTPUT, "utf8");
    const declared = Number(/-- rows: (\d+)/u.exec(items)?.[1] ?? 0);
    process.stdout.write(`[news_items] check ok items=${declared}\n`);
    return;
  }

  const raw = await fetchPages(options.pages, options);
  const items = normalize(raw);
  const itemsSql = renderItems(items);
  writeFileSync(CATALOG_OUTPUT, catalogSql, "utf8");
  writeFileSync(ITEMS_OUTPUT, itemsSql, "utf8");

  mkdirSync(path.dirname(MANIFEST), { recursive: true });
  writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        kind: "sdkwork.news.item-source",
        generatedAt: SNAPSHOT,
        tenantId: TENANT,
        source: SOURCE_SLUG,
        feed: FEED_BASE,
        pagesRequested: options.pages,
        rawItems: raw.length,
        items: items.length,
        categories: CATEGORIES.length,
        sources: SOURCES.length,
        seedFiles: [
          { path: path.relative(ROOT, CATALOG_OUTPUT).replaceAll(path.sep, "/"), checksum: `sha256:${createHash("sha256").update(catalogSql).digest("hex")}` },
          { path: path.relative(ROOT, ITEMS_OUTPUT).replaceAll(path.sep, "/"), checksum: `sha256:${createHash("sha256").update(itemsSql).digest("hex")}` },
        ],
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(
    `[news_items] wrote ${items.length} items from ${raw.length} raw rows ` +
      `(${CATEGORIES.length} categories, ${SOURCES.length} sources)\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`[news_items] ${error.message}\n`);
  process.exitCode = 1;
});
