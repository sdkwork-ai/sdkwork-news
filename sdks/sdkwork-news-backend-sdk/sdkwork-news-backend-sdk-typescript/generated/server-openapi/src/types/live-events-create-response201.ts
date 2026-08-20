import type { NewsLiveEvent } from './news-live-event';

export interface LiveEventsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsLiveEvent; };
  /** Server-owned request correlation id. */
  traceId: string;
}
