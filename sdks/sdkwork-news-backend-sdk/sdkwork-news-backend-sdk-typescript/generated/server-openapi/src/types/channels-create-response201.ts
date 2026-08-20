import type { NewsChannel } from './news-channel';

export interface ChannelsCreateResponse201 {
  code: 0;
  data: unknown & { item: NewsChannel; };
  /** Server-owned request correlation id. */
  traceId: string;
}
