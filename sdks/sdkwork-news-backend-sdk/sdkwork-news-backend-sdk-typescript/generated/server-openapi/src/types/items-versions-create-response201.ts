import type { NewsItem } from './news-item';

export interface ItemsVersionsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsItem; };
  /** Server-owned request correlation id. */
  traceId: string;
}
