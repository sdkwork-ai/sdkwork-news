import type { NewsModerationCase } from './news-moderation-case';

export interface ModerationCasesUpdateResponse {
  code: 0;
  data: unknown & { item: NewsModerationCase; };
  /** Server-owned request correlation id. */
  traceId: string;
}
