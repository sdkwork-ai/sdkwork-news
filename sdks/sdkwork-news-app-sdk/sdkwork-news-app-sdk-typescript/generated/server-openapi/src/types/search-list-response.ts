import type { NewsSearchResult } from './news-search-result';
import type { PageInfo } from './page-info';

export interface SearchListResponse {
  code: 0;
  data: unknown & { items: NewsSearchResult[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
