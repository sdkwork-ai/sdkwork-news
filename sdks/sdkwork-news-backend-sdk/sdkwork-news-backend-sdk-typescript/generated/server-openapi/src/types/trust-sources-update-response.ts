import type { NewsSourceTrustProfile } from './news-source-trust-profile';

export interface TrustSourcesUpdateResponse {
  code: 0;
  data: unknown & { item: NewsSourceTrustProfile; };
  /** Server-owned request correlation id. */
  traceId: string;
}
