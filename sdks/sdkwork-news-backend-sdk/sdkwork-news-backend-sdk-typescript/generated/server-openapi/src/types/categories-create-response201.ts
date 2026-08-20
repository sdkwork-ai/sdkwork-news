import type { NewsCategory } from './news-category';

export interface CategoriesCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsCategory; };
  /** Server-owned request correlation id. */
  traceId: string;
}
