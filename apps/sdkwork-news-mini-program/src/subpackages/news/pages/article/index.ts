import type {
  NewsComment,
  NewsCommentsSummary,
  NewsEngagementSummary,
} from "@sdkwork/news-comments-service";
import { toArticleView, type NewsArticleView } from "@sdkwork/news-mp-news";

import { getNewsMiniProgramRuntime } from "../../../../bootstrap/runtime.js";

const SAVED_KEY = "sdkwork.news.saved.v1";
const COMMENT_PAGE_SIZE = 8;

interface CommentView {
  authorName: string;
  avatarText: string;
  body: string;
  id: string;
  likeCount: number;
  parentId?: string;
  quoteAuthorName?: string;
  timeLabel: string;
  viewerLiked: boolean;
}

interface ArticlePageData {
  article?: NewsArticleView;
  commentHasMore: boolean;
  commentInput: string;
  commentPage: number;
  commentReplyTo?: { id: string; name: string };
  comments: readonly CommentView[];
  commentsError: string;
  commentsLoading: boolean;
  commentSubmitting: boolean;
  commentsSummary?: NewsCommentsSummary;
  commentThreadId?: string;
  engagementSummary?: NewsEngagementSummary;
  errorMessage: string;
  favoritePending: boolean;
  isLargeText: boolean;
  liked: boolean;
  likePending: boolean;
  loading: boolean;
  saved: boolean;
  statusBarHeight: number;
}

interface ArticlePageContext {
  data: ArticlePageData;
  setData(data: Partial<ArticlePageData>): void;
}

interface ArticlePageConfig {
  data: ArticlePageData;
  onLoad(this: ArticlePageContext, options: Record<string, string | undefined>): void;
  cancelCommentReply(this: ArticlePageContext): void;
  feedback(this: ArticlePageContext): void;
  goBack(this: ArticlePageContext): void;
  loadMoreComments(this: ArticlePageContext): void;
  onCommentInput(this: ArticlePageContext, event: WeixinInputEvent): void;
  onShareAppMessage(): { path: string; title: string };
  replyToComment(this: ArticlePageContext, event: WeixinEvent): void;
  share(this: ArticlePageContext): void;
  submitComment(this: ArticlePageContext): void;
  toggleCommentLike(this: ArticlePageContext, event: WeixinEvent): void;
  toggleArticleLike(this: ArticlePageContext): void;
  toggleFont(this: ArticlePageContext): void;
  toggleSave(this: ArticlePageContext): void;
}

interface WeixinInputEvent {
  detail: { value: string };
}

interface WeixinEvent {
  currentTarget: { dataset: Record<string, string | undefined> };
}

Page<ArticlePageConfig>({
  data: {
    commentHasMore: false,
    commentInput: "",
    commentPage: 1,
    comments: [],
    commentsError: "",
    commentsLoading: true,
    commentSubmitting: false,
    errorMessage: "",
    favoritePending: false,
    isLargeText: false,
    liked: false,
    likePending: false,
    loading: true,
    saved: false,
    statusBarHeight: 24,
  },

  onLoad(this: ArticlePageContext, options: Record<string, string | undefined>) {
    const runtime = getNewsMiniProgramRuntime();
    this.setData({ statusBarHeight: runtime.host.statusBarHeight() });
    const id = options.id;
    if (!id) {
      this.setData({ errorMessage: "缺少资讯编号", loading: false });
      return;
    }
    void loadArticle(this, id);
    void loadComments(this, id);
    void loadEngagement(this, id);
  },

  cancelCommentReply() {
    this.setData({ commentReplyTo: undefined });
  },

  feedback() {
    void getNewsMiniProgramRuntime().host.showToast("已记录，将优化后续推荐");
  },

  goBack() {
    void getNewsMiniProgramRuntime().host.navigateBack();
  },

  onShareAppMessage() {
    const article = this.data.article;
    return {
      path: article
        ? `/subpackages/news/pages/article/index?id=${encodeURIComponent(article.id)}`
        : "/pages/feed/index",
      title: article?.title ?? "SDKWork 头条",
    };
  },

  share() {
    const article = this.data.article;
    if (!article) {
      return;
    }
    const runtime = getNewsMiniProgramRuntime();
    void runtime.host
      .copyText(`${article.title}\n${article.summary}\n—— SDKWork 头条`)
      .then(() => runtime.host.showToast("分享文案已复制"));
  },

  loadMoreComments() {
    const threadId = this.data.commentThreadId;
    if (!threadId || !this.data.commentHasMore || this.data.commentsLoading) {
      return;
    }
    void loadMoreComments(this, threadId);
  },

  onCommentInput(event) {
    this.setData({ commentInput: event.detail.value.slice(0, 300) });
  },

  replyToComment(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    if (!id || !name) {
      return;
    }
    this.setData({ commentReplyTo: { id, name } });
  },

  submitComment() {
    const threadId = this.data.commentThreadId;
    const body = this.data.commentInput.trim();
    if (!threadId || !body || this.data.commentSubmitting) {
      return;
    }
    void submitComment(this, threadId, body);
  },

  toggleCommentLike(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    void toggleCommentLike(this, id);
  },

  toggleArticleLike() {
    const article = this.data.article;
    if (!article || this.data.likePending) {
      return;
    }
    void toggleArticleLike(this, article.id);
  },

  toggleFont() {
    this.setData({ isLargeText: !this.data.isLargeText });
  },

  toggleSave() {
    const article = this.data.article;
    if (!article) {
      return;
    }
    void toggleSaved(this, article);
  },
});

async function loadArticle(page: ArticlePageContext, id: string): Promise<void> {
  page.setData({ errorMessage: "", loading: true });
  try {
    const runtime = getNewsMiniProgramRuntime();
    const [article, savedIds] = await Promise.all([
      runtime.service.getArticle(id),
      runtime.host.getStorage<string[]>(SAVED_KEY),
    ]);
    page.setData({
      article: toArticleView(article),
      loading: false,
      saved: (savedIds ?? []).includes(id),
    });
  } catch (error) {
    page.setData({
      errorMessage: error instanceof Error ? error.message : "资讯加载失败",
      loading: false,
    });
  }
}

async function toggleSaved(
  page: ArticlePageContext,
  article: NewsArticleView,
): Promise<void> {
  if (page.data.favoritePending) {
    return;
  }
  const runtime = getNewsMiniProgramRuntime();
  const next = !page.data.saved;
  page.setData({ favoritePending: true, saved: next });
  try {
    await runtime.comments.setFavorite({ id: article.id }, next);
    const savedIds = await runtime.host.getStorage<string[]>(SAVED_KEY) ?? [];
    const nextIds = next
      ? [...new Set([...savedIds, article.id])]
      : savedIds.filter((id) => id !== article.id);
    await runtime.host.setStorage(SAVED_KEY, nextIds);
    page.setData({
      engagementSummary: page.data.engagementSummary
        ? {
            ...page.data.engagementSummary,
            favoriteCount: Math.max(
              0,
              page.data.engagementSummary.favoriteCount + (next ? 1 : -1),
            ),
          }
        : page.data.engagementSummary,
      favoritePending: false,
    });
    await runtime.host.showToast(next ? "已收藏" : "已取消收藏");
  } catch {
    page.setData({ favoritePending: false, saved: !next });
    await runtime.host.showToast("收藏失败，请重试");
  }
}

async function loadEngagement(
  page: ArticlePageContext,
  articleId: string,
): Promise<void> {
  try {
    const runtime = getNewsMiniProgramRuntime();
    await runtime.comments.recordVisit({ id: articleId });
    const state = await runtime.comments.getEngagement({ id: articleId });
    const savedIds = await runtime.host.getStorage<string[]>(SAVED_KEY) ?? [];
    const nextIds = state.favorited
      ? [...new Set([...savedIds, articleId])]
      : savedIds.filter((id) => id !== articleId);
    await runtime.host.setStorage(SAVED_KEY, nextIds);
    page.setData({
      engagementSummary: state.summary,
      liked: state.liked,
      saved: state.favorited,
    });
  } catch {
    // Comments engagement is optional; keep the locally cached save state.
  }
}

async function toggleArticleLike(
  page: ArticlePageContext,
  articleId: string,
): Promise<void> {
  if (page.data.likePending) {
    return;
  }
  const runtime = getNewsMiniProgramRuntime();
  const next = !page.data.liked;
  const previousSummary = page.data.engagementSummary;
  page.setData({
    liked: next,
    likePending: true,
    engagementSummary: previousSummary
      ? {
          ...previousSummary,
          likeCount: Math.max(
            0,
            previousSummary.likeCount + (next ? 1 : -1),
          ),
        }
      : previousSummary,
  });
  try {
    await runtime.comments.setTargetLike({ id: articleId }, next);
    page.setData({ likePending: false });
  } catch {
    page.setData({
      engagementSummary: previousSummary,
      liked: !next,
      likePending: false,
    });
    await runtime.host.showToast("点赞失败，请重试");
  }
}

async function loadComments(
  page: ArticlePageContext,
  articleId: string,
): Promise<void> {
  page.setData({ commentsError: "", commentsLoading: true });
  try {
    const runtime = getNewsMiniProgramRuntime();
    const thread = await runtime.comments.ensureThread({
      id: articleId,
      ...(page.data.article?.title ? { title: page.data.article.title } : {}),
    });
    const [commentPage, summary] = await Promise.all([
      runtime.comments.listComments(thread.id, { page: 1, pageSize: COMMENT_PAGE_SIZE }),
      runtime.comments.getSummary(thread.id),
    ]);
    page.setData({
      commentHasMore: commentPage.hasMore,
      commentPage: 1,
      comments: commentPage.items.map(toCommentView),
      commentsLoading: false,
      commentThreadId: thread.id,
      commentsSummary: summary,
    });
  } catch (error) {
    page.setData({
      commentsError: error instanceof Error ? error.message : "评论加载失败",
      commentsLoading: false,
    });
  }
}

async function loadMoreComments(
  page: ArticlePageContext,
  threadId: string,
): Promise<void> {
  page.setData({ commentsLoading: true });
  try {
    const nextPage = page.data.commentPage + 1;
    const result = await getNewsMiniProgramRuntime().comments.listComments(
      threadId,
      { page: nextPage, pageSize: COMMENT_PAGE_SIZE },
    );
    page.setData({
      commentHasMore: result.hasMore,
      commentPage: nextPage,
      comments: [
        ...page.data.comments,
        ...result.items.map(toCommentView),
      ],
      commentsLoading: false,
    });
  } catch (error) {
    page.setData({
      commentsError: error instanceof Error ? error.message : "评论加载失败",
      commentsLoading: false,
    });
  }
}

async function submitComment(
  page: ArticlePageContext,
  threadId: string,
  body: string,
): Promise<void> {
  page.setData({ commentSubmitting: true });
  try {
    const runtime = getNewsMiniProgramRuntime();
    const comment = await runtime.comments.createComment(threadId, {
      body,
      ...(page.data.commentReplyTo
        ? { parentId: page.data.commentReplyTo.id }
        : {}),
    });
    const summary = await runtime.comments.getSummary(threadId);
    page.setData({
      commentInput: "",
      commentReplyTo: undefined,
      comments: [toCommentView(comment), ...page.data.comments],
      commentSubmitting: false,
      commentsSummary: summary,
    });
    await runtime.host.showToast("评论已发布");
  } catch (error) {
    page.setData({ commentSubmitting: false });
    await getNewsMiniProgramRuntime().host.showToast(
      error instanceof Error ? error.message : "评论发布失败",
    );
  }
}

async function toggleCommentLike(
  page: ArticlePageContext,
  commentId: string,
): Promise<void> {
  const current = page.data.comments.find((comment) => comment.id === commentId);
  if (!current) {
    return;
  }
  const nextLiked = !current.viewerLiked;
  page.setData({
    comments: page.data.comments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            likeCount: Math.max(0, comment.likeCount + (nextLiked ? 1 : -1)),
            viewerLiked: nextLiked,
          }
        : comment
    ),
  });
  try {
    await getNewsMiniProgramRuntime().comments.setCommentLike(commentId, nextLiked);
  } catch {
    page.setData({
      comments: page.data.comments.map((comment) =>
        comment.id === commentId ? current : comment
      ),
    });
  }
}

function toCommentView(comment: NewsComment): CommentView {
  return {
    authorName: comment.authorName,
    avatarText: comment.authorName.slice(0, 1),
    body: comment.body,
    id: comment.id,
    likeCount: comment.likeCount,
    ...(comment.parentId ? { parentId: comment.parentId } : {}),
    ...(comment.quoteAuthorName ? { quoteAuthorName: comment.quoteAuthorName } : {}),
    timeLabel: formatCommentTime(comment.createdAt),
    viewerLiked: comment.viewerLiked,
  };
}

function formatCommentTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) {
    return minutes === 0 ? "刚刚" : `${Math.abs(minutes)} 分钟前`;
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return `${Math.abs(hours)} 小时前`;
  }
  return `${Math.abs(Math.round(hours / 24))} 天前`;
}
