import type { NewsSource } from './news-source';
import type { PageInfo } from './page-info';

export interface SourcesManagementListResponse {
  code: 0;
  data: unknown & { items: NewsSource[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
