import { useCallback, useEffect, useRef, useState } from "react";
import type {
  NewsComment,
  NewsCommentsService,
  NewsCommentsSummary,
  NewsCommentsTarget,
  NewsEngagementSummary,
  NewsEngagementTarget,
} from "@sdkwork/news-comments-service";

export type NewsCommentsStatus =
  | "error"
  | "loading"
  | "ready"
  | "unavailable";

export interface NewsCommentsController {
  actionError?: string;
  comments: readonly NewsComment[];
  error?: string;
  hasMore: boolean;
  loadMore(): Promise<void>;
  loadingMore: boolean;
  removeComment(commentId: string): Promise<void>;
  retry(): void;
  status: NewsCommentsStatus;
  submit(input: { body: string; parentId?: string }): Promise<boolean>;
  submitting: boolean;
  summary?: NewsCommentsSummary;
  threadId?: string;
  toggleLike(commentId: string): Promise<void>;
}

const PAGE_SIZE = 10;

export function useNewsCommentsController(
  service: NewsCommentsService | undefined,
  target: NewsCommentsTarget,
): NewsCommentsController {
  const [actionError, setActionError] = useState<string>();
  const [comments, setComments] = useState<readonly NewsComment[]>([]);
  const [error, setError] = useState<string>();
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<NewsCommentsStatus>(
    service ? "loading" : "unavailable",
  );
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<NewsCommentsSummary>();
  const [threadId, setThreadId] = useState<string>();
  const requestId = useRef(0);
  const threadIdRef = useRef<string | undefined>(undefined);
  const targetId = target.id;
  const targetTitle = target.title;

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!service) {
      setStatus("unavailable");
      return;
    }
    setStatus("loading");
    setError(undefined);
    setActionError(undefined);
    try {
      const thread = await service.ensureThread({
        id: targetId,
        ...(targetTitle ? { title: targetTitle } : {}),
      });
      if (currentRequest !== requestId.current) {
        return;
      }
      threadIdRef.current = thread.id;
      setThreadId(thread.id);
      const [pageData, nextSummary] = await Promise.all([
        service.listComments(thread.id, { page: 1, pageSize: PAGE_SIZE }),
        service.getSummary(thread.id),
      ]);
      if (currentRequest !== requestId.current) {
        return;
      }
      setComments(pageData.items);
      setHasMore(pageData.hasMore);
      setPage(1);
      setSummary(nextSummary);
      setStatus("ready");
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(toMessage(loadError));
        setStatus("error");
      }
    }
  }, [service, targetId, targetTitle]);

  useEffect(() => {
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const loadMore = useCallback(async () => {
    const activeService = service;
    const activeThreadId = threadIdRef.current;
    if (!activeService || !activeThreadId || !hasMore || loadingMore) {
      return;
    }
    setLoadingMore(true);
    setActionError(undefined);
    try {
      const nextPage = page + 1;
      const pageData = await activeService.listComments(activeThreadId, {
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setComments((current) => mergeComments(current, pageData.items));
      setHasMore(pageData.hasMore);
      setPage(nextPage);
    } catch (loadError) {
      setActionError(toMessage(loadError));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page, service]);

  const submit = useCallback(
    async (input: { body: string; parentId?: string }) => {
      const activeService = service;
      const activeThreadId = threadIdRef.current;
      const body = input.body.trim();
      if (!activeService || !activeThreadId || !body || submitting) {
        return false;
      }
      setSubmitting(true);
      setActionError(undefined);
      try {
        const comment = await activeService.createComment(activeThreadId, {
          body,
          ...(input.parentId ? { parentId: input.parentId } : {}),
        });
        setComments((current) => mergeComments([comment], current));
        setSummary((current) => current
          ? {
              ...current,
              latestActivityAt: comment.createdAt,
              publishedCount: current.publishedCount + 1,
              totalCount: current.totalCount + 1,
            }
          : current);
        return true;
      } catch (submitError) {
        setActionError(toMessage(submitError));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [service, submitting],
  );

  const toggleLike = useCallback(
    async (commentId: string) => {
      if (!service) {
        return;
      }
      const current = comments.find((comment) => comment.id === commentId);
      if (!current) {
        return;
      }
      const nextLiked = !current.viewerLiked;
      setComments((entries) =>
        entries.map((entry) =>
          entry.id === commentId
            ? {
                ...entry,
                likeCount: Math.max(0, entry.likeCount + (nextLiked ? 1 : -1)),
                viewerLiked: nextLiked,
              }
            : entry
        )
      );
      try {
        await service.setCommentLike(commentId, nextLiked);
      } catch (likeError) {
        setComments((entries) =>
          entries.map((entry) => entry.id === commentId ? current : entry)
        );
        setActionError(toMessage(likeError));
      }
    },
    [comments, service],
  );

  const removeComment = useCallback(
    async (commentId: string) => {
      if (!service) {
        return;
      }
      try {
        await service.deleteComment(commentId);
        setComments((current) => current.filter((entry) => entry.id !== commentId));
        setSummary((current) => current
          ? {
              ...current,
              publishedCount: Math.max(0, current.publishedCount - 1),
              totalCount: Math.max(0, current.totalCount - 1),
            }
          : current);
      } catch (removeError) {
        setActionError(toMessage(removeError));
      }
    },
    [service],
  );

  return {
    ...(actionError ? { actionError } : {}),
    comments,
    ...(error ? { error } : {}),
    hasMore,
    loadMore,
    loadingMore,
    removeComment,
    retry: () => void load(),
    status,
    submit,
    submitting,
    ...(summary ? { summary } : {}),
    ...(threadId ? { threadId } : {}),
    toggleLike,
  };
}

function mergeComments(
  current: readonly NewsComment[],
  incoming: readonly NewsComment[],
): readonly NewsComment[] {
  const seen = new Set(current.map((comment) => comment.id));
  return [...current, ...incoming.filter((comment) => !seen.has(comment.id))];
}

function toMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "评论服务暂时不可用，请稍后重试。";
}

export interface NewsEngagementController {
  error?: string;
  favorited: boolean;
  liking: boolean;
  liked: boolean;
  pending: boolean;
  summary: NewsEngagementSummary;
  toggleFavorite(): Promise<void>;
  toggleLike(): Promise<void>;
}

const EMPTY_ENGAGEMENT: NewsEngagementSummary = {
  favoriteCount: 0,
  likeCount: 0,
  visitCount: 0,
};

export function useNewsEngagement(
  service: NewsCommentsService | undefined,
  target: NewsEngagementTarget,
): NewsEngagementController {
  const [error, setError] = useState<string>();
  const [favorited, setFavorited] = useState(false);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [pending, setPending] = useState(false);
  const [summary, setSummary] = useState<NewsEngagementSummary>(EMPTY_ENGAGEMENT);
  const targetId = target.id;

  useEffect(() => {
    let active = true;
    if (!service) {
      setFavorited(false);
      setLiked(false);
      setSummary(EMPTY_ENGAGEMENT);
      return;
    }
    void (async () => {
      try {
        await service.recordVisit({ id: targetId });
        const engagement = await service.getEngagement({ id: targetId });
        if (!active) {
          return;
        }
        setFavorited(engagement.favorited);
        setLiked(engagement.liked);
        setSummary(engagement.summary);
      } catch (loadError) {
        if (active) {
          setError(toMessage(loadError));
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [service, targetId]);

  const toggleFavorite = useCallback(async () => {
    if (pending) {
      return;
    }
    const next = !favorited;
    setPending(true);
    setError(undefined);
    setFavorited(next);
    setSummary((current) => ({
      ...current,
      favoriteCount: Math.max(0, current.favoriteCount + (next ? 1 : -1)),
    }));
    if (!service) {
      setPending(false);
      return;
    }
    try {
      await service.setFavorite({ id: targetId }, next);
    } catch (mutationError) {
      setFavorited(!next);
      setSummary((current) => ({
        ...current,
        favoriteCount: Math.max(0, current.favoriteCount + (next ? -1 : 1)),
      }));
      setError(toMessage(mutationError));
    } finally {
      setPending(false);
    }
  }, [favorited, pending, service, targetId]);

  const toggleLike = useCallback(async () => {
    if (liking) {
      return;
    }
    const next = !liked;
    setLiking(true);
    setError(undefined);
    setLiked(next);
    setSummary((current) => ({
      ...current,
      likeCount: Math.max(0, current.likeCount + (next ? 1 : -1)),
    }));
    if (!service) {
      setLiking(false);
      return;
    }
    try {
      await service.setTargetLike({ id: targetId }, next);
    } catch (mutationError) {
      setLiked(!next);
      setSummary((current) => ({
        ...current,
        likeCount: Math.max(0, current.likeCount + (next ? -1 : 1)),
      }));
      setError(toMessage(mutationError));
    } finally {
      setLiking(false);
    }
  }, [liked, liking, service, targetId]);

  return {
    ...(error ? { error } : {}),
    favorited,
    liked,
    liking,
    pending,
    summary,
    toggleFavorite,
    toggleLike,
  };
}
