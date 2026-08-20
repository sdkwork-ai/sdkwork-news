import type { NewsFeedItem } from './news-feed-item';

export interface NewsFeedPage {
  items: NewsFeedItem[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
