import type { NewsChannel } from './news-channel';

export interface ChannelsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsChannel; };
  /** Server-owned request correlation id. */
  traceId: string;
}
