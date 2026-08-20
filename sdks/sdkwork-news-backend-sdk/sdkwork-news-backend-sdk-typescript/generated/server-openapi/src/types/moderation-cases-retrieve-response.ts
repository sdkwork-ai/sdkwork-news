import type { NewsModerationCase } from './news-moderation-case';

export interface ModerationCasesRetrieveResponse {
  code: 0;
  data: unknown & { item: NewsModerationCase; };
  /** Server-owned request correlation id. */
  traceId: string;
}
