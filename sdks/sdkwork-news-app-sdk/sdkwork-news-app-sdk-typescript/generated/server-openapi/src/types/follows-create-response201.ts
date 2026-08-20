import type { NewsFollow } from './news-follow';

export interface FollowsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsFollow; };
  /** Server-owned request correlation id. */
  traceId: string;
}
