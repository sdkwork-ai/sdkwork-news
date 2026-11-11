//! In-process published-item read port for sibling modules
//! (`MODULE_SPEC.md` §4.2.6).
//!
//! `sdkwork-feeds` used to read the news module's published set over HTTP. It
//! now reads it in-process on the shared PostgreSQL pool through
//! [`NewsPublishedItemQueryPort`], so the news module owns the projection and
//! the caller never re-implements the SQL.
//!
//! ## Tenant contract
//!
//! There is no ambient request context in this crate, so the tenant is an
//! explicit argument: the caller passes the tenant from **its own** request
//! context. The implementation filters `news_item` by that tenant; a missing or
//! empty tenant is not a wildcard.
//!
//! The news **open** surface is anonymous and public by design — its request
//! context has no principal and therefore no tenant — so it uses the separate
//! [`NewsPublishedItemQueryPort::list_published_items_public`] method, which is
//! cross-tenant on purpose. Callers inside the trust boundary (including
//! `sdkwork-feeds`) must use the tenant-scoped method.
//!
//! ## Shared semantics
//!
//! Both methods return the published set the news open API serves:
//! `status = 'published'` only, `archived_at IS NULL` only, ordered by
//! `published_at DESC, priority ASC`. `limit` is an upper bound. A
//! non-positive `limit` returns no rows: it is the documented minimum rather
//! than a PostgreSQL `LIMIT must not be negative` error.

mod postgres;

use async_trait::async_trait;

use crate::repository_port::NewsRepositoryResult;

/// One published news item, as consumed by `sdkwork-feeds`.
///
/// [`Self::published_at`] is the canonical server form the news open API
/// emits. A legacy published row with a `NULL` `published_at` is projected as
/// an empty string here; the open API's own view keeps the `null`.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PublishedNewsItem {
    /// Stable `news_item.id` — the feeds source id.
    pub id: String,
    /// Display title.
    pub title: String,
    /// Short summary/excerpt; may be empty when the item has none.
    pub summary: String,
    /// Byline when the item records one.
    pub author_name: Option<String>,
    /// Editorial featured flag (the open API's primary rank signal).
    pub featured: bool,
    /// Secondary rank signal; lower values sort first.
    pub priority: i64,
    /// Canonical publication timestamp string.
    pub published_at: String,
}

/// Full published-item projection of the news open API.
///
/// This is a superset of [`PublishedNewsItem`]: the public HTTP `NewsItem`
/// payload also carries the tenant, category, slug, status, read estimate and
/// update time. The open route uses this view so it keeps emitting exactly the
/// same JSON as before while the SQL lives in one place.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PublishedNewsItemView {
    pub id: String,
    pub tenant_id: String,
    pub category_id: String,
    pub slug: String,
    pub title: String,
    pub summary: String,
    pub status: String,
    pub author_name: Option<String>,
    pub featured: bool,
    pub priority: i64,
    pub estimated_read_minutes: i64,
    pub published_at: Option<String>,
    pub updated_at: String,
}

/// In-process read port over the news published set.
///
/// The `sqlx::PgPool` implementation is provided by this crate, so a caller
/// that already holds the shared pool can call the methods directly:
///
/// ```ignore
/// use sdkwork_content_news_service::NewsPublishedItemQueryPort;
///
/// let items = pool.list_published_items(tenant_id, 50).await?;
/// ```
#[async_trait]
pub trait NewsPublishedItemQueryPort {
    /// Tenant-scoped read: published, non-archived items for `tenant_id`,
    /// newest first, then `priority` ascending, capped at `limit`.
    ///
    /// `sdkwork-feeds` calls this with the tenant from its request context. A
    /// non-positive `limit` returns no rows.
    async fn list_published_items(
        &self,
        tenant_id: &str,
        limit: i64,
    ) -> NewsRepositoryResult<Vec<PublishedNewsItem>>;

    /// **Cross-tenant on purpose**: the anonymous public open surface has no
    /// request tenant, so its list route reads the published set across all
    /// tenants. This method exists only so that route and the port share one
    /// SQL statement; callers inside the trust boundary must use
    /// [`Self::list_published_items`] instead.
    ///
    /// Published-only is a deliberate narrowing of the route's `?status=`
    /// parameter: the handler keeps its parameter handling and falls back to
    /// its pre-existing status query only for non-published statuses.
    async fn list_published_items_public(
        &self,
        limit: i64,
    ) -> NewsRepositoryResult<Vec<PublishedNewsItemView>>;
}
