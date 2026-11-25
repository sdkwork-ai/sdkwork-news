-- News event linking and extraction-run event counters.
--
-- An item can describe a corporate event (earnings, M&A, IPO, regulatory,
-- dividend, capital action, product launch, management change) for one or more
-- entities. `news_event_link` keeps that attribution beside the entity link so
-- the per-entity feed can later surface a timeline without re-parsing content.

CREATE TABLE IF NOT EXISTS news_event_link (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  organization_id TEXT NOT NULL DEFAULT '0',
  item_id TEXT NOT NULL REFERENCES news_item(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES news_entity(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  materiality TEXT NOT NULL DEFAULT 'medium',
  confidence_bps INTEGER,
  extractor_version TEXT NOT NULL,
  source_checksum TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, item_id, entity_id, event_type, event_date)
);

CREATE INDEX IF NOT EXISTS idx_news_event_link_entity_date
  ON news_event_link (tenant_id, entity_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_event_link_item
  ON news_event_link (tenant_id, item_id);
CREATE INDEX IF NOT EXISTS idx_news_event_link_type_date
  ON news_event_link (tenant_id, event_type, event_date DESC);

ALTER TABLE news_entity_extraction_run
  ADD COLUMN events_written INTEGER NOT NULL DEFAULT 0;

