import type { NewsTopic } from './news-topic';
import type { PageInfo } from './page-info';

export interface TopicsListResponse {
  code: 0;
  data: unknown & { items: NewsTopic[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
