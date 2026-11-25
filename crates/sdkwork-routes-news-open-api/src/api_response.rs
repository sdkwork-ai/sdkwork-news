use axum::Json;
use serde_json::{json, Value};

/// Success envelope for a cursor-paged list (`API_SPEC.md` §4.5 / §15):
/// `{ code: 0, data: { items, pageInfo }, traceId }`.
pub fn success_cursor_items(
    items: Vec<Value>,
    page_size: i64,
    has_more: bool,
    next_cursor: Option<String>,
) -> Json<Value> {
    Json(json!({
        "code": 0,
        "data": {
            "items": items,
            "pageInfo": {
                "mode": "cursor",
                "pageSize": page_size,
                "hasMore": has_more,
                "nextCursor": next_cursor,
            },
        },
        "traceId": uuid::Uuid::new_v4().to_string(),
    }))
}
