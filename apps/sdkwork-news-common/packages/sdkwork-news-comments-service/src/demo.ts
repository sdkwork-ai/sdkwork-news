import type {
  NewsComment,
  NewsCommentPage,
  NewsCommentsService,
  NewsCommentsSummary,
  NewsCommentsThread,
  NewsEngagementState,
} from "./contracts.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

interface DemoEngagementState {
  favoriteCount: number;
  favorited: boolean;
  likeCount: number;
  liked: boolean;
  visitCount: number;
}

interface DemoState {
  comments: Map<string, NewsComment[]>;
  engagement: Map<string, DemoEngagementState>;
  threads: Map<string, NewsCommentsThread>;
}

export function createDemoNewsCommentsService(
  source: DemoState = createDemoState(),
): NewsCommentsService {
  return {
    async createComment(threadId, input) {
      const thread = ensureDemoThread(source, threadId);
      const now = new Date().toISOString();
      const comments = source.comments.get(thread.id) ?? [];
      const parent = input.parentId
        ? comments.find((comment) => comment.id === input.parentId)
        : undefined;
      const comment: NewsComment = {
        authorId: "viewer",
        authorName: normalizeAuthor(input.authorName),
        body: normalizeBody(input.body),
        createdAt: now,
        id: `comment-${thread.id}-${Date.now()}-${Math.floor(Math.random() * 1_000)}`,
        likeCount: 0,
        ...(input.parentId ? { parentId: input.parentId } : {}),
        ...(parent ? { quoteAuthorName: parent.authorName } : {}),
        replyCount: 0,
        status: "published",
        threadId: thread.id,
        viewerLiked: false,
      };
      source.comments.set(thread.id, [comment, ...comments]);
      if (input.parentId) {
        source.comments.set(
          thread.id,
          (source.comments.get(thread.id) ?? []).map((entry) =>
            entry.id === input.parentId
              ? { ...entry, replyCount: entry.replyCount + 1 }
              : entry
          ),
        );
      }
      return comment;
    },

    async deleteComment(commentId) {
      for (const [threadId, comments] of source.comments) {
        if (comments.some((comment) => comment.id === commentId)) {
          source.comments.set(
            threadId,
            comments.filter((comment) => comment.id !== commentId),
          );
          return;
        }
      }
    },

    async ensureThread(target) {
      const existing = [...source.threads.values()].find(
        (thread) => thread.ownerId === target.id,
      );
      if (existing) {
        return existing;
      }
      const thread: NewsCommentsThread = {
        id: `news-item:${target.id}`,
        ownerId: target.id,
        ownerKind: "news-item",
        ...(target.title ? { title: target.title } : {}),
      };
      source.threads.set(thread.id, thread);
      source.comments.set(thread.id, createSeedComments(thread.id, target.title));
      return thread;
    },

    async getSummary(threadId) {
      const comments = source.comments.get(threadId) ?? [];
      return summarize(threadId, comments);
    },

    async getEngagement(target) {
      const engagement = ensureDemoEngagement(source, target.id);
      return {
        favorited: engagement.favorited,
        liked: engagement.liked,
        summary: {
          favoriteCount: engagement.favoriteCount,
          likeCount: engagement.likeCount,
          visitCount: engagement.visitCount,
        },
        targetId: target.id,
      } satisfies NewsEngagementState;
    },

    async listComments(threadId, input = {}) {
      const comments = source.comments.get(threadId) ?? [];
      const page = clampInteger(input.page, 1, 10_000);
      const pageSize = clampInteger(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const start = (page - 1) * pageSize;
      const items = comments.slice(start, start + pageSize);
      return {
        hasMore: start + items.length < comments.length,
        items,
        page,
        pageSize,
        totalItems: comments.length,
        totalPages: Math.max(1, Math.ceil(comments.length / pageSize)),
      } satisfies NewsCommentPage;
    },

    async setCommentLike(commentId, liked) {
      for (const [threadId, comments] of source.comments) {
        let found = false;
        const next = comments.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }
          found = true;
          const delta = liked === comment.viewerLiked
            ? 0
            : liked ? 1 : -1;
          return {
            ...comment,
            likeCount: Math.max(0, comment.likeCount + delta),
            viewerLiked: liked,
          };
        });
        if (found) {
          source.comments.set(threadId, next);
          return;
        }
      }
    },

    async setFavorite(target, favorite) {
      const engagement = ensureDemoEngagement(source, target.id);
      if (engagement.favorited === favorite) {
        return;
      }
      engagement.favorited = favorite;
      engagement.favoriteCount = Math.max(
        0,
        engagement.favoriteCount + (favorite ? 1 : -1),
      );
    },

    async setTargetLike(target, liked) {
      const engagement = ensureDemoEngagement(source, target.id);
      if (engagement.liked === liked) {
        return;
      }
      engagement.liked = liked;
      engagement.likeCount = Math.max(
        0,
        engagement.likeCount + (liked ? 1 : -1),
      );
    },

    async recordVisit(target) {
      const engagement = ensureDemoEngagement(source, target.id);
      engagement.visitCount += 1;
    },
  };
}

function createDemoState(): DemoState {
  return { comments: new Map(), engagement: new Map(), threads: new Map() };
}

function ensureDemoEngagement(
  state: DemoState,
  targetId: string,
): DemoEngagementState {
  const existing = state.engagement.get(targetId);
  if (existing) {
    return existing;
  }
  const engagement: DemoEngagementState = {
    favoriteCount: 128,
    favorited: false,
    likeCount: 356,
    liked: false,
    visitCount: 1024,
  };
  state.engagement.set(targetId, engagement);
  return engagement;
}

function ensureDemoThread(
  state: DemoState,
  threadId: string,
): NewsCommentsThread {
  const existing = state.threads.get(threadId);
  if (existing) {
    return existing;
  }
  const thread: NewsCommentsThread = {
    id: threadId,
    ownerId: threadId,
    ownerKind: "news-item",
  };
  state.threads.set(threadId, thread);
  state.comments.set(threadId, createSeedComments(threadId));
  return thread;
}

function createSeedComments(
  threadId: string,
  title?: string,
): NewsComment[] {
  const now = Date.now();
  const topic = title?.includes("智能体") ? "智能体阅读" : "这条资讯";
  return [
    {
      authorId: "seed-1",
      authorName: "周屿",
      body: `关于${topic}，我更关心来源是否可追溯，以及后续有没有持续更新。`,
      createdAt: new Date(now - 18 * 60_000).toISOString(),
      id: `${threadId}-seed-1`,
      likeCount: 24,
      replyCount: 1,
      status: "published",
      threadId,
      viewerLiked: false,
    },
    {
      authorId: "seed-2",
      authorName: "林一",
      body: "摘要里的关键判断很清楚，建议再补一段对行业影响的拆解。",
      createdAt: new Date(now - 46 * 60_000).toISOString(),
      id: `${threadId}-seed-2`,
      likeCount: 12,
      parentId: `${threadId}-seed-1`,
      quoteAuthorName: "周屿",
      replyCount: 0,
      status: "published",
      threadId,
      viewerLiked: true,
    },
    {
      authorId: "seed-3",
      authorName: "陈默",
      body: "这类内容适合加入每日简报，尤其是政策和技术交叉的部分。",
      createdAt: new Date(now - 2 * 3_600_000).toISOString(),
      id: `${threadId}-seed-3`,
      likeCount: 7,
      replyCount: 0,
      status: "published",
      threadId,
      viewerLiked: false,
    },
  ];
}

function summarize(
  threadId: string,
  comments: readonly NewsComment[],
): NewsCommentsSummary {
  return {
    latestActivityAt: comments[0]?.createdAt ?? new Date(0).toISOString(),
    publishedCount: comments.filter((comment) => comment.status === "published").length,
    replyCount: comments.filter((comment) => Boolean(comment.parentId)).length,
    threadId,
    totalCount: comments.length,
  };
}

function normalizeAuthor(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 40) : "我";
}

function normalizeBody(value: string): string {
  return value.replace(/\r\n?/gu, "\n").trim().slice(0, 300);
}

function clampInteger(
  value: number | undefined,
  fallback: number,
  max: number,
): number {
  if (!value || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(1, Math.floor(value)));
}
