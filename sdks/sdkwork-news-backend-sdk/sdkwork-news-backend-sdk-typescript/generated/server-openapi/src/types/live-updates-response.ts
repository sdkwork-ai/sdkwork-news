import type { NewsLiveUpdate } from './news-live-update';

export interface LiveUpdatesResponse {
  code: 0;
  data: unknown & { item: NewsLiveUpdate; };
  /** Server-owned request correlation id. */
  traceId: string;
}
