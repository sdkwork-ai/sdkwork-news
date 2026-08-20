import type { NewsLiveEvent } from './news-live-event';

export interface LiveEventsPublishResponse {
  code: 0;
  data: unknown & { item: NewsLiveEvent; };
  /** Server-owned request correlation id. */
  traceId: string;
}
