import type { NewsBreakingAlert } from './news-breaking-alert';

export interface AlertsBreakingUpdateResponse {
  code: 0;
  data: unknown & { item: NewsBreakingAlert; };
  /** Server-owned request correlation id. */
  traceId: string;
}
