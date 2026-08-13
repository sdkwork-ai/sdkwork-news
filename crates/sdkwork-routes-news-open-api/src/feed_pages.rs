//! Keyset-paginated feed page queries shared by the open/app/gateway
//! handlers (one implementation instead of four divergent copies).
//!
//! Both feed surfaces return the SdkWork page envelope
//! `{ items, pageInfo: { mode, pageSize, hasMore, nextCursor } }` with
//! opaque keyset cursors (PAGINATION_SPEC cursor mode) — the previous
//! implementations ignored `cursor` and returned bare arrays.

use serde_json::{json, Value};
use sqlx::PgPool;

/// Encodes a keyset position into an opaque cursor string.
fn encode_cursor(featured: Option<bool>, priority: i32, published_at: &str, id: &str) -> String {
    serde_json::json!({
        "featured": featured,
        "priority": priority,
        "published_at": published_at,
        "id": id,
    })
    .to_string()
}

fn decode_cursor(value: Option<&str>) -> Option<(Option<bool>, i32, String, String)> {
    let parsed: Value = serde_json::from_str(value?.trim()).ok()?;
    let id = parsed.get("id")?.as_str()?.to_owned();
    let published_at = parsed.get("published_at")?.as_str()?.to_owned();
    let priority = parsed.get("priority")?.as_i64()? as i32;
    let featured = parsed.get("featured").and_then(|v| v.as_bool());
    Some((featured, priority, published_at, id))
}

fn map_item_row(row: &sqlx::postgres::PgRow) -> Value {
    use sqlx::Row;
    json!({
        "id": row.get::<String, _>("id"),
        "tenantId": row.get::<String, _>("tenant_id"),
        "categoryId": row.get::<String, _>("category_id"),
        "slug": row.get::<String, _>("slug"),
        "title": row.get::<String, _>("title"),
        "summary": row.get::<String, _>("summary"),
        "status": row.get::<String, _>("status"),
        "authorName": row.get::<Option<String>, _>("author_name"),
        "featured": row.get::<bool, _>("featured"),
        "priority": row.get::<i32, _>("priority"),
        "estimatedReadMinutes": row.get::<i32, _>("estimated_read_minutes"),
        "publishedAt": row.get::<Option<String>, _>("published_at"),
        "updatedAt": row.get::<String, _>("updated_at"),
    })
}

fn page_envelope(items: Vec<Value>, next_cursor: Option<String>, page_size: i64, has_more: bool) -> Value {
    json!({
        "items": items,
        "pageInfo": {
            "mode": "cursor",
            "pageSize": page_size,
            "hasMore": has_more,
            "nextCursor": next_cursor,
        },
    })
}

/// Personalized feed: keyset over (featured DESC, priority ASC, published_at DESC, id DESC).
pub async fn list_personalized_feed_page(
    pool: &PgPool,
    cursor: Option<String>,
    limit: i64,
) -> Result<Value, sqlx::Error> {
    let page_size = limit.clamp(1, 100);
    let fetch_size = page_size + 1;
    let (c_featured, c_priority, c_published_at, c_id) = decode_cursor(cursor.as_deref())
        .map(|(f, p, t, id)| (f, p, t, id))
        .unwrap_or((None, 0, String::new(), String::new()));
    let rows = sqlx::query(
        r#"
        SELECT id, tenant_id, category_id, slug, title, summary, status, author_name,
               featured, priority, estimated_read_minutes, published_at, updated_at
        FROM news_item
        WHERE status = 'published' AND deleted_at IS NULL
          AND (
            $1::boolean IS NULL
            OR featured < $1
            OR (featured = $1 AND priority > $2)
            OR (featured = $1 AND priority = $2 AND published_at < $3)
            OR (featured = $1 AND priority = $2 AND published_at = $3 AND id < $4)
          )
        ORDER BY featured DESC, priority ASC, published_at DESC, id DESC
        LIMIT $5
        "#,
    )
    .bind(c_featured)
    .bind(c_priority)
    .bind(&c_published_at)
    .bind(&c_id)
    .bind(fetch_size)
    .fetch_all(pool)
    .await?;
    let has_more = rows.len() as i64 > page_size;
    let items: Vec<Value> = rows.iter().take(page_size as usize).map(map_item_row).collect();
    let next_cursor = if has_more {
        items.last().and_then(|item| {
            Some(encode_cursor(
                item.get("featured").and_then(|v| v.as_bool()),
                item.get("priority").and_then(|v| v.as_i64()).unwrap_or(0) as i32,
                item.get("publishedAt").and_then(|v| v.as_str()).unwrap_or(""),
                item.get("id").and_then(|v| v.as_str()).unwrap_or(""),
            ))
        })
    } else {
        None
    };
    Ok(page_envelope(items, next_cursor, page_size, has_more))
}

/// Channel feed: keyset over (ci.rank ASC, i.published_at DESC, i.id DESC).
pub async fn list_channel_feed_page(
    pool: &PgPool,
    channel_id: &str,
    cursor: Option<String>,
    limit: i64,
) -> Result<Value, sqlx::Error> {
    let page_size = limit.clamp(1, 100);
    let fetch_size = page_size + 1;
    let (c_rank, c_published_at, c_id) = decode_channel_cursor(cursor.as_deref())
        .unwrap_or((i64::MIN, String::new(), String::new()));
    let rows = sqlx::query(
        r#"
        SELECT i.id, i.tenant_id, i.category_id, i.slug, i.title, i.summary,
               i.status, i.author_name, i.featured, i.priority,
               i.estimated_read_minutes, i.published_at, i.updated_at
        FROM news_channel_item ci
        JOIN news_item i ON i.id = ci.item_id
        WHERE ci.channel_id = $1 AND ci.status = 'active' AND i.status = 'published' AND i.deleted_at IS NULL
          AND (
            ci.rank > $2
            OR (ci.rank = $2 AND i.published_at < $3)
            OR (ci.rank = $2 AND i.published_at = $3 AND i.id < $4)
          )
        ORDER BY ci.rank ASC, i.published_at DESC, i.id DESC
        LIMIT $5
        "#,
    )
    .bind(channel_id)
    .bind(c_rank)
    .bind(&c_published_at)
    .bind(&c_id)
    .bind(fetch_size)
    .fetch_all(pool)
    .await?;
    let has_more = rows.len() as i64 > page_size;
    let items: Vec<Value> = rows.iter().take(page_size as usize).map(map_item_row).collect();
    let next_cursor = if has_more {
        items.last().map(|item| {
            json!({
                "rank": item.get("rank").cloned().unwrap_or(Value::Null),
                "published_at": item.get("publishedAt").and_then(|v| v.as_str()).unwrap_or(""),
                "id": item.get("id").and_then(|v| v.as_str()).unwrap_or(""),
            })
            .to_string()
        })
    } else {
        None
    };
    Ok(page_envelope(items, next_cursor, page_size, has_more))
}

fn decode_channel_cursor(value: Option<&str>) -> Option<(i64, String, String)> {
    let parsed: Value = serde_json::from_str(value?.trim()).ok()?;
    let rank = parsed.get("rank").and_then(|v| v.as_i64())?;
    let published_at = parsed.get("published_at")?.as_str()?.to_owned();
    let id = parsed.get("id")?.as_str()?.to_owned();
    Some((rank, published_at, id))
}
