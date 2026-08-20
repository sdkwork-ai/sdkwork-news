import type { NewsDigestIssue } from './news-digest-issue';

export interface DigestsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsDigestIssue; };
  /** Server-owned request correlation id. */
  traceId: string;
}
