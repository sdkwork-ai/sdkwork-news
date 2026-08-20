import type { NewsCategory } from './news-category';
import type { PageInfo } from './page-info';

export interface CategoriesListResponse {
  code: 0;
  data: unknown & { items: NewsCategory[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
