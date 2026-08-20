import type { NewsReaction } from './news-reaction';

export interface ReactionsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsReaction; };
  /** Server-owned request correlation id. */
  traceId: string;
}
