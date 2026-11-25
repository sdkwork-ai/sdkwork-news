use axum::Json;
use sdkwork_routes_news_open_api::api_response::success_cursor_items;

#[test]
fn entity_feed_success_envelope_has_spec_shape() {
    let Json(value) = success_cursor_items(
        vec![serde_json::json!({ "id": "item_one" })],
        20,
        true,
        Some("2026-11-20T02:00:00Z".to_owned()),
    );
    assert_eq!(value["code"], 0);
    assert_eq!(value["data"]["items"][0]["id"], "item_one");
    assert_eq!(value["data"]["pageInfo"]["mode"], "cursor");
    assert_eq!(value["data"]["pageInfo"]["pageSize"], 20);
    assert_eq!(value["data"]["pageInfo"]["hasMore"], true);
    assert_eq!(
        value["data"]["pageInfo"]["nextCursor"],
        "2026-11-20T02:00:00Z"
    );
    assert!(value["traceId"].as_str().is_some_and(|trace| !trace.is_empty()));
}
