import type { NewsItem } from './news-item';

export interface NewsItemPage {
  items: NewsItem[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
