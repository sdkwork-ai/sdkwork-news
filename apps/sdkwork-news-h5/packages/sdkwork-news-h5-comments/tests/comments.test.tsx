import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDemoNewsCommentsService } from "@sdkwork/news-comments-service";
import { NewsH5Comments } from "../src/index.js";

describe("NewsH5Comments", () => {
  it("loads the thread, submits a comment, and likes it", async () => {
    const service = createDemoNewsCommentsService();
    render(
      <NewsH5Comments
        service={service}
        targetId="article-1"
        targetTitle="AI 与新闻阅读"
      />,
    );

    expect(await screen.findByText("周屿")).toBeTruthy();
    expect(screen.getByText("评论")).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "评论内容" }), {
      target: { value: "这是一条新的判断。" },
    });
    fireEvent.click(screen.getByRole("button", { name: /发布/ }));

    expect(await screen.findByText("这是一条新的判断。")).toBeTruthy();

    const firstComment = screen.getByText("周屿").closest("article");
    expect(firstComment).not.toBeNull();
    fireEvent.click(within(firstComment!).getByRole("button", { name: "24" }));
    await waitFor(() => {
      expect(within(firstComment!).getByText("25")).toBeTruthy();
    });
  });
});
