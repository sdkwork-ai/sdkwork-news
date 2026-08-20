import type { MediaResource } from './media-resource';

export interface ItemsMediaCreateResponse201 {
  code: 0;
  data: unknown & { item: MediaResource; };
  /** Server-owned request correlation id. */
  traceId: string;
}
