import type { NewsFavorite } from './news-favorite';

export interface FavoritesCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsFavorite; };
  /** Server-owned request correlation id. */
  traceId: string;
}
