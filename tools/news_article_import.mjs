#!/usr/bin/env node
/**
 * Article news importer.
 *
 * The flash feed holds one-line items whose "body" is the digest, so `news_item_body`
 * stayed empty and the entity linker only ever saw ~600 characters per item. The
 * column article feed publishes real articles: a 165-character summary backed by a
 * ~2,400-character body that names many issuers the flash feed never mentions.
 *
 * This importer reads the column list, fetches each article page, extracts the body,
 * and emits two seeds: the items and their bodies. Bodies are what let the linker
 * corroborate a mention instead of guessing.
 *
 * Usage:
 *   node tools/news_article_import.mjs
 *   node tools/news_article_import.mjs --pages 20 --offline
 *   node tools/news_article_import.mjs --check
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED_DIR = path.join(ROOT, "database", "seeds", "common");
const ITEMS_OUTPUT = path.join(SEED_DIR, "004_news_articles.sql");
const BODIES_OUTPUT = path.join(SEED_DIR, "005_news_article_bodies.sql");
const CACHE_DIR = path.join(ROOT, ".cache", "news-articles");
const MANIFEST = path.join(ROOT, "database", "imports", "news-articles", "source.manifest.json");

const TENANT = "100001";
const SNAPSHOT = "2026-11-28T00:00:00Z";
const LIST_ENDPOINT = "https://np-listapi.eastmoney.com/comm/web/getNewsByColumns";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  Referer: "https://finance.eastmoney.com/",
};

/**
 * Column ids mapped to the news category each one feeds. Only columns whose content
 * is market/company news are used; opinion and lifestyle columns are out of scope.
 */
const COLUMNS = [
  { id: "345", category: "markets", label: "全球市场" },
  { id: "346", category: "markets", label: "A股市场" },
  { id: "347", category: "company", label: "公司新闻" },
  { id: "348", category: "markets", label: "港股市场" },
  { id: "349", category: "markets", label: "美股市场" },
];

const DEFAULT_PAGES = 12;
const PAGE_SIZE = 50;
const MAX_ATTEMPTS = 5;
const RETRY_BASE_MS = 900;
const PAGE_INTERVAL_MS = 150;
/** Bodies are truncated to keep the seed readable; 4,000 characters covers the lead. */
const BODY_LIMIT = 4000;

function parseArgs(argv) {
  const options = { pages: DEFAULT_PAGES, offline: false, check: false, refresh: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--pages") options.pages = Number(argv[++index] ?? DEFAULT_PAGES);
    else if (token === "--offline") options.offline = true;
    else if (token === "--check") options.check = true;
    else if (token === "--refresh") options.refresh = true;
  }
  if (!Number.isInteger(options.pages) || options.pages < 1) {
    throw new Error("--pages must be a positive integer");
  }
  return options;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hash(value) {
  return createHash("sha1").update(String(value)).digest("hex").slice(0, 16);
}

function sqlText(value) {
  return `'${String(value ?? "").replace(/'/gu, "''")}'`;
}

function sqlOptional(value) {
  if (value === null || value === undefined) return "NULL";
  const text = String(value).trim();
  return text === "" ? "NULL" : sqlText(text);
}

async function withRetry(label, operation) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(Math.min(RETRY_BASE_MS * 2 ** (attempt - 1), 12000));
      }
    }
  }
  throw new Error(`${label}: ${lastError?.message ?? "unknown"}`);
}

/** Extract the article body from a rendered article page. */
function extractBody(html) {
  const containers = [
    /<div[^>]+id="ContentBody"[^>]*>([\s\S]*?)<\/div>/gu,
    /<div[^>]+class="txtinfos"[^>]*>([\s\S]*?)<\/div>/gu,
    /<article[^>]*>([\s\S]*?)<\/article>/gu,
  ];
  let best = "";
  for (const pattern of containers) {
    for (const match of html.matchAll(pattern)) {
      const text = match[1]
        .replace(/<script[\s\S]*?<\/script>/gu, " ")
        .replace(/<style[\s\S]*?<\/style>/gu, " ")
        .replace(/<[^>]+>/gu, " ")
        .replace(/&nbsp;/gu, " ")
        .replace(/&amp;/gu, "&")
        .replace(/&lt;/gu, "<")
        .replace(/&gt;/gu, ">")
        .replace(/&quot;/gu, '"')
        .replace(/\s+/gu, " ")
        .trim();
      // Keep the longest candidate: a short match is a label or an attribution line.
      if (text.length > best.length) best = text;
    }
  }
  return best;
}

async function fetchListPage(column, page, options) {
  const cachePath = path.join(CACHE_DIR, `list-${column}-${page}.json`);
  if (!options.refresh && existsSync(cachePath)) {
    try {
      return JSON.parse(readFileSync(cachePath, "utf8"));
    } catch {
      // fall through to fetch
    }
  }
  if (options.offline) {
    throw new Error(`offline cache miss for column ${column} page ${page}`);
  }
  const url =
    `${LIST_ENDPOINT}?client=web&biz=web_news_col&column=${column}` +
    `&order=1&needInteractData=0&page_index=${page}&page_size=${PAGE_SIZE}&req_trace=1`;
  const rows = await withRetry(`list ${column}/${page}`, async () => {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload?.data?.list ?? [];
  });
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, `${JSON.stringify(rows)}\n`);
  return rows;
}

async function fetchArticleBody(url, code, options) {
  const cachePath = path.join(CACHE_DIR, `body-${code}.txt`);
  if (!options.refresh && existsSync(cachePath)) {
    return readFileSync(cachePath, "utf8");
  }
  if (options.offline) {
    throw new Error(`offline cache miss for article ${code}`);
  }
  const body = await withRetry(`article ${code}`, async () => {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return extractBody(await response.text());
  });
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, body);
  return body;
}

function renderItems(articles) {
  const lines = [
    "-- Published article news (initialization snapshot).",
    "-- Generated by tools/news_article_import.mjs. Do not hand-edit.",
    `-- snapshot: ${SNAPSHOT}`,
    "-- source: eastmoney-column-articles",
    `-- rows: ${articles.length}`,
    "",
  ];
  const chunk = 100;
  for (let offset = 0; offset < articles.length; offset += chunk) {
    const slice = articles.slice(offset, offset + chunk);
    lines.push(
      "INSERT INTO news_item (",
      "  id, tenant_id, category_id, slug, title, summary, status, author_name,",
      "  featured, priority, estimated_read_minutes, published_at, created_at, updated_at",
      ")",
      "VALUES",
      slice
        .map(
          (row, index) =>
            `  (${sqlText(row.id)}, ${sqlText(TENANT)}, ${sqlText(row.categoryId)}, ` +
            `${sqlText(row.slug)}, ${sqlText(row.title)}, ${sqlText(row.summary)}, 'published', ` +
            `${sqlOptional(row.authorName)}, FALSE, 100, ${row.readMinutes}, ` +
            `${sqlOptional(row.publishedAt)}, ${sqlText(SNAPSHOT)}, ${sqlText(SNAPSHOT)})` +
            `${index === slice.length - 1 ? "" : ","}`,
        )
        .join("\n"),
      "ON CONFLICT (tenant_id, slug) DO UPDATE SET",
      "  title = EXCLUDED.title,",
      "  summary = EXCLUDED.summary,",
      "  author_name = EXCLUDED.author_name,",
      "  estimated_read_minutes = EXCLUDED.estimated_read_minutes,",
      "  published_at = EXCLUDED.published_at,",
      "  updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  return lines.join("\n");
}

function renderBodies(articles) {
  const lines = [
    "-- Article bodies backing the article news items.",
    "-- Generated by tools/news_article_import.mjs. Do not hand-edit.",
    `-- rows: ${articles.length}`,
    "",
  ];
  const chunk = 100;
  for (let offset = 0; offset < articles.length; offset += chunk) {
    const slice = articles.slice(offset, offset + chunk);
    lines.push(
      "INSERT INTO news_item_body (item_id, body_markdown, body_format, content_checksum, updated_at)",
      "VALUES",
      slice
        .map(
          (row, index) =>
            `  (${sqlText(row.id)}, ${sqlText(row.body)}, 'plaintext', ` +
            `${sqlText(`sha256:${createHash("sha256").update(row.body).digest("hex")}`)}, ` +
            `${sqlText(SNAPSHOT)})${index === slice.length - 1 ? "" : ","}`,
        )
        .join("\n"),
      "ON CONFLICT (item_id) DO UPDATE SET",
      "  body_markdown = EXCLUDED.body_markdown,",
      "  content_checksum = EXCLUDED.content_checksum,",
      "  updated_at = EXCLUDED.updated_at;",
      "",
    );
  }
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.check) {
    for (const file of [ITEMS_OUTPUT, BODIES_OUTPUT]) {
      if (!existsSync(file)) throw new Error(`generated seed missing: ${file}`);
    }
    const items = readFileSync(ITEMS_OUTPUT, "utf8");
    const bodies = readFileSync(BODIES_OUTPUT, "utf8");
    const declaredItems = Number(/-- rows: (\d+)/u.exec(items)?.[1] ?? -1);
    const declaredBodies = Number(/-- rows: (\d+)/u.exec(bodies)?.[1] ?? -1);
    const itemTuples = (items.match(/\('news-item-[0-9a-f]{16}'/gu) ?? []).length;
    const bodyTuples = (bodies.match(/\('news-item-[0-9a-f]{16}'/gu) ?? []).length;
    if (declaredItems !== itemTuples) {
      throw new Error(`article item count drift declared=${declaredItems} tuples=${itemTuples}`);
    }
    if (declaredBodies !== bodyTuples) {
      throw new Error(`article body count drift declared=${declaredBodies} tuples=${bodyTuples}`);
    }
    if (declaredItems !== declaredBodies) {
      throw new Error(`article items and bodies disagree: ${declaredItems} vs ${declaredBodies}`);
    }
    process.stdout.write(`[news_articles] check ok items=${declaredItems} bodies=${declaredBodies}\n`);
    return;
  }

  const seen = new Set();
  const articles = [];
  let fetched = 0;
  let withoutBody = 0;

  for (const column of COLUMNS) {
    for (let page = 1; page <= options.pages; page += 1) {
      await sleep(PAGE_INTERVAL_MS);
      const rows = await fetchListPage(column.id, page, options);
      if (rows.length === 0) break;
      for (const row of rows) {
        const code = String(row.code ?? "").trim();
        const url = String(row.uniqueUrl ?? row.url ?? "").trim();
        const title = String(row.title ?? "").trim();
        if (!code || !url || !title) continue;
        if (seen.has(code)) continue;
        seen.add(code);

        let body = "";
        try {
          body = await fetchArticleBody(url, code, options);
        } catch (error) {
          withoutBody += 1;
          process.stderr.write(`[news_articles] ${error.message}\n`);
        }
        fetched += 1;
        if (fetched % 100 === 0) {
          process.stderr.write(`[news_articles] fetched=${fetched} withBody=${articles.length}\n`);
        }
        const summary = String(row.summary ?? "").trim().slice(0, 600);
        // A body shorter than the summary means extraction picked up a label or the
        // attribution line; fall back to the summary rather than publish a stub.
        if (body.trim().length < summary.length) {
          body = summary;
        }
        body = body.slice(0, BODY_LIMIT);
        const published = String(row.showTime ?? "").trim().replace(" ", "T");
        articles.push({
          id: `news-item-${hash(`article|${code}`)}`,
          slug: `article-${code}`,
          categoryId: `news-category-${column.category}`,
          title,
          summary: summary || title,
          authorName: String(row.mediaName ?? "").trim(),
          body: body || summary || title,
          readMinutes: Math.max(1, Math.round((body.length || summary.length) / 400)),
          publishedAt: published ? `${published}Z` : null,
        });
      }
    }
  }

  if (articles.length === 0) {
    throw new Error(
      "no articles were collected; refusing to overwrite the existing seed " +
        "(run without --offline to populate the cache)",
    );
  }

  articles.sort(
    (left, right) =>
      String(right.publishedAt ?? "").localeCompare(String(left.publishedAt ?? "")) ||
      left.id.localeCompare(right.id),
  );

  writeFileSync(ITEMS_OUTPUT, renderItems(articles), "utf8");
  writeFileSync(BODIES_OUTPUT, renderBodies(articles), "utf8");

  mkdirSync(path.dirname(MANIFEST), { recursive: true });
  writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        kind: "sdkwork.news.article-source",
        generatedAt: SNAPSHOT,
        tenantId: TENANT,
        source: "eastmoney-column-articles",
        url: LIST_ENDPOINT,
        columns: COLUMNS.map((column) => ({ id: column.id, category: column.category })),
        pagesPerColumn: options.pages,
        articles: articles.length,
        articlesWithoutBody: withoutBody,
        averageBodyLength: Math.round(
          articles.reduce((sum, article) => sum + article.body.length, 0) / articles.length,
        ),
        seedFiles: [ITEMS_OUTPUT, BODIES_OUTPUT].map((file) =>
          path.relative(ROOT, file).replaceAll(path.sep, "/"),
        ),
      },
      null,
      2,
    )}\n`,
  );

  process.stdout.write(
    `[news_articles] wrote ${articles.length} articles ` +
      `(${withoutBody} without a body, avg body ${Math.round(
        articles.reduce((sum, article) => sum + article.body.length, 0) / articles.length,
      )} chars)\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`[news_articles] ${error.message}\n`);
    process.exitCode = 1;
  });
}
