-- sdkwork:migration
-- id: 0001_organization_id_not_null
-- engine: postgres
-- module: sdkwork-news
-- purpose: Enforce organization_id NOT NULL DEFAULT on all tables in the
--   consolidated baseline. NULL rows (pre-standard data anomalies) are
--   backfilled with the platform sentinel before NOT NULL is set, and
--   NOT NULL columns without an explicit default receive the sentinel
--   default, keeping existing deployments consistent with fresh baseline
--   installs.
-- reversible: false
-- rollback: forward-fix (sentinel backfill is the canonical fix; NULL
--   organization rows are data anomalies)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 30s

BEGIN;

ALTER TABLE news_source ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_source SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_source ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_source ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE news_author ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_author SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_author ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_author ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE news_media_asset ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_media_asset SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_media_asset ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_media_asset ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE news_topic ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_topic SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_topic ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_topic ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE news_channel ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_channel SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_channel ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_channel ALTER COLUMN organization_id SET NOT NULL;


ALTER TABLE news_breaking_alert ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_breaking_alert SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_breaking_alert ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_breaking_alert ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE news_live_event ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_live_event SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_live_event ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_live_event ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE news_story ADD COLUMN IF NOT EXISTS organization_id TEXT NOT NULL DEFAULT '0';
UPDATE news_story SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE news_story ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE news_story ALTER COLUMN organization_id SET NOT NULL;

COMMIT;
