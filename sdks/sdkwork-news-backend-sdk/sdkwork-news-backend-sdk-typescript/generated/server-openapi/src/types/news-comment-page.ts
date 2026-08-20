import type { NewsComment } from './news-comment';

export interface NewsCommentPage {
  items: NewsComment[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
