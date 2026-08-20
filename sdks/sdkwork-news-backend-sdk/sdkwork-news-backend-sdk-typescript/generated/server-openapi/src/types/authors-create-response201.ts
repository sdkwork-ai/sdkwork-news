import type { NewsAuthor } from './news-author';

export interface AuthorsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsAuthor; };
  /** Server-owned request correlation id. */
  traceId: string;
}
