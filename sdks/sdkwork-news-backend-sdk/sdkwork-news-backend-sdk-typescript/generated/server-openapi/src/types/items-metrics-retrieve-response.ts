import type { NewsItemMetricSnapshot } from './news-item-metric-snapshot';

export interface ItemsMetricsRetrieveResponse {
  code: 0;
  data: unknown & { item: NewsItemMetricSnapshot; };
  /** Server-owned request correlation id. */
  traceId: string;
}
