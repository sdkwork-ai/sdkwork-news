import type { NewsTopic } from './news-topic';

export interface TopicsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsTopic; };
  /** Server-owned request correlation id. */
  traceId: string;
}
