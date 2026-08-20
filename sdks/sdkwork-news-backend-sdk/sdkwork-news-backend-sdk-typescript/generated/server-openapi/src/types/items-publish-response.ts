import type { NewsItem } from './news-item';

export interface ItemsPublishResponse {
  code: 0;
  data: unknown & { item: NewsItem; };
  /** Server-owned request correlation id. */
  traceId: string;
}
