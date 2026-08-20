import type { NewsItem } from './news-item';
import type { PageInfo } from './page-info';

export interface ItemsVersionsListResponse {
  code: 0;
  data: unknown & { items: NewsItem[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
