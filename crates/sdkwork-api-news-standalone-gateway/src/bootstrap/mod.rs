use axum::Router;
use sdkwork_web_bootstrap::{ApiModuleRegistry, infra_public_path_prefixes};
use tower_http::trace::TraceLayer;

use sdkwork_api_news_assembly::assemble_api_router;
use sdkwork_iam_web_adapter::{
    build_web_framework_builder, iam_web_request_context_resolver_from_env,
};

pub async fn create_app() -> Result<Router, anyhow::Error> {
    let _ = dotenvy::dotenv();

    let assembly = assemble_api_router().await.map_err(anyhow::Error::msg)?;
    let framework = build_web_framework_builder(
        iam_web_request_context_resolver_from_env().await,
        assembly.route_manifest.clone(),
        infra_public_path_prefixes(),
    );
    let mut module_registry = ApiModuleRegistry::new();
    module_registry.add_modules(vec![assembly]);
    let hosted = module_registry
        .try_compose("SDKWork News API")
        .map_err(anyhow::Error::msg)?
        .into_hosted(framework);
    Ok(hosted
        .router
        .layer(sdkwork_web_bootstrap::application_cors_layer_from_env(
            &["SDKWORK_NEWS_ENVIRONMENT"],
            &["SDKWORK_CORS_ALLOWED_ORIGINS"],
        ))
        .layer(TraceLayer::new_for_http()))
}
