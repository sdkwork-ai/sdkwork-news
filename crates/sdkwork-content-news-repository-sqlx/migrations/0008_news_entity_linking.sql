-- News entity linking foundation.
--
-- The news archive is the system of record for content; the company / market
-- modules own the entities. This migration adds the polymorphic entity registry,
-- the per-item link table, the feed read model and the extraction run ledger so
-- a news item can be attributed to a company, industry, sector or instrument
-- without a cross-module foreign key.

CREATE TABLE IF NOT EXISTS news_entity (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  entity_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  symbol TEXT,
  display_name TEXT NOT NULL,
  market_code TEXT,
  locale TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata_text TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, entity_type, entity_key)
);

CREATE INDEX IF NOT EXISTS idx_news_entity_type_symbol
  ON news_entity (tenant_id, entity_type, symbol);
CREATE INDEX IF NOT EXISTS idx_news_entity_type_status_name
  ON news_entity (tenant_id, entity_type, status, display_name);

CREATE TABLE IF NOT EXISTS news_entity_link (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  item_id TEXT NOT NULL REFERENCES news_item(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES news_entity(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'mention',
  relevance_bps INTEGER,
  sentiment TEXT,
  confidence_bps INTEGER,
  extractor_version TEXT NOT NULL,
  source_checksum TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, item_id, entity_id, role)
);

CREATE INDEX IF NOT EXISTS idx_news_entity_link_entity_status
  ON news_entity_link (tenant_id, entity_id, status, item_id);
CREATE INDEX IF NOT EXISTS idx_news_entity_link_item_status
  ON news_entity_link (tenant_id, item_id, status);
CREATE INDEX IF NOT EXISTS idx_news_entity_link_extractor
  ON news_entity_link (tenant_id, extractor_version);

CREATE TABLE IF NOT EXISTS news_entity_feed (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  entity_id TEXT NOT NULL REFERENCES news_entity(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  score_bps INTEGER NOT NULL DEFAULT 0,
  materiality TEXT NOT NULL DEFAULT 'medium',
  published_at TEXT,
  computed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, entity_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_news_entity_feed_entity_score
  ON news_entity_feed (tenant_id, entity_id, score_bps DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_entity_feed_item
  ON news_entity_feed (tenant_id, item_id);

CREATE TABLE IF NOT EXISTS news_entity_extraction_run (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  extractor_version TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'running',
  items_scanned INTEGER NOT NULL DEFAULT 0,
  links_written INTEGER NOT NULL DEFAULT 0,
  feeds_written INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_entity_extraction_run_status
  ON news_entity_extraction_run (tenant_id, status, started_at DESC);
