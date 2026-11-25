//! End-to-end regression for the public per-entity news feed.
//!
//! Requires `SDKWORK_DATABASE_TEST_POSTGRES_URL`; skips cleanly when unset. The
//! test applies the full news baseline in an isolated schema, inserts two
//! published items plus one archived item, then calls the real handler so the
//! keyset predicate, archived filter and cursor contract are exercised together.

use axum::extract::{Path, Query, State};
use sdkwork_routes_news_open_api::handlers::entity::{list_entity_items, EntityFeedParams};
use sdkwork_routes_news_open_api::state::NewsHttpState;
use sqlx::postgres::{PgPool, PgPoolOptions};
use std::sync::Arc;

fn test_database_url() -> Option<String> {
    std::env::var("SDKWORK_DATABASE_TEST_POSTGRES_URL").ok()
}

async fn entity_pool(label: &str) -> Option<PgPool> {
    let base = test_database_url()?;
    let schema = format!("news_entity_feed_{}_{}", std::process::id(), label);
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

    sqlx::raw_sql(sqlx::AssertSqlSafe(
        r#"
        INSERT INTO news_category (id, tenant_id, slug, title, created_at, updated_at)
        VALUES ('cat-entity', '100001', 'entity', 'Entity', '2026-01-01', '2026-01-01');

        INSERT INTO news_item
            (id, tenant_id, category_id, slug, title, summary, status, featured, priority,
             estimated_read_minutes, published_at, archived_at, created_at, updated_at)
        VALUES
            ('item-new', '100001', 'cat-entity', 'new', 'New item', 'new', 'published',
             FALSE, 100, 1, '2026-01-03', NULL, '2026-01-01', '2026-01-01'),
            ('item-old', '100001', 'cat-entity', 'old', 'Old item', 'old', 'published',
             FALSE, 100, 1, '2026-01-02', NULL, '2026-01-01', '2026-01-01'),
            ('item-archived', '100001', 'cat-entity', 'archived', 'Archived', 'archived',
             'published', FALSE, 100, 1, '2026-01-04', '2026-01-05', '2026-01-01', '2026-01-01');

        INSERT INTO news_entity
            (id, tenant_id, organization_id, entity_type, entity_key, symbol, display_name,
             status, metadata_text, created_at, updated_at)
        VALUES
            ('entity-company-x', '100001', '0', 'company', 'company-x', 'X', 'X Corp',
             'active', '{}', '2026-01-01', '2026-01-01');

        INSERT INTO news_entity_feed
            (id, tenant_id, organization_id, entity_id, item_id, score_bps, materiality,
             published_at, computed_at, created_at, updated_at)
        VALUES
            ('feed-new', '100001', '0', 'entity-company-x', 'item-new', 9000, 'high',
             '2026-01-03', '2026-01-03', '2026-01-03', '2026-01-03'),
            ('feed-old', '100001', '0', 'entity-company-x', 'item-old', 8000, 'medium',
             '2026-01-02', '2026-01-02', '2026-01-02', '2026-01-02'),
            ('feed-archived', '100001', '0', 'entity-company-x', 'item-archived', 9500, 'high',
             '2026-01-04', '2026-01-04', '2026-01-04', '2026-01-04');
        "#,
    ))
    .execute(&pool)
    .await
    .expect("seed entity feed");

    Some(pool)
}

#[tokio::test]
async fn entity_feed_pages_by_cursor_and_excludes_archived_items() {
    let Some(pool) = entity_pool("feed").await else {
        return;
    };
    let state = Arc::new(NewsHttpState { pool });

    let axum::Json(first) = list_entity_items(
        State(state.clone()),
        Path(("company".to_owned(), "company-x".to_owned())),
        Query(EntityFeedParams {
            cursor: None,
            page_size: Some(1),
        }),
    )
    .await;
    assert_eq!(first["code"], 0);
    assert_eq!(first["data"]["items"].as_array().unwrap().len(), 1);
    assert_eq!(first["data"]["items"][0]["id"], "item-new");
    assert_eq!(first["data"]["pageInfo"]["hasMore"], true);
    let cursor = first["data"]["pageInfo"]["nextCursor"].as_str().unwrap();

    let axum::Json(second) = list_entity_items(
        State(state.clone()),
        Path(("company".to_owned(), "company-x".to_owned())),
        Query(EntityFeedParams {
            cursor: Some(cursor.to_owned()),
            page_size: Some(1),
        }),
    )
    .await;
    assert_eq!(second["data"]["items"][0]["id"], "item-old");
    assert_eq!(second["data"]["pageInfo"]["hasMore"], false);

    let axum::Json(unknown) = list_entity_items(
        State(state),
        Path(("unknown".to_owned(), "company-x".to_owned())),
        Query(EntityFeedParams {
            cursor: None,
            page_size: Some(10),
        }),
    )
    .await;
    assert_eq!(unknown["data"]["items"].as_array().unwrap().len(), 0);
}
