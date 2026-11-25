# NEWS Database Module

Canonical lifecycle assets for `sdkwork-news` per `DATABASE_FRAMEWORK_SPEC.md`.

- moduleId: `news`
- serviceCode: `NEWS`
- tablePrefix: `news_`
- contractVersion: `1.1.0` (news.storage.v8, 77 tables)

## Initialization state

This module is in **initialization state** for greenfield deployments:

1. **Baseline** — `database/ddl/baseline/{engine}/0001_news_baseline.sql` contains the full DDL snapshot.
2. **Migrations** — `database/migrations/{engine}/` is reserved for post-GA incremental schema changes only. It is intentionally empty at initialization.
3. **Drift** — run `pnpm db:drift:check` before release.

## Entity linking

The news module owns entity attribution without cross-module foreign keys. The
entity tables are:

| Table | Responsibility |
| --- | --- |
| `news_entity` | registry for `company` / `industry` / `sector` / `instrument` keys, display name and symbol |
| `news_entity_link` | item → entity attribution with role, confidence, extractor version and source checksum |
| `news_entity_feed` | per-entity feed read model for published items, scored and ordered |
| `news_entity_extraction_run` | extraction ledger: items scanned, links/feeds written, start/finish |

`tools/news_entity_link_import.mjs` builds the dictionary from either a committed
JSON fixture or the `sdkwork-company` seeds, matches names/tickers conservatively,
and emits idempotent SQL for the four tables. Chinese names match literally; Latin
names match on word boundaries; one- and two-letter tickers never match bare; the
generic "其他/综合/未分类/Other" titles are excluded.

## Commands

```bash
pnpm run db:validate
pnpm run db:materialize:contract
pnpm run db:entities:check     # fixture entity-link extraction, no database
pnpm run db:entities:import    # company seeds + .cache/news-items.json -> .cache/entity-links.sql
pnpm run db:plan
pnpm run db:init
pnpm run db:migrate
pnpm run db:seed
pnpm run db:status
pnpm run db:drift:check
```
