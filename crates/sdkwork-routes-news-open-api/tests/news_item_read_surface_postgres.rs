//! Regression cover for the `news_item` read surface.
//!
//! Every public news read path (open-api / app-api / backend-api) filters the
//! published set with `archived_at IS NULL`. `news_item` has **no** `deleted_at`
//! column — it soft-retires through `archived_at` (see
//! `database/ddl/baseline/postgres/0001_news_baseline.sql`). Any query that
//! reaches for `deleted_at` on this table fails at parse time with
//! `column "deleted_at" does not exist`, which the gateway masks into an opaque
//! `500 errors.result.50001`.
//!
//! These tests call the **real production functions** against a real PostgreSQL
//! in an isolated schema, so reintroducing `deleted_at` turns them red. They
//! deliberately do not re-declare the SQL: a copy of the query under test can
//! never fail when the production query changes.
//!
//! Requires `SDKWORK_DATABASE_TEST_POSTGRES_URL`; skips cleanly when unset.

use sdkwork_routes_news_open_api::feed_pages::{
    list_channel_feed_page, list_personalized_feed_page,
};
use sqlx::postgres::{PgPool, PgPoolOptions};

fn test_database_url() -> Option<String> {
    std::env::var("SDKWORK_DATABASE_TEST_POSTGRES_URL").ok()
}

async fn news_item_pool(label: &str) -> Option<PgPool> {
    let base = test_database_url()?;
    // Tests in one binary share a PID, so the label must disambiguate them.
    let schema = format!("news_read_surface_{}_{}", std::process::id(), label);
    let pool = PgPoolOptions::new()
        .max_connections(2)
        .after_connect({
            let schema = schema.clone();
            move |connection, _| {
                let schema = schema.clone();
                Box::pin(async move {
                    sqlx::query(sqlx::AssertSqlSafe(format!(
                        "SET search_path TO {schema}, public"
                    )))
                    .execute(connection)
                    .await?;
                    Ok(())
                })
            }
        })
        .connect(&base)
        .await
        .expect("connect test postgres");

    sqlx::query(sqlx::AssertSqlSafe(format!(
        "DROP SCHEMA IF EXISTS {schema} CASCADE"
    )))
    .execute(&pool)
    .await
    .expect("drop stale schema");
    sqlx::query(sqlx::AssertSqlSafe(format!("CREATE SCHEMA {schema}")))
        .execute(&pool)
        .await
        .expect("create schema");

    let baseline =
        include_str!("../../../database/ddl/baseline/postgres/0001_news_baseline.sql");
    sqlx::raw_sql(sqlx::AssertSqlSafe(baseline.to_string()))
        .execute(&pool)
        .await
        .expect("apply news baseline");

    // One published, one archived — the two states the filter must separate.
    sqlx::raw_sql(sqlx::AssertSqlSafe(
        r#"
        INSERT INTO news_category (id, tenant_id, slug, title, created_at, updated_at)
        VALUES ('cat-1', '100001', 'general', 'General', '2026-01-01', '2026-01-01');
        INSERT INTO news_item
            (id, tenant_id, category_id, slug, title, summary, status, featured, priority,
             estimated_read_minutes, published_at, archived_at, created_at, updated_at)
        VALUES
            ('item-live', '100001', 'cat-1', 'live', 'Live', 'live summary', 'published',
             FALSE, 100, 1, '2026-01-02', NULL, '2026-01-01', '2026-01-01'),
            ('item-archived', '100001', 'cat-1', 'retired', 'Retired', 'retired summary',
             'published', FALSE, 100, 1, '2026-01-02', '2026-02-01', '2026-01-01', '2026-02-01');
        INSERT INTO news_channel
            (id, tenant_id, slug, title, status, created_at, updated_at)
        VALUES ('chan-1', '100001', 'top', 'Top', 'active', '2026-01-01', '2026-01-01');
        INSERT INTO news_channel_item
            (id, tenant_id, channel_id, item_id, rank, status, created_at, updated_at)
        VALUES
            ('ci-1', '100001', 'chan-1', 'item-live', 1, 'active', '2026-01-01', '2026-01-01'),
            ('ci-2', '100001', 'chan-1', 'item-archived', 2, 'active', '2026-01-01', '2026-01-01');
        "#
        .to_string(),
    ))
    .execute(&pool)
    .await
    .expect("seed news_item");

    Some(pool)
}

fn item_ids(page: &serde_json::Value) -> Vec<String> {
    page["items"]
        .as_array()
        .expect("items array")
        .iter()
        .map(|item| item["id"].as_str().unwrap_or_default().to_string())
        .collect()
}

/// Production: `feed_pages::list_channel_feed_page` (the channel join variant).
///
/// Before the fix this returned `Err(column i.deleted_at does not exist)` and
/// surfaced to the caller as a masked 500.
#[tokio::test]
async fn channel_feed_page_excludes_archived_items() {
    let Some(pool) = news_item_pool("channel_feed_page_excludes_archived_items").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };

    let page = list_channel_feed_page(&pool, "chan-1", None, 20)
        .await
        .expect("channel feed page must execute");

    let ids = item_ids(&page);
    assert_eq!(
        ids,
        vec!["item-live".to_string()],
        "archived item must not be listed in a channel"
    );
}

/// Production: `feed_pages::list_personalized_feed_page`.
#[tokio::test]
async fn personalized_feed_page_excludes_archived_items() {
    let Some(pool) = news_item_pool("personalized_feed_page_excludes_archived_items").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };

    let page = list_personalized_feed_page(&pool, None, 20)
        .await
        .expect("personalized feed page must execute");

    let ids = item_ids(&page);
    assert_eq!(
        ids,
        vec!["item-live".to_string()],
        "archived item must not be listed in the personalized feed"
    );
}

/// The exact defect form: `deleted_at` must never be accepted on `news_item`.
///
/// This test pins the production error text. The two tests above are the real
/// mutation guards; this one documents the failure mode they depend on.
#[tokio::test]
async fn news_item_has_no_deleted_at_column() {
    let Some(pool) = news_item_pool("news_item_has_no_deleted_at_column").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };

    let error = sqlx::query("SELECT id FROM news_item WHERE deleted_at IS NULL")
        .fetch_all(&pool)
        .await
        .expect_err("news_item must not expose deleted_at");

    let rendered = error.to_string();
    assert!(
        rendered.contains("deleted_at") && rendered.contains("does not exist"),
        "expected an undefined-column error, got: {rendered}"
    );

    let columns = sqlx::query(
        "SELECT column_name FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = 'news_item' AND column_name = 'archived_at'",
    )
    .fetch_all(&pool)
    .await
    .expect("read information_schema");
    assert_eq!(columns.len(), 1, "news_item must expose archived_at");
}
