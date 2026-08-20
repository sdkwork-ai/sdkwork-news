import type { NewsItem } from './news-item';

export interface ItemsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsItem; };
  /** Server-owned request correlation id. */
  traceId: string;
}
