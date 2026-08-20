import type { NewsUserInterestSignal } from './news-user-interest-signal';

export interface InterestsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsUserInterestSignal; };
  /** Server-owned request correlation id. */
  traceId: string;
}
