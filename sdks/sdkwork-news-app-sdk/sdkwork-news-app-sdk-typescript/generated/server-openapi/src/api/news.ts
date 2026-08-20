import { appApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { NewsCategory, NewsChannel, NewsComment, NewsCommentCommand, NewsFavorite, NewsFeedItem, NewsFollow, NewsFollowCommand, NewsItem, NewsItemTrustSnapshot, NewsLiveEvent, NewsNotificationSubscription, NewsNotificationSubscriptionCommand, NewsOverview, NewsReaction, NewsReactionCommand, NewsRecommendationEventCommand, NewsReportCommand, NewsSearchResult, NewsTopic, NewsTrendingMetric, NewsUserFeedbackCommand, NewsUserInterestCommand, NewsUserInterestSignal, PageInfo, SdkWorkPageData } from '../types';


export interface NewsLiveUpdatesListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsLiveUpdatesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News live.updates.list */
  async list(eventId: string, params?: NewsLiveUpdatesListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/updates`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsLiveEventsListParams {
  eventType?: string;
  region?: string;
  locale?: string;
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsLiveEventsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News live.events.list */
  async list(params?: NewsLiveEventsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'event_type', value: params?.eventType, style: 'form', explode: true, allowReserved: false },
      { name: 'region', value: params?.region, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/live/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News live.events.retrieve */
  async retrieve(eventId: string, requestOptions?: ApiRequestOptions): Promise<NewsLiveEvent> {
    return this.client.request<NewsLiveEvent>(appApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsLiveApi {
  public readonly events: NewsLiveEventsApi;
  public readonly updates: NewsLiveUpdatesApi;

  constructor(client: HttpClient) {
    this.events = new NewsLiveEventsApi(client);
    this.updates = new NewsLiveUpdatesApi(client);
  }

}

export interface NewsCorrectionsListParams {
  itemId?: string;
  correctionType?: string;
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsCorrectionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News corrections.list */
  async list(params?: NewsCorrectionsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'correction_type', value: params?.correctionType, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/corrections`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsFactChecksListParams {
  itemId?: string;
  verdict?: string;
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsFactChecksApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News factChecks.list */
  async list(params?: NewsFactChecksListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'verdict', value: params?.verdict, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/fact_checks`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsTrustItemApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News trust.item.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItemTrustSnapshot> {
    return this.client.request<NewsItemTrustSnapshot>(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/trust`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsTrustApi {
  public readonly item: NewsTrustItemApi;

  constructor(client: HttpClient) {
    this.item = new NewsTrustItemApi(client);
  }

}

export interface NewsDigestsListParams {
  digestType?: string;
  locale?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsDigestsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News digests.list */
  async list(params?: NewsDigestsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'digest_type', value: params?.digestType, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/digests`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsAlertsBreakingListParams {
  severity?: string;
  targetType?: string;
  targetId?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsAlertsBreakingApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News alerts.breaking.list */
  async list(params?: NewsAlertsBreakingListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'severity', value: params?.severity, style: 'form', explode: true, allowReserved: false },
      { name: 'target_type', value: params?.targetType, style: 'form', explode: true, allowReserved: false },
      { name: 'target_id', value: params?.targetId, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/alerts/breaking`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsAlertsApi {
  public readonly breaking: NewsAlertsBreakingApi;

  constructor(client: HttpClient) {
    this.breaking = new NewsAlertsBreakingApi(client);
  }

}

export interface NewsNotificationSubscriptionsListParams {
  userId?: string;
  targetType?: string;
  targetId?: string;
  channel?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsNotificationSubscriptionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News notification.subscriptions.list */
  async list(params?: NewsNotificationSubscriptionsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'target_type', value: params?.targetType, style: 'form', explode: true, allowReserved: false },
      { name: 'target_id', value: params?.targetId, style: 'form', explode: true, allowReserved: false },
      { name: 'channel', value: params?.channel, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/notification/subscriptions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News notification.subscriptions.upsert */
  async update(body: NewsNotificationSubscriptionCommand, requestOptions?: ApiRequestOptions): Promise<NewsNotificationSubscription> {
    return this.client.request<NewsNotificationSubscription>(appApiPath(`/news/notification/subscriptions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News notification.subscriptions.delete */
  async delete(subscriptionId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/news/notification/subscriptions/${serializePathParameter(subscriptionId, { name: 'subscriptionId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsNotificationApi {
  public readonly subscriptions: NewsNotificationSubscriptionsApi;

  constructor(client: HttpClient) {
    this.subscriptions = new NewsNotificationSubscriptionsApi(client);
  }

}

export interface NewsInterestsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsInterestsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News interests.list */
  async list(params?: NewsInterestsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/interests`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News interests.upsert */
  async update(body: NewsUserInterestCommand, requestOptions?: ApiRequestOptions): Promise<NewsUserInterestSignal> {
    return this.client.request<NewsUserInterestSignal>(appApiPath(`/news/interests`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsFollowsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsFollowsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News follows.list */
  async list(params?: NewsFollowsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsFollow[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsFollow[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/follows`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News follows.create */
  async create(body: NewsFollowCommand, requestOptions?: ApiRequestOptions): Promise<NewsFollow> {
    return this.client.request<NewsFollow>(appApiPath(`/news/follows`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News follows.delete */
  async delete(followId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/news/follows/${serializePathParameter(followId, { name: 'followId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface NewsHistoryListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsHistoryApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News history.list */
  async list(params?: NewsHistoryListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/history`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsFeedbackApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News feedback.create */
  async create(body: NewsUserFeedbackCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(appApiPath(`/news/feedback`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsReportsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News reports.create */
  async create(body: NewsReportCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(appApiPath(`/news/reports`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsCommentsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsCommentsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News comments.list */
  async list(itemId: string, params?: NewsCommentsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsComment[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsComment[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/comments`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News comments.create */
  async create(itemId: string, body: NewsCommentCommand, requestOptions?: ApiRequestOptions): Promise<NewsComment> {
    return this.client.request<NewsComment>(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/comments`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsReactionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News reactions.upsert */
  async update(itemId: string, body: NewsReactionCommand, requestOptions?: ApiRequestOptions): Promise<NewsReaction> {
    return this.client.request<NewsReaction>(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/reactions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsFavoritesListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsFavoritesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News favorites.list */
  async list(params?: NewsFavoritesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsFavorite[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsFavorite[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/favorites`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News favorites.create */
  async create(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsFavorite> {
    return this.client.request<NewsFavorite>(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/favorites`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News favorites.delete */
  async delete(itemId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/favorites`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsEventsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News events.create */
  async create(body: NewsRecommendationEventCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(appApiPath(`/news/events`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsSearchSuggestionsListParams {
  q?: string;
  cursor?: string;
  pageSize?: number;
  locale?: string;
}

export class NewsSearchSuggestionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News search.suggestions.list */
  async list(params?: NewsSearchSuggestionsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/news/search/suggestions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsSearchListParams {
  q?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsSearchApi {
  private client: HttpClient;
  public readonly suggestions: NewsSearchSuggestionsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.suggestions = new NewsSearchSuggestionsApi(client);
  }


/** News search.list */
  async list(params?: NewsSearchListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsSearchResult[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsSearchResult[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/search`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsTrendingListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsTrendingApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News trending.list */
  async list(params?: NewsTrendingListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsTrendingMetric[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsTrendingMetric[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/trending`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsFeedPersonalizedListParams {
  cursor?: string;
  pageSize?: number;
  traceId?: string;
}

export class NewsFeedPersonalizedApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News feed.personalized.list */
  async list(params?: NewsFeedPersonalizedListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsFeedItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'trace_id', value: params?.traceId, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsFeedItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/feed/personalized`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsFeedApi {
  public readonly personalized: NewsFeedPersonalizedApi;

  constructor(client: HttpClient) {
    this.personalized = new NewsFeedPersonalizedApi(client);
  }

}

export interface NewsTopicsItemsListParams {
  cursor?: string;
  pageSize?: number;
  traceId?: string;
}

export class NewsTopicsItemsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News topics.items.list */
  async list(topicId: string, params?: NewsTopicsItemsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'trace_id', value: params?.traceId, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/topics/${serializePathParameter(topicId, { name: 'topicId', style: 'simple', explode: false })}/items`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsTopicsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsTopicsApi {
  private client: HttpClient;
  public readonly items: NewsTopicsItemsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.items = new NewsTopicsItemsApi(client);
  }


/** News topics.list */
  async list(params?: NewsTopicsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsTopic[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsTopic[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/topics`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsChannelsFeedListParams {
  cursor?: string;
  pageSize?: number;
  traceId?: string;
}

export class NewsChannelsFeedApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News channels.feed.list */
  async list(channelId: string, params?: NewsChannelsFeedListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsFeedItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'trace_id', value: params?.traceId, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsFeedItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/channels/${serializePathParameter(channelId, { name: 'channelId', style: 'simple', explode: false })}/feed`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsChannelsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsChannelsApi {
  private client: HttpClient;
  public readonly feed: NewsChannelsFeedApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.feed = new NewsChannelsFeedApi(client);
  }


/** News channels.list */
  async list(params?: NewsChannelsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsChannel[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsChannel[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/channels`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsOverviewApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News overview.retrieve */
  async retrieve(requestOptions?: ApiRequestOptions): Promise<NewsOverview> {
    return this.client.request<NewsOverview>(appApiPath(`/news/overview`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsItemsRelatedListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsItemsRelatedApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.related.list */
  async list(itemId: string, params?: NewsItemsRelatedListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/related`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsItemsBySlugApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.bySlug.retrieve */
  async retrieve(slug: string, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(appApiPath(`/news/items/by_slug/${serializePathParameter(slug, { name: 'slug', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsItemsListParams {
  categoryId?: string;
  q?: string;
  status?: string;
}

export class NewsItemsApi {
  private client: HttpClient;
  public readonly bySlug: NewsItemsBySlugApi;
  public readonly related: NewsItemsRelatedApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.bySlug = new NewsItemsBySlugApi(client);
    this.related = new NewsItemsRelatedApi(client);
  }


/** News items.list */
  async list(params?: NewsItemsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'categoryId', value: params?.categoryId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/news/items`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News items.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(appApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsCategoriesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News categories.list */
  async list(requestOptions?: ApiRequestOptions): Promise<{ items: NewsCategory[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: NewsCategory[]; pageInfo: PageInfo; }>(appApiPath(`/news/categories`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsApi {
  public readonly categories: NewsCategoriesApi;
  public readonly items: NewsItemsApi;
  public readonly overview: NewsOverviewApi;
  public readonly channels: NewsChannelsApi;
  public readonly topics: NewsTopicsApi;
  public readonly feed: NewsFeedApi;
  public readonly trending: NewsTrendingApi;
  public readonly search: NewsSearchApi;
  public readonly events: NewsEventsApi;
  public readonly favorites: NewsFavoritesApi;
  public readonly reactions: NewsReactionsApi;
  public readonly comments: NewsCommentsApi;
  public readonly reports: NewsReportsApi;
  public readonly feedback: NewsFeedbackApi;
  public readonly history: NewsHistoryApi;
  public readonly follows: NewsFollowsApi;
  public readonly interests: NewsInterestsApi;
  public readonly notification: NewsNotificationApi;
  public readonly alerts: NewsAlertsApi;
  public readonly digests: NewsDigestsApi;
  public readonly trust: NewsTrustApi;
  public readonly factChecks: NewsFactChecksApi;
  public readonly corrections: NewsCorrectionsApi;
  public readonly live: NewsLiveApi;

  constructor(client: HttpClient) {
    this.categories = new NewsCategoriesApi(client);
    this.items = new NewsItemsApi(client);
    this.overview = new NewsOverviewApi(client);
    this.channels = new NewsChannelsApi(client);
    this.topics = new NewsTopicsApi(client);
    this.feed = new NewsFeedApi(client);
    this.trending = new NewsTrendingApi(client);
    this.search = new NewsSearchApi(client);
    this.events = new NewsEventsApi(client);
    this.favorites = new NewsFavoritesApi(client);
    this.reactions = new NewsReactionsApi(client);
    this.comments = new NewsCommentsApi(client);
    this.reports = new NewsReportsApi(client);
    this.feedback = new NewsFeedbackApi(client);
    this.history = new NewsHistoryApi(client);
    this.follows = new NewsFollowsApi(client);
    this.interests = new NewsInterestsApi(client);
    this.notification = new NewsNotificationApi(client);
    this.alerts = new NewsAlertsApi(client);
    this.digests = new NewsDigestsApi(client);
    this.trust = new NewsTrustApi(client);
    this.factChecks = new NewsFactChecksApi(client);
    this.corrections = new NewsCorrectionsApi(client);
    this.live = new NewsLiveApi(client);
  }

}

export function createNewsApi(client: HttpClient): NewsApi {
  return new NewsApi(client);
}

function appendQueryString(path: string, rawQueryString: string): string {
  const query = rawQueryString.replace(/^\?+/, '');
  if (!query) {
    return path;
  }
  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
}

interface PathParameterSpec {
  name: string;
  style: string;
  explode: boolean;
}

function serializePathParameter(value: unknown, spec: PathParameterSpec): string {
  if (value === undefined || value === null) {
    return '';
  }

  const style = spec.style || 'simple';
  if (Array.isArray(value)) {
    return serializePathArray(spec.name, value, style, spec.explode);
  }
  if (typeof value === 'object') {
    return serializePathObject(spec.name, value as Record<string, unknown>, style, spec.explode);
  }
  return pathPrefix(spec.name, style, false) + encodePathValue(serializePathPrimitive(value));
}

function serializePathArray(name: string, values: unknown[], style: string, explode: boolean): string {
  const serialized = values
    .filter((item) => item !== undefined && item !== null)
    .map((item) => encodePathValue(serializePathPrimitive(item)));
  if (serialized.length === 0) {
    return pathPrefix(name, style, false);
  }
  if (style === 'matrix') {
    return explode
      ? serialized.map((item) => `;${name}=${item}`).join('')
      : `;${name}=${serialized.join(',')}`;
  }
  return pathPrefix(name, style, false) + serialized.join(explode ? '.' : ',');
}

function serializePathObject(name: string, value: Record<string, unknown>, style: string, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return pathPrefix(name, style, true);
  }
  if (style === 'matrix') {
    return explode
      ? entries.map(([key, entryValue]) => `;${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join('')
      : `;${name}=${entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',')}`;
  }
  const serialized = explode
    ? entries.map(([key, entryValue]) => `${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join(style === 'label' ? '.' : ',')
    : entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',');
  return pathPrefix(name, style, true) + serialized;
}

function pathPrefix(name: string, style: string, _objectValue: boolean): string {
  if (style === 'label') return '.';
  if (style === 'matrix') return `;${name}`;
  return '';
}

function encodePathValue(value: string): string {
  return encodeURIComponent(value);
}

function serializePathPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
interface QueryParameterSpec {
  name: string;
  value: unknown;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  contentType?: string;
}

function buildQueryString(parameters: QueryParameterSpec[]): string {
  const pairs: string[] = [];
  for (const parameter of parameters) {
    appendSerializedParameter(pairs, parameter);
  }
  return pairs.join('&');
}

function appendSerializedParameter(pairs: string[], parameter: QueryParameterSpec): void {
  if (parameter.value === undefined || parameter.value === null) {
    return;
  }

  if (parameter.contentType) {
    pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(JSON.stringify(parameter.value), parameter.allowReserved)}`);
    return;
  }

  const style = parameter.style || 'form';
  if (style === 'deepObject') {
    appendDeepObjectParameter(pairs, parameter.name, parameter.value, parameter.allowReserved);
    return;
  }

  if (Array.isArray(parameter.value)) {
    appendArrayParameter(pairs, parameter.name, parameter.value, style, parameter.explode, parameter.allowReserved);
    return;
  }

  if (typeof parameter.value === 'object') {
    appendObjectParameter(pairs, parameter.name, parameter.value as Record<string, unknown>, style, parameter.explode, parameter.allowReserved);
    return;
  }

  pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(serializePrimitive(parameter.value), parameter.allowReserved)}`);
}

function appendArrayParameter(
  pairs: string[],
  name: string,
  value: unknown[],
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const values = value
    .filter((item) => item !== undefined && item !== null)
    .map((item) => serializePrimitive(item));
  if (values.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const item of values) {
      pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(item, allowReserved)}`);
    }
    return;
  }

  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(values.join(','), allowReserved)}`);
}

function appendObjectParameter(
  pairs: string[],
  name: string,
  value: Record<string, unknown>,
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const [key, entryValue] of entries) {
      pairs.push(`${encodeQueryComponent(key)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
    }
    return;
  }

  const serialized = entries.flatMap(([key, entryValue]) => [key, serializePrimitive(entryValue)]).join(',');
  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serialized, allowReserved)}`);
}

function appendDeepObjectParameter(
  pairs: string[],
  name: string,
  value: unknown,
  allowReserved: boolean,
): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serializePrimitive(value), allowReserved)}`);
    return;
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (entryValue === undefined || entryValue === null) {
      continue;
    }
    pairs.push(`${encodeQueryComponent(`${name}[${key}]`)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
  }
}

function serializePrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string, allowReserved: boolean): string {
  const encoded = encodeURIComponent(value);
  if (!allowReserved) {
    return encoded;
  }
  return encoded.replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%3F/gi, '?')
    .replace(/%23/gi, '#')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .replace(/%40/gi, '@')
    .replace(/%21/gi, '!')
    .replace(/%24/gi, '$')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2A/gi, '*')
    .replace(/%2B/gi, '+')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=');
}
