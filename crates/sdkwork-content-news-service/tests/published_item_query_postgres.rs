//! PostgreSQL regression cover for the published-item read port
//! (`MODULE_SPEC.md` §4.2.6).
//!
//! These tests call the real adapter on a real PostgreSQL in an isolated
//! `search_path` schema, so the published/archived predicates, ordering, limit
//! clamp and tenant scoping are exercised against the actual statement.
//!
//! Requires `SDKWORK_DATABASE_TEST_POSTGRES_URL`; skips cleanly when unset.

use sdkwork_content_news_service::{NewsPublishedItemQueryPort, PublishedNewsItem};
use sqlx::postgres::{PgPool, PgPoolOptions};

fn test_database_url() -> Option<String> {
    std::env::var("SDKWORK_DATABASE_TEST_POSTGRES_URL").ok()
}

async fn news_item_pool(label: &str) -> Option<PgPool> {
    let base = test_database_url()?;
    // Tests in one binary share a PID, so the label must disambiguate them.
    let schema = format!("news_published_port_{}_{}", std::process::id(), label);
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

    let baseline = include_str!("../../../database/ddl/baseline/postgres/0001_news_baseline.sql");
    sqlx::raw_sql(sqlx::AssertSqlSafe(baseline.to_string()))
        .execute(&pool)
        .await
        .expect("apply news baseline");
    Some(pool)
}

/// Seeds the category every `news_item` row needs.
async fn seed_category(pool: &PgPool, tenant_id: &str, category_id: &str) {
    sqlx::query(
        "INSERT INTO news_category (id, tenant_id, slug, title, created_at, updated_at)
         VALUES ($1, $2, $3, $3, '2026-01-01', '2026-01-01')",
    )
    .bind(category_id)
    .bind(tenant_id)
    .bind(format!("{tenant_id}-{category_id}"))
    .execute(pool)
    .await
    .expect("seed news_category");
}

#[allow(clippy::too_many_arguments)]
async fn seed_item(
    pool: &PgPool,
    id: &str,
    tenant_id: &str,
    category_id: &str,
    status: &str,
    priority: i32,
    published_at: Option<&str>,
    archived_at: Option<&str>,
    author_name: Option<&str>,
) {
    sqlx::query(
        "INSERT INTO news_item
            (id, tenant_id, category_id, slug, title, summary, status, author_name,
             featured, priority, estimated_read_minutes, published_at, archived_at,
             created_at, updated_at)
         VALUES ($1, $2, $3, $1, $4, $5, $6, $7, FALSE, $8, 1, $9, $10, '2026-01-01', '2026-01-01')",
    )
    .bind(id)
    .bind(tenant_id)
    .bind(category_id)
    .bind(format!("{id} title"))
    .bind(format!("{id} summary"))
    .bind(status)
    .bind(author_name)
    .bind(priority)
    .bind(published_at)
    .bind(archived_at)
    .execute(pool)
    .await
    .expect("seed news_item");
}

fn item_ids(items: &[PublishedNewsItem]) -> Vec<String> {
    items.iter().map(|item| item.id.clone()).collect()
}

#[tokio::test]
async fn published_only_and_archived_excluded() {
    let Some(pool) = news_item_pool("published_only_and_archived_excluded").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };
    seed_category(&pool, "t1", "cat-1").await;
    seed_item(
        &pool,
        "pub-live",
        "t1",
        "cat-1",
        "published",
        100,
        Some("2026-01-02"),
        None,
        Some("Ada"),
    )
    .await;
    seed_item(
        &pool,
        "draft-item",
        "t1",
        "cat-1",
        "draft",
        1,
        Some("2026-01-03"),
        None,
        None,
    )
    .await;
    seed_item(
        &pool,
        "pub-archived",
        "t1",
        "cat-1",
        "published",
        2,
        Some("2026-01-04"),
        Some("2026-02-01"),
        None,
    )
    .await;
    seed_item(
        &pool,
        "scheduled-item",
        "t1",
        "cat-1",
        "scheduled",
        3,
        Some("2026-01-05"),
        None,
        None,
    )
    .await;

    let items = pool
        .list_published_items("t1", 20)
        .await
        .expect("published query");
    assert_eq!(
        item_ids(&items),
        vec!["pub-live".to_string()],
        "only published, non-archived rows may be returned"
    );
    assert_eq!(items[0].title, "pub-live title");
    assert_eq!(items[0].summary, "pub-live summary");
    assert_eq!(items[0].author_name.as_deref(), Some("Ada"));
    assert!(!items[0].featured);
    assert_eq!(items[0].priority, 100);
    assert_eq!(items[0].published_at, "2026-01-02");
}

#[tokio::test]
async fn orders_by_published_at_desc_then_priority_asc() {
    let Some(pool) = news_item_pool("orders_by_published_at_desc_then_priority_asc").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };
    seed_category(&pool, "t1", "cat-1").await;
    seed_item(
        &pool,
        "newest",
        "t1",
        "cat-1",
        "published",
        50,
        Some("2026-01-03"),
        None,
        None,
    )
    .await;
    seed_item(
        &pool,
        "older-priority-1",
        "t1",
        "cat-1",
        "published",
        1,
        Some("2026-01-02"),
        None,
        None,
    )
    .await;
    seed_item(
        &pool,
        "older-priority-9",
        "t1",
        "cat-1",
        "published",
        9,
        Some("2026-01-02"),
        None,
        None,
    )
    .await;
    seed_item(
        &pool,
        "oldest",
        "t1",
        "cat-1",
        "published",
        0,
        Some("2026-01-01"),
        None,
        None,
    )
    .await;

    let items = pool
        .list_published_items("t1", 20)
        .await
        .expect("published query");
    assert_eq!(
        item_ids(&items),
        vec![
            "newest".to_string(),
            "older-priority-1".to_string(),
            "older-priority-9".to_string(),
            "oldest".to_string(),
        ],
        "published_at DESC, then priority ASC"
    );
}

#[tokio::test]
async fn limit_is_respected() {
    let Some(pool) = news_item_pool("limit_is_respected").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };
    seed_category(&pool, "t1", "cat-1").await;
    for (index, id) in ["one", "two", "three"].iter().enumerate() {
        seed_item(
            &pool,
            id,
            "t1",
            "cat-1",
            "published",
            10,
            Some(&format!("2026-01-0{}", index + 1)),
            None,
            None,
        )
        .await;
    }

    let items = pool
        .list_published_items("t1", 2)
        .await
        .expect("published query");
    assert_eq!(
        item_ids(&items),
        vec!["three".to_string(), "two".to_string()],
        "limit must cap the newest rows only"
    );
}

#[tokio::test]
async fn non_positive_limit_returns_no_rows() {
    let Some(pool) = news_item_pool("non_positive_limit_returns_no_rows").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };
    seed_category(&pool, "t1", "cat-1").await;
    seed_item(
        &pool,
        "pub-live",
        "t1",
        "cat-1",
        "published",
        10,
        Some("2026-01-01"),
        None,
        None,
    )
    .await;

    for limit in [0, -1, -100] {
        assert!(
            pool.list_published_items("t1", limit)
                .await
                .expect("tenant-scoped query")
                .is_empty(),
            "limit {limit} must clamp to no rows"
        );
        assert!(
            pool.list_published_items_public(limit)
                .await
                .expect("public query")
                .is_empty(),
            "public limit {limit} must clamp to no rows"
        );
    }
    assert_eq!(
        pool.list_published_items("t1", 1)
            .await
            .expect("published query")
            .len(),
        1,
        "a positive limit still returns the row"
    );
}

/// The clamp contract does not need a live database: the adapter returns before
/// it touches the pool, so a lazy pool proves the short-circuit.
#[tokio::test]
async fn non_positive_limit_short_circuits_before_connecting() {
    let pool = PgPoolOptions::new()
        .connect_lazy("postgres://news:news@127.0.0.1:1/news")
        .expect("lazy pool");
    for limit in [0, -1, -100] {
        assert!(
            pool.list_published_items("t1", limit)
                .await
                .expect("tenant-scoped query")
                .is_empty(),
            "limit {limit} must clamp to no rows"
        );
        assert!(
            pool.list_published_items_public(limit)
                .await
                .expect("public query")
                .is_empty(),
            "public limit {limit} must clamp to no rows"
        );
    }
}

#[tokio::test]
async fn tenant_scoped_read_cannot_see_other_tenants() {
    let Some(pool) = news_item_pool("tenant_scoped_read_cannot_see_other_tenants").await else {
        eprintln!("skipping: SDKWORK_DATABASE_TEST_POSTGRES_URL is not set");
        return;
    };
    seed_category(&pool, "t1", "cat-1").await;
    seed_category(&pool, "t2", "cat-2").await;
    seed_item(
        &pool,
        "t1-newest",
        "t1",
        "cat-1",
        "published",
        10,
        Some("2026-01-03"),
        None,
        None,
    )
    .await;
    seed_item(
        &pool,
        "t1-oldest",
        "t1",
        "cat-1",
        "published",
        10,
        Some("2026-01-01"),
        None,
        None,
    )
    .await;
    seed_item(
        &pool,
        "t2-only",
        "t2",
        "cat-2",
        "published",
        10,
        Some("2026-01-02"),
        None,
        None,
    )
    .await;

    let t1 = pool.list_published_items("t1", 20).await.expect("t1 query");
    assert_eq!(
        item_ids(&t1),
        vec!["t1-newest".to_string(), "t1-oldest".to_string()],
        "tenant t1 must see only its own rows"
    );
    let t2 = pool.list_published_items("t2", 20).await.expect("t2 query");
    assert_eq!(item_ids(&t2), vec!["t2-only".to_string()]);

    // The public method is the documented cross-tenant projection; its order is
    // the same `published_at DESC, priority ASC` order the scoped method uses.
    let public = pool
        .list_published_items_public(20)
        .await
        .expect("public query");
    assert_eq!(
        public
            .iter()
            .map(|item| item.id.clone())
            .collect::<Vec<_>>(),
        vec![
            "t1-newest".to_string(),
            "t2-only".to_string(),
            "t1-oldest".to_string(),
        ],
        "public projection is cross-tenant but keeps the published ordering"
    );
    let public_t1 = public
        .iter()
        .filter(|item| item.tenant_id == "t1")
        .map(|item| item.id.clone())
        .collect::<Vec<_>>();
    assert_eq!(
        public_t1,
        item_ids(&t1),
        "both methods order the same tenant's rows identically"
    );
}
