import type { NewsFavorite } from './news-favorite';
import type { PageInfo } from './page-info';

export interface FavoritesListResponse {
  code: 0;
  data: unknown & { items: NewsFavorite[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
