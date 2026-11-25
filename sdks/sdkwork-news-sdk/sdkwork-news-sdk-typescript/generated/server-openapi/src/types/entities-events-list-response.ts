import type { NewsEntityEvent } from './news-entity-event';
import type { PageInfo } from './page-info';

export interface EntitiesEventsListResponse {
  code: 0;
  data: unknown & { items: NewsEntityEvent[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
