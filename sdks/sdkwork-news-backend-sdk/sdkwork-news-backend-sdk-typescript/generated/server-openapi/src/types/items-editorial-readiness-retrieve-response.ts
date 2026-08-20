import type { NewsEditorialReadiness } from './news-editorial-readiness';

export interface ItemsEditorialReadinessRetrieveResponse {
  code: 0;
  data: unknown & { item: NewsEditorialReadiness; };
  /** Server-owned request correlation id. */
  traceId: string;
}
