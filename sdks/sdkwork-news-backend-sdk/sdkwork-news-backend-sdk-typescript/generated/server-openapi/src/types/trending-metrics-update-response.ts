import type { NewsTrendingMetric } from './news-trending-metric';

export interface TrendingMetricsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsTrendingMetric; };
  /** Server-owned request correlation id. */
  traceId: string;
}
