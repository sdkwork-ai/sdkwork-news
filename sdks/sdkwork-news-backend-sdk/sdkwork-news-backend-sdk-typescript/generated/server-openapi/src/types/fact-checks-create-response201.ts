import type { NewsFactCheck } from './news-fact-check';

export interface FactChecksCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsFactCheck; };
  /** Server-owned request correlation id. */
  traceId: string;
}
