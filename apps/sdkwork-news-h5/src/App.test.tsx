import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

function renderApp() {
  return render(
    <App
      accountDemoMode
      aiStoreDemoMode
      assistantDemoMode
      newsDemoMode
    />,
  );
}

describe("News H5 shell navigation", () => {
  it("opens on the news home and hides the tab bar on assistant conversations", async () => {
    renderApp();

    expect(screen.getByRole("navigation", { name: "主导航" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "新闻分类" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "助手" }));
    fireEvent.click(screen.getByRole("button", { name: /市场雷达/ }));

    await waitFor(() => {
      expect(screen.queryByRole("navigation", { name: "主导航" })).toBeNull();
    });
    fireEvent.click(screen.getByTitle("返回"));

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "主导航" })).toBeTruthy();
    });
  });

  it("hides the tab bar on news details and restores it on back", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", {
      name: "阅读 从信息流到智能体：新闻阅读正在发生结构性变化",
    }));

    await waitFor(() => {
      expect(screen.getByRole("heading", {
        level: 1,
        name: "从信息流到智能体：新闻阅读正在发生结构性变化",
      })).toBeTruthy();
      expect(screen.queryByRole("navigation", { name: "主导航" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "返回新闻列表" }));

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "主导航" })).toBeTruthy();
    });
  });

  it("hides the tab bar on account secondary pages and restores it on back", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "我的" }));
    expect(screen.getByRole("navigation", { name: "主导航" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /通知与提醒/ }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "通知与提醒" })).toBeTruthy();
      expect(screen.queryByRole("navigation", { name: "主导航" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "返回我的" }));
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "主导航" })).toBeTruthy();
    });
  });
});
