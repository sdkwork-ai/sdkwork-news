import type { NewsFollow } from './news-follow';

export interface NewsFollowPage {
  items: NewsFollow[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
