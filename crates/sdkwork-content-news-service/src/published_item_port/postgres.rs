//! PostgreSQL implementation of the published-item read port.
//!
//! The implementation lives in the crate that defines the trait: Rust's orphan
//! rule does not allow this implementation of the foreign `sqlx::PgPool` type
//! from another crate, and `MODULE_SPEC.md` §4.2.6 requires the port to be
//! callable with the shared `PgPool` directly.

use async_trait::async_trait;
use sqlx::postgres::{PgPool, PgRow};
use sqlx::Row;

use super::{NewsPublishedItemQueryPort, PublishedNewsItem, PublishedNewsItemView};
use crate::repository_port::{NewsRepositoryError, NewsRepositoryResult};

/// Published news projection shared by the port and the open list route.
///
/// `$1` is the optional tenant filter (`NULL` = public cross-tenant read),
/// `$2` is the row limit.
const PG_PUBLISHED_ITEMS_SQL: &str = r#"
SELECT id, tenant_id, category_id, slug, title, summary, status, author_name,
       featured, priority, estimated_read_minutes, published_at, updated_at
FROM news_item
WHERE ($1::text IS NULL OR tenant_id = $1)
  AND status = 'published'
  AND archived_at IS NULL
ORDER BY published_at DESC, priority ASC
LIMIT $2
"#;

fn repository_error(error: sqlx::Error) -> NewsRepositoryError {
    NewsRepositoryError::new(error.to_string())
}

fn view_from_row(row: &PgRow) -> PublishedNewsItemView {
    PublishedNewsItemView {
        id: row.get::<String, _>("id"),
        tenant_id: row.get::<String, _>("tenant_id"),
        category_id: row.get::<String, _>("category_id"),
        slug: row.get::<String, _>("slug"),
        title: row.get::<String, _>("title"),
        summary: row.get::<String, _>("summary"),
        status: row.get::<String, _>("status"),
        author_name: row.get::<Option<String>, _>("author_name"),
        featured: row.get::<bool, _>("featured"),
        // `news_item.priority` is INTEGER; the port DTO exposes i64.
        priority: i64::from(row.get::<i32, _>("priority")),
        estimated_read_minutes: i64::from(row.get::<i32, _>("estimated_read_minutes")),
        published_at: row.get::<Option<String>, _>("published_at"),
        updated_at: row.get::<String, _>("updated_at"),
    }
}

/// Executes the shared published projection.
///
/// A non-positive `limit` short-circuits to no rows; PostgreSQL rejects a
/// negative `LIMIT` and the port documents "no rows" as the clamp.
async fn fetch_published_item_views(
    pool: &PgPool,
    tenant_id: Option<&str>,
    limit: i64,
) -> NewsRepositoryResult<Vec<PublishedNewsItemView>> {
    if limit <= 0 {
        return Ok(Vec::new());
    }
    let rows = sqlx::query(PG_PUBLISHED_ITEMS_SQL)
        .bind(tenant_id)
        .bind(limit)
        .fetch_all(pool)
        .await
        .map_err(repository_error)?;
    Ok(rows.iter().map(view_from_row).collect())
}

#[async_trait]
impl NewsPublishedItemQueryPort for PgPool {
    async fn list_published_items(
        &self,
        tenant_id: &str,
        limit: i64,
    ) -> NewsRepositoryResult<Vec<PublishedNewsItem>> {
        let views = fetch_published_item_views(self, Some(tenant_id), limit).await?;
        Ok(views
            .into_iter()
            .map(|view| PublishedNewsItem {
                id: view.id,
                title: view.title,
                summary: view.summary,
                author_name: view.author_name,
                featured: view.featured,
                priority: view.priority,
                published_at: view.published_at.unwrap_or_default(),
            })
            .collect())
    }

    async fn list_published_items_public(
        &self,
        limit: i64,
    ) -> NewsRepositoryResult<Vec<PublishedNewsItemView>> {
        fetch_published_item_views(self, None, limit).await
    }
}

#[cfg(test)]
mod tests {
    use super::PG_PUBLISHED_ITEMS_SQL;

    #[test]
    fn published_projection_pins_the_required_predicates_and_order() {
        for fragment in [
            "WHERE ($1::text IS NULL OR tenant_id = $1)",
            "AND status = 'published'",
            "AND archived_at IS NULL",
            "ORDER BY published_at DESC, priority ASC",
            "LIMIT $2",
        ] {
            assert!(
                PG_PUBLISHED_ITEMS_SQL.contains(fragment),
                "published projection lost `{fragment}`"
            );
        }
    }
}
