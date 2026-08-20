import type { NewsComment } from './news-comment';

export interface CommentsModerationUpdateResponse {
  code: 0;
  data: unknown & { item: NewsComment; };
  /** Server-owned request correlation id. */
  traceId: string;
}
