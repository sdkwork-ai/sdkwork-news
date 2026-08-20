import type { NewsTopic } from './news-topic';

export interface TopicsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsTopic; };
  /** Server-owned request correlation id. */
  traceId: string;
}
