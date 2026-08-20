import type { NewsDigestIssue } from './news-digest-issue';

export interface DigestsPublishResponse {
  code: 0;
  data: unknown & { item: NewsDigestIssue; };
  /** Server-owned request correlation id. */
  traceId: string;
}
