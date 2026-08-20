import type { NewsSearchResult } from './news-search-result';

export interface NewsSearchResultPage {
  items: NewsSearchResult[];
  pageInfo: { mode: 'cursor'; pageSize: number; hasMore: boolean; nextCursor?: string | null; };
}
