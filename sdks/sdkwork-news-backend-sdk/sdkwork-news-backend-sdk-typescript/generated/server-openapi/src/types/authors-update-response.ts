import type { NewsAuthor } from './news-author';

export interface AuthorsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsAuthor; };
  /** Server-owned request correlation id. */
  traceId: string;
}
