# NEWS Database Module

Canonical lifecycle assets for `sdkwork-news` per `DATABASE_FRAMEWORK_SPEC.md`.

- moduleId: `news`
- serviceCode: `NEWS`
- tablePrefix: `news_`
- contractVersion: `1.2.0` (news.storage.v9, 78 tables)

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
| `news_entity_extraction_run` | extraction ledger: items scanned, links/feeds/events written, start/finish |
| `news_event_link` | item → entity corporate event attribution (earnings, M&A, IPO, regulatory, dividend, capital, product, management) |

`tools/news_entity_link_import.mjs` builds the dictionary from either a committed
JSON fixture or the `sdkwork-company` seeds, matches names/tickers conservatively,
and emits idempotent SQL for the entity tables and `news_event_link`. Chinese names
match literally; Latin names match on word boundaries; one- and two-letter tickers
never match bare; the generic "其他/综合/无分类/Other" titles are excluded.

Corporate events are typed from title/summary into a small stable vocabulary:
`earnings`, `merger_acquisition`, `ipo_listing`, `regulatory`, `dividend`,
`capital_action`, `product`, `management_change`. Event links are written only for
company/instrument entities, carry the publication/explicit date, and are reconciled
per scanned item so an extractor-version change cannot leave stale rows.

Public reads expose both the entity feed and its event timeline:

- `GET /open/v3/api/news/entities/{entityType}/{entityId}/items` — published-item feed
- `GET /open/v3/api/news/entities/{entityType}/{entityId}/events` — corporate-event timeline

In addition to fixture mode the tool can scan the live table:

```bash
SDKWORK_DATABASE_* pnpm db:entities:scan
# node tools/news_entity_link_import.mjs --scan-db --limit 500 --apply

SDKWORK_DATABASE_* pnpm db:entities:worker:once   # one scheduled pass
SDKWORK_DATABASE_* pnpm db:entities:worker        # every 300s
# node tools/news_entity_worker.mjs --interval-seconds 300 --limit 500
```

The worker adds bounded failure backoff, `SIGINT`/`SIGTERM` cancellation and
structured pass logs; it does not change the importer's matching or SQL rules.

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
