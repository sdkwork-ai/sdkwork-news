import type { NewsEntityEvent } from './news-entity-event';

export interface NewsEntityEventPage {
  items: NewsEntityEvent[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
