import { describe, expect, it } from "vitest";
import { createDemoNewsCommentsService } from "../src/index.js";

describe("demo news comments service", () => {
  it("pages, creates, likes, and summarizes one article thread", async () => {
    const service = createDemoNewsCommentsService();
    const thread = await service.ensureThread({
      id: "article-1",
      title: "测试资讯",
    });
    const first = await service.listComments(thread.id, { page: 1, pageSize: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.hasMore).toBe(true);

    const created = await service.createComment(thread.id, {
      body: "  新的评论  ",
    });
    expect(created.body).toBe("新的评论");

    await service.setCommentLike(created.id, true);
    const summary = await service.getSummary(thread.id);
    expect(summary.totalCount).toBe(4);
    expect(summary.publishedCount).toBe(4);
  });

  it("keeps article threads isolated", async () => {
    const service = createDemoNewsCommentsService();
    const first = await service.ensureThread({ id: "article-a" });
    const second = await service.ensureThread({ id: "article-b" });
    expect(first.id).not.toBe(second.id);
    const page = await service.listComments(second.id);
    expect(page.items.every((comment) => comment.threadId === second.id)).toBe(true);
  });

  it("persists article favorite, like, and visit engagement", async () => {
    const service = createDemoNewsCommentsService();
    const before = await service.getEngagement({ id: "article-1" });
    expect(before.summary.favoriteCount).toBe(128);
    expect(before.summary.likeCount).toBe(356);

    await service.setFavorite({ id: "article-1" }, true);
    await service.setTargetLike({ id: "article-1" }, true);
    await service.recordVisit({ id: "article-1" });

    const after = await service.getEngagement({ id: "article-1" });
    expect(after.favorited).toBe(true);
    expect(after.liked).toBe(true);
    expect(after.summary).toEqual({
      favoriteCount: 129,
      likeCount: 357,
      visitCount: 1025,
    });

    await service.setFavorite({ id: "article-1" }, false);
    await service.setTargetLike({ id: "article-1" }, false);
    const reset = await service.getEngagement({ id: "article-1" });
    expect(reset.summary.favoriteCount).toBe(128);
    expect(reset.summary.likeCount).toBe(356);
  });
});
