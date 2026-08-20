import type { NewsExperiment } from './news-experiment';
import type { PageInfo } from './page-info';

export interface ExperimentsManagementListResponse {
  code: 0;
  data: unknown & { items: NewsExperiment[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
