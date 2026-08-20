import type { NewsFeedItem } from './news-feed-item';
import type { PageInfo } from './page-info';

export interface ChannelsFeedListResponse {
  code: 0;
  data: unknown & { items: NewsFeedItem[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
