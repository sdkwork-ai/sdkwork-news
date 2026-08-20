import type { NewsLiveEvent } from './news-live-event';

export interface LiveEventsCloseResponse {
  code: 0;
  data: unknown & { item: NewsLiveEvent; };
  /** Server-owned request correlation id. */
  traceId: string;
}
