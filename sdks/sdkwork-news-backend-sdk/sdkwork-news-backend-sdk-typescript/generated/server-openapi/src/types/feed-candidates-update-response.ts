import type { NewsFeedCandidate } from './news-feed-candidate';

export interface FeedCandidatesUpdateResponse {
  code: 0;
  data: unknown & { item: NewsFeedCandidate; };
  /** Server-owned request correlation id. */
  traceId: string;
}
