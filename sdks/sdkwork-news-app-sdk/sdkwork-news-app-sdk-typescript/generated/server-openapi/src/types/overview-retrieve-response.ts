import type { NewsOverview } from './news-overview';

export interface OverviewRetrieveResponse {
  code: 0;
  data: unknown & { item: NewsOverview; };
  /** Server-owned request correlation id. */
  traceId: string;
}
