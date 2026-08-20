import type { NewsFollow } from './news-follow';
import type { PageInfo } from './page-info';

export interface FollowsListResponse {
  code: 0;
  data: unknown & { items: NewsFollow[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
