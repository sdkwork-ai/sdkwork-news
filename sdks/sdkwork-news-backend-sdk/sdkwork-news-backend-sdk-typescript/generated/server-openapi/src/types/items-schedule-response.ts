import type { NewsItem } from './news-item';

export interface ItemsScheduleResponse {
  code: 0;
  data: unknown & { item: NewsItem; };
  /** Server-owned request correlation id. */
  traceId: string;
}
