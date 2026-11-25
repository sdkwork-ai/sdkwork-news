use axum::extract::{Path, Query, State};
use axum::Json;
use serde::Deserialize;
use serde_json::{json, Value};
use sqlx::Row;
use std::sync::Arc;

use crate::api_response::{success_cursor_items, success_page};

const ALLOWED_ENTITY_TYPES: [&str; 4] = ["company", "industry", "sector", "instrument"];

#[derive(Deserialize)]
pub struct EntityFeedParams {
    pub cursor: Option<String>,
    pub page_size: Option<i64>,
}

#[derive(Deserialize)]
pub struct EntityEventsParams {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

/// Public corporate-event timeline for one entity.
///
/// Events come from `news_event_link` and are joined back to the published item
/// so a draft or archived story never leaks onto the timeline.
pub async fn list_entity_events(
    State(state): State<Arc<crate::state::NewsHttpState>>,
    Path((entity_type, entity_id)): Path<(String, String)>,
    Query(params): Query<EntityEventsParams>,
) -> Json<Value> {
    let page = params.page.unwrap_or(1).max(1);
    let page_size = params.page_size.unwrap_or(20).clamp(1, 200);
    if !ALLOWED_ENTITY_TYPES.contains(&entity_type.as_str()) {
        return success_page(Vec::new(), page, page_size, 0);
    }
    let offset = (page - 1) * page_size;
    let result = sqlx::query(
        r#"
        SELECT jsonb_build_object(
                   'id', l.id,
                   'itemId', l.item_id,
                   'itemTitle', i.title,
                   'entityType', e.entity_type,
                   'entityKey', e.entity_key,
                   'eventType', l.event_type,
                   'eventDate', l.event_date,
                   'materiality', l.materiality,
                   'confidenceBps', l.confidence_bps,
                   'publishedAt', i.published_at
               ) AS item,
               count(*) OVER() AS total
        FROM news_event_link l
        JOIN news_entity e
          ON e.tenant_id = l.tenant_id
         AND e.id = l.entity_id
        JOIN news_item i
          ON i.tenant_id = l.tenant_id
         AND i.id = l.item_id
        WHERE e.entity_type = $1
          AND e.entity_key = $2
          AND e.status = 'active'
          AND l.status = 'active'
          AND i.status = 'published'
          AND i.archived_at IS NULL
        ORDER BY l.event_date DESC, l.created_at DESC, l.id
        LIMIT $3 OFFSET $4
        "#,
    )
    .bind(&entity_type)
    .bind(&entity_id)
    .bind(page_size)
    .bind(offset)
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(rows) => {
            let total = rows
                .first()
                .map(|row| row.get::<i64, _>("total"))
                .unwrap_or(0);
            let items = rows
                .iter()
                .map(|row| row.get::<Value, _>("item"))
                .collect();
            success_page(items, page, page_size, total)
        }
        Err(error) => {
            tracing::error!("Failed to list entity events: {}", error);
            success_page(Vec::new(), page, page_size, 0)
        }
    }
}

/// Public per-entity news feed read model.
///
/// The entity is addressed by its stable cross-module key (`entity_key`), not by
/// an internal link id. Only published, non-archived items are returned; the
/// feed is ordered by publication time and then by extraction score. The
/// `cursor` is the last returned `published_at`, so the pagination predicate
/// stays a stable keyset scan.
pub async fn list_entity_items(
    State(state): State<Arc<crate::state::NewsHttpState>>,
    Path((entity_type, entity_id)): Path<(String, String)>,
    Query(params): Query<EntityFeedParams>,
) -> Json<Value> {
    let page_size = params.page_size.unwrap_or(20).clamp(1, 200);
    if !ALLOWED_ENTITY_TYPES.contains(&entity_type.as_str()) {
        return success_cursor_items(Vec::new(), page_size, false, None);
    }
    let fetch_limit = page_size + 1;
    let result = sqlx::query(
        r#"
        SELECT i.id, i.tenant_id, i.category_id, i.slug, i.title, i.summary, i.status,
               i.author_name, i.featured, i.priority, i.estimated_read_minutes,
               i.published_at, i.updated_at
        FROM news_entity e
        JOIN news_entity_feed f
          ON f.tenant_id = e.tenant_id
         AND f.entity_id = e.id
        JOIN news_item i
          ON i.tenant_id = f.tenant_id
         AND i.id = f.item_id
        WHERE e.entity_type = $1
          AND e.entity_key = $2
          AND e.status = 'active'
          AND i.status = 'published'
          AND i.archived_at IS NULL
          AND ($3::text IS NULL OR f.published_at < $3)
        ORDER BY f.published_at DESC, f.score_bps DESC, i.id DESC
        LIMIT $4
        "#,
    )
    .bind(&entity_type)
    .bind(&entity_id)
    .bind(params.cursor.as_deref())
    .bind(fetch_limit)
    .fetch_all(&state.pool)
    .await;

    match result {
        Ok(mut rows) => {
            let has_more = rows.len() as i64 > page_size;
            if has_more {
                rows.truncate(page_size as usize);
            }
            let next_cursor = rows
                .last()
                .and_then(|row| row.get::<Option<String>, _>("published_at"));
            let items: Vec<Value> = rows
                .iter()
                .map(|row| {
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
                })
                .collect();
            success_cursor_items(items, page_size, has_more, next_cursor)
        }
        Err(error) => {
            tracing::error!("Failed to list entity news feed: {}", error);
            success_cursor_items(Vec::new(), page_size, false, None)
        }
    }
}
