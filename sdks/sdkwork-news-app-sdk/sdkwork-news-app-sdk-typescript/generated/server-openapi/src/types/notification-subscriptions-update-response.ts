import type { NewsNotificationSubscription } from './news-notification-subscription';

export interface NotificationSubscriptionsUpdateResponse {
  code: 0;
  data: unknown & { item: NewsNotificationSubscription; };
  /** Server-owned request correlation id. */
  traceId: string;
}
