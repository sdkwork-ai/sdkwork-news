import type { NewsSearchSuggestion } from './news-search-suggestion';

export interface SearchSuggestionsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsSearchSuggestion; };
  /** Server-owned request correlation id. */
  traceId: string;
}
