CREATE TABLE news_user_interest_signal (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  affinity_score INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  UNIQUE (tenant_id, user_id, target_type, target_id)
);



CREATE TABLE news_search_suggestion (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  display_query TEXT NOT NULL,
  suggestion_type TEXT NOT NULL DEFAULT 'hot',
  rank INTEGER NOT NULL DEFAULT 100,
  score INTEGER NOT NULL DEFAULT 0,
  locale TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  computed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, normalized_query, suggestion_type, locale)
);

CREATE TABLE news_search_event (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  normalized_query TEXT NOT NULL,
  display_query TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  clicked_item_id TEXT,
  trace_id TEXT,
  occurred_at TEXT NOT NULL,
  idempotency_key TEXT,
  payload_hash TEXT
);

CREATE INDEX idx_news_user_interest_signal_user_target ON news_user_interest_signal (tenant_id, user_id, status, affinity_score DESC, updated_at DESC);
CREATE INDEX idx_news_search_suggestion_query_rank ON news_search_suggestion (tenant_id, status, normalized_query, rank, score DESC);
CREATE INDEX idx_news_search_event_query_time ON news_search_event (tenant_id, normalized_query, occurred_at DESC);
CREATE INDEX idx_news_search_event_user_time ON news_search_event (tenant_id, user_id, occurred_at DESC);
