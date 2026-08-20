import type { NewsSource } from './news-source';

export interface SourcesCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsSource; };
  /** Server-owned request correlation id. */
  traceId: string;
}
