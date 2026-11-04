import type {
  Comment,
  CommentResponse,
  CommentsThread,
  CommentsThreadSummaryResponse,
  SdkworkAppClient,
} from "@sdkwork/comments-app-sdk";
import type {
  NewsComment,
  NewsCommentCreateInput,
  NewsCommentPage,
  NewsCommentsListInput,
  NewsCommentsService,
  NewsCommentsSummary,
  NewsCommentsTarget,
  NewsCommentsThread,
} from "@sdkwork/news-comments-service";

export function createSdkworkNewsCommentsService(
  client: SdkworkAppClient,
): NewsCommentsService {
  return {
    async createComment(threadId, input) {
      const response = await client.comments.comments.create(threadId, {
        ...(input.authorName ? { authorName: input.authorName } : {}),
        body: input.body,
        ...(input.parentId ? { parentId: input.parentId } : {}),
      });
      return mapComment(response.comment);
    },

    async deleteComment(commentId) {
      await client.comments.comments.delete(commentId);
    },

    async ensureThread(target) {
      const thread = await client.comments.threads.ensure({
        ownerId: target.id,
        ownerKind: "news-item",
        ...(target.title ? { title: target.title } : {}),
      });
      return mapThread(thread);
    },

    async getEngagement(target) {
      const [summaryResponse, favorites] = await Promise.all([
        client.engagement.targets.retrieve("news-item", target.id),
        client.engagement.favorites.list({
          pageSize: 50,
          targetId: target.id,
          targetKind: "news-item",
        }),
      ]);
      return {
        favorited: favorites.items.some(
          (favorite) =>
            favorite.targetId === target.id
            && favorite.targetKind === "news-item",
        ),
        liked: false,
        summary: {
          favoriteCount: summaryResponse.summary.favoriteCount,
          likeCount: summaryResponse.summary.reactionCounts.like ?? 0,
          visitCount: summaryResponse.summary.visitCount,
        },
        targetId: target.id,
      };
    },

    async getSummary(threadId) {
      return mapSummary(threadId, await client.comments.threads.retrieve(threadId));
    },

    async listComments(threadId, input = {}) {
      const page = input.page ?? 1;
      const pageSize = input.pageSize ?? 10;
      return mapPage(
        await client.comments.comments.list(threadId, {
          page,
          pageSize,
          sort: "newest",
        }),
      );
    },

    async setCommentLike(commentId, liked) {
      if (liked) {
        await client.comments.reactions.update(commentId, "like");
      } else {
        await client.comments.reactions.delete(commentId, "like");
      }
    },

    async setFavorite(target, favorite) {
      if (favorite) {
        await client.engagement.favorites.update("news-item", target.id);
      } else {
        await client.engagement.favorites.delete("news-item", target.id);
      }
    },

    async setTargetLike(target, liked) {
      if (liked) {
        await client.engagement.likes.update("news-item", target.id);
      } else {
        await client.engagement.likes.delete("news-item", target.id);
      }
    },

    async recordVisit(target) {
      await client.engagement.visits.create("news-item", target.id, {
        source: "news-article",
      });
    },
  };
}

function mapComment(comment: Comment): NewsComment {
  return {
    ...(comment.authorAvatarUrl ? { authorAvatarUrl: comment.authorAvatarUrl } : {}),
    authorId: comment.authorId,
    authorName: comment.authorName?.trim() || "读者",
    body: comment.body,
    createdAt: comment.createdAt,
    id: comment.id,
    likeCount: comment.likeCount ?? 0,
    ...(comment.parentId ? { parentId: comment.parentId } : {}),
    ...(comment.quote?.authorName
      ? { quoteAuthorName: comment.quote.authorName }
      : {}),
    replyCount: comment.replyCount ?? 0,
    status: comment.status,
    threadId: comment.threadId,
    viewerLiked: comment.viewerLiked === true,
  };
}

function mapPage(page: {
  items: Comment[];
  pageInfo: {
    page?: number;
    pageSize?: number;
    totalItems?: string;
    totalPages?: number;
    hasMore?: boolean;
  };
}): NewsCommentPage {
  const totalItems = Number(page.pageInfo.totalItems ?? page.items.length);
  const pageNumber = page.pageInfo.page ?? 1;
  const pageSize = page.pageInfo.pageSize ?? 10;
  return {
    hasMore: page.pageInfo.hasMore === true,
    items: page.items.map(mapComment),
    page: pageNumber,
    pageSize,
    totalItems: Number.isFinite(totalItems) ? totalItems : page.items.length,
    totalPages: page.pageInfo.totalPages ?? 1,
  };
}

function mapSummary(
  threadId: string,
  response: CommentsThreadSummaryResponse,
): NewsCommentsSummary {
  return {
    latestActivityAt: response.summary.latestActivityAt,
    publishedCount: response.summary.publishedCount,
    replyCount: response.summary.replyCount,
    threadId,
    totalCount: response.summary.totalCount,
  };
}

function mapThread(thread: CommentsThread): NewsCommentsThread {
  return {
    id: thread.id,
    ownerId: thread.ownerId,
    ownerKind: "news-item",
    ...(thread.title ? { title: thread.title } : {}),
  };
}

export function requireCommentsSdkClient(
  client: SdkworkAppClient | undefined,
): SdkworkAppClient {
  if (!client) {
    throw new Error("Comments service is not configured.");
  }
  return client;
}

export type { CommentResponse, NewsCommentsTarget };
