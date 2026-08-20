import type { NewsChannel } from './news-channel';
import type { PageInfo } from './page-info';

export interface ChannelsListResponse {
  code: 0;
  data: unknown & { items: NewsChannel[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
