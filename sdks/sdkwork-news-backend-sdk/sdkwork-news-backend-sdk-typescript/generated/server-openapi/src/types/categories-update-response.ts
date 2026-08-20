import type { NewsCategory } from './news-category';

export interface CategoriesUpdateResponse {
  code: 0;
  data: unknown & { item: NewsCategory; };
  /** Server-owned request correlation id. */
  traceId: string;
}
