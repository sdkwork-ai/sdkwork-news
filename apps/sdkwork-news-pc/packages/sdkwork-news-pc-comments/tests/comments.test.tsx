import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDemoNewsCommentsService } from "@sdkwork/news-comments-service";
import { NewsPcComments } from "../src/index.js";

describe("NewsPcComments", () => {
  it("renders the comments thread and publishes a reply", async () => {
    const service = createDemoNewsCommentsService();
    render(
      <NewsPcComments
        service={service}
        targetId="article-2"
        targetTitle="全球供应链"
      />,
    );

    expect(await screen.findByText("周屿")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: /回复/ })[0]!);
    fireEvent.change(screen.getByRole("textbox", { name: "评论内容" }), {
      target: { value: "补充一条来源。" },
    });
    fireEvent.click(screen.getByRole("button", { name: /发布评论/ }));

    expect(await screen.findByText("补充一条来源。")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getAllByText(/回复 @周屿/).length).toBeGreaterThan(0);
    });
  });
});
