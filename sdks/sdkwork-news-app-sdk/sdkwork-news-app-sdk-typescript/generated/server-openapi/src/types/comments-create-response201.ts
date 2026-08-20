import type { NewsComment } from './news-comment';

export interface CommentsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsComment; };
  /** Server-owned request correlation id. */
  traceId: string;
}
