import React from "react";
import ReactDOM from "react-dom/client";
import { createNewsBrowserRuntime } from "@sdkwork/news-runtime";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <StartupScreen />
  </React.StrictMode>,
);

async function bootstrap(): Promise<void> {
  try {
    const runtime = await createNewsBrowserRuntime({
      environment: import.meta.env,
      platform: "WEB",
      storage: window.localStorage,
    });
    root.render(
      <React.StrictMode>
        <App
          accountDemoMode={runtime.account.mode === "demo"}
          accountService={runtime.account.service}
          accountStorage={window.localStorage}
          agentService={runtime.agent.service}
          aiStoreDemoMode={runtime.aiStore.mode === "demo"}
          aiStoreService={runtime.aiStore.service}
          assistantDemoMode={runtime.agent.mode === "demo"}
          commentsService={runtime.comments.service}
          newsDemoMode={runtime.news.mode === "demo"}
          newsService={runtime.news.service}
        />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("SDKWork News PC bootstrap failed.", error);
    root.render(
      <main className="runtime-failure" role="alert">
        <h1>服务暂不可用</h1>
        <p>连接配置未就绪，请稍后重试或联系管理员。</p>
      </main>,
    );
  }
}

function StartupScreen() {
  return (
    <main className="news-startup" aria-live="polite">
      <div className="news-startup__mark">头</div>
      <strong>SDKWork 头条</strong>
      <span>正在加载资讯与个性化频道</span>
      <i aria-hidden="true" />
    </main>
  );
}

void bootstrap();
