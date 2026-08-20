import type { NewsFavorite } from './news-favorite';

export interface NewsFavoritePage {
  items: NewsFavorite[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
