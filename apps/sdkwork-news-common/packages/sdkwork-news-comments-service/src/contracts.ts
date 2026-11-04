export type NewsCommentStatus =
  | "deleted"
  | "hidden"
  | "pending-review"
  | "published";

export interface NewsCommentsTarget {
  readonly id: string;
  readonly kind?: "news-item";
  readonly title?: string;
}

export interface NewsComment {
  readonly authorAvatarUrl?: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly body: string;
  readonly createdAt: string;
  readonly id: string;
  readonly likeCount: number;
  readonly parentId?: string;
  readonly quoteAuthorName?: string;
  readonly replyCount: number;
  readonly status: NewsCommentStatus;
  readonly threadId: string;
  readonly viewerLiked: boolean;
}

export interface NewsCommentsThread {
  readonly id: string;
  readonly ownerId: string;
  readonly ownerKind: "news-item";
  readonly title?: string;
}

export interface NewsCommentsSummary {
  readonly latestActivityAt: string;
  readonly publishedCount: number;
  readonly replyCount: number;
  readonly threadId: string;
  readonly totalCount: number;
}

export interface NewsCommentPage {
  readonly hasMore: boolean;
  readonly items: readonly NewsComment[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface NewsCommentsListInput {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface NewsCommentCreateInput {
  readonly authorName?: string;
  readonly body: string;
  readonly parentId?: string;
}

export interface NewsCommentsService {
  createComment(
    threadId: string,
    input: NewsCommentCreateInput,
  ): Promise<NewsComment>;
  deleteComment(commentId: string): Promise<void>;
  ensureThread(target: NewsCommentsTarget): Promise<NewsCommentsThread>;
  getEngagement(target: NewsEngagementTarget): Promise<NewsEngagementState>;
  getSummary(threadId: string): Promise<NewsCommentsSummary>;
  listComments(
    threadId: string,
    input?: NewsCommentsListInput,
  ): Promise<NewsCommentPage>;
  recordVisit(target: NewsEngagementTarget): Promise<void>;
  setCommentLike(commentId: string, liked: boolean): Promise<void>;
  setFavorite(target: NewsEngagementTarget, favorite: boolean): Promise<void>;
  setTargetLike(target: NewsEngagementTarget, liked: boolean): Promise<void>;
}

export interface NewsEngagementTarget {
  readonly id: string;
  readonly kind?: "news-item";
}

export interface NewsEngagementSummary {
  readonly favoriteCount: number;
  readonly likeCount: number;
  readonly visitCount: number;
}

export interface NewsEngagementState {
  readonly favorited: boolean;
  readonly liked: boolean;
  readonly summary: NewsEngagementSummary;
  readonly targetId: string;
}

