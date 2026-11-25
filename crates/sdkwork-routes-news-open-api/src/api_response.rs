use axum::Json;
use serde_json::{json, Value};

/// Success envelope for an offset-paged list.
pub fn success_page(items: Vec<Value>, page: i64, page_size: i64, total: i64) -> Json<Value> {
    let total_pages = if page_size <= 0 {
        0
    } else {
        (total + page_size - 1) / page_size
    };
    Json(json!({
        "code": 0,
        "data": {
            "items": items,
            "pageInfo": {
                "mode": "offset",
                "page": page,
                "pageSize": page_size,
                "totalItems": total.to_string(),
                "totalPages": total_pages,
                "hasMore": page < total_pages,
            },
        },
        "traceId": uuid::Uuid::new_v4().to_string(),
    }))
}

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
