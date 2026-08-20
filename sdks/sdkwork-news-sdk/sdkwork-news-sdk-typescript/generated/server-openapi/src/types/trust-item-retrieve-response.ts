import type { NewsItemTrustSnapshot } from './news-item-trust-snapshot';

export interface TrustItemRetrieveResponse {
  code: 0;
  data: unknown & { item: NewsItemTrustSnapshot; };
  /** Server-owned request correlation id. */
  traceId: string;
}
