import { backendApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { MediaResource, NewsAuthor, NewsBreakingAlert, NewsBreakingAlertCommand, NewsCategory, NewsCategoryCommand, NewsChannel, NewsComment, NewsCorrectionNotice, NewsCorrectionNoticeCommand, NewsDigestIssue, NewsDigestIssueCommand, NewsDigestItemCommand, NewsEditorialReadiness, NewsExperiment, NewsFactCheck, NewsFactCheckCommand, NewsFeedCandidate, NewsFeedCandidateCommand, NewsGenericCommand, NewsItem, NewsItemCommand, NewsItemMetricSnapshot, NewsItemTrustSnapshot, NewsItemTrustSnapshotCommand, NewsLiveEvent, NewsLiveEventCommand, NewsLiveEventItemCommand, NewsLiveUpdate, NewsLiveUpdateCommand, NewsModerationCase, NewsScheduleCommand, NewsSearchEvent, NewsSearchSuggestion, NewsSearchSuggestionCommand, NewsSource, NewsSourceTrustProfile, NewsSourceTrustProfileCommand, NewsTopic, NewsTrendingMetric, PageInfo, SdkWorkPageData } from '../types';


export class NewsLiveItemsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News live.items.attach */
  async create(eventId: string, body: NewsLiveEventItemCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsLiveUpdatesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News live.updates.create */
  async create(eventId: string, body: NewsLiveUpdateCommand, requestOptions?: ApiRequestOptions): Promise<NewsLiveUpdate> {
    return this.client.request<NewsLiveUpdate>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/updates`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News live.updates.update */
  async update(eventId: string, updateId: string, body: NewsLiveUpdateCommand, requestOptions?: ApiRequestOptions): Promise<NewsLiveUpdate> {
    return this.client.request<NewsLiveUpdate>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/updates/${serializePathParameter(updateId, { name: 'updateId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News live.updates.publish */
  async publish(eventId: string, updateId: string, requestOptions?: ApiRequestOptions): Promise<NewsLiveUpdate> {
    return this.client.request<NewsLiveUpdate>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/updates/${serializePathParameter(updateId, { name: 'updateId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsLiveEventsManagementListParams {
  eventType?: string;
  region?: string;
  locale?: string;
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsLiveEventsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News live.events.management.list */
  async list(params?: NewsLiveEventsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'event_type', value: params?.eventType, style: 'form', explode: true, allowReserved: false },
      { name: 'region', value: params?.region, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/live/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsLiveEventsApi {
  private client: HttpClient;
  public readonly management: NewsLiveEventsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsLiveEventsManagementApi(client);
  }


/** News live.events.create */
  async create(body: NewsLiveEventCommand, requestOptions?: ApiRequestOptions): Promise<NewsLiveEvent> {
    return this.client.request<NewsLiveEvent>(backendApiPath(`/news/live/events`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News live.events.update */
  async update(eventId: string, body: NewsLiveEventCommand, requestOptions?: ApiRequestOptions): Promise<NewsLiveEvent> {
    return this.client.request<NewsLiveEvent>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News live.events.publish */
  async publish(eventId: string, requestOptions?: ApiRequestOptions): Promise<NewsLiveEvent> {
    return this.client.request<NewsLiveEvent>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News live.events.close */
  async close(eventId: string, requestOptions?: ApiRequestOptions): Promise<NewsLiveEvent> {
    return this.client.request<NewsLiveEvent>(backendApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/close`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsLiveApi {
  public readonly events: NewsLiveEventsApi;
  public readonly updates: NewsLiveUpdatesApi;
  public readonly items: NewsLiveItemsApi;

  constructor(client: HttpClient) {
    this.events = new NewsLiveEventsApi(client);
    this.updates = new NewsLiveUpdatesApi(client);
    this.items = new NewsLiveItemsApi(client);
  }

}

export interface NewsCorrectionsManagementListParams {
  itemId?: string;
  correctionType?: string;
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsCorrectionsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News corrections.management.list */
  async list(params?: NewsCorrectionsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'correction_type', value: params?.correctionType, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/corrections`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsCorrectionsApi {
  private client: HttpClient;
  public readonly management: NewsCorrectionsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsCorrectionsManagementApi(client);
  }


/** News corrections.create */
  async create(body: NewsCorrectionNoticeCommand, requestOptions?: ApiRequestOptions): Promise<NewsCorrectionNotice> {
    return this.client.request<NewsCorrectionNotice>(backendApiPath(`/news/corrections`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News corrections.publish */
  async publish(correctionId: string, requestOptions?: ApiRequestOptions): Promise<NewsCorrectionNotice> {
    return this.client.request<NewsCorrectionNotice>(backendApiPath(`/news/corrections/${serializePathParameter(correctionId, { name: 'correctionId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News corrections.archive */
  async archive(correctionId: string, requestOptions?: ApiRequestOptions): Promise<NewsCorrectionNotice> {
    return this.client.request<NewsCorrectionNotice>(backendApiPath(`/news/corrections/${serializePathParameter(correctionId, { name: 'correctionId', style: 'simple', explode: false })}/archive`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsFactChecksManagementListParams {
  itemId?: string;
  verdict?: string;
  status?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsFactChecksManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News factChecks.management.list */
  async list(params?: NewsFactChecksManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'verdict', value: params?.verdict, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/fact_checks`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsFactChecksApi {
  private client: HttpClient;
  public readonly management: NewsFactChecksManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsFactChecksManagementApi(client);
  }


/** News factChecks.create */
  async create(body: NewsFactCheckCommand, requestOptions?: ApiRequestOptions): Promise<NewsFactCheck> {
    return this.client.request<NewsFactCheck>(backendApiPath(`/news/fact_checks`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News factChecks.publish */
  async publish(factCheckId: string, requestOptions?: ApiRequestOptions): Promise<NewsFactCheck> {
    return this.client.request<NewsFactCheck>(backendApiPath(`/news/fact_checks/${serializePathParameter(factCheckId, { name: 'factCheckId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News factChecks.archive */
  async archive(factCheckId: string, requestOptions?: ApiRequestOptions): Promise<NewsFactCheck> {
    return this.client.request<NewsFactCheck>(backendApiPath(`/news/fact_checks/${serializePathParameter(factCheckId, { name: 'factCheckId', style: 'simple', explode: false })}/archive`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsTrustItemsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News trust.items.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItemTrustSnapshot> {
    return this.client.request<NewsItemTrustSnapshot>(backendApiPath(`/news/trust/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }

/** News trust.items.upsert */
  async update(itemId: string, body: NewsItemTrustSnapshotCommand, requestOptions?: ApiRequestOptions): Promise<NewsItemTrustSnapshot> {
    return this.client.request<NewsItemTrustSnapshot>(backendApiPath(`/news/trust/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsTrustSourcesManagementListParams {
  sourceId?: string;
  credibilityStatus?: string;
  trustTier?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsTrustSourcesManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News trust.sources.management.list */
  async list(params?: NewsTrustSourcesManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'source_id', value: params?.sourceId, style: 'form', explode: true, allowReserved: false },
      { name: 'credibility_status', value: params?.credibilityStatus, style: 'form', explode: true, allowReserved: false },
      { name: 'trust_tier', value: params?.trustTier, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/trust/sources`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsTrustSourcesApi {
  private client: HttpClient;
  public readonly management: NewsTrustSourcesManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsTrustSourcesManagementApi(client);
  }


/** News trust.sources.upsert */
  async update(body: NewsSourceTrustProfileCommand, requestOptions?: ApiRequestOptions): Promise<NewsSourceTrustProfile> {
    return this.client.request<NewsSourceTrustProfile>(backendApiPath(`/news/trust/sources`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsTrustApi {
  public readonly sources: NewsTrustSourcesApi;
  public readonly items: NewsTrustItemsApi;

  constructor(client: HttpClient) {
    this.sources = new NewsTrustSourcesApi(client);
    this.items = new NewsTrustItemsApi(client);
  }

}

export class NewsDigestsItemsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News digests.items.attach */
  async create(digestId: string, body: NewsDigestItemCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(backendApiPath(`/news/digests/${serializePathParameter(digestId, { name: 'digestId', style: 'simple', explode: false })}/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsDigestsManagementListParams {
  digestType?: string;
  locale?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsDigestsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News digests.management.list */
  async list(params?: NewsDigestsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'digest_type', value: params?.digestType, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/digests`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsDigestsApi {
  private client: HttpClient;
  public readonly management: NewsDigestsManagementApi;
  public readonly items: NewsDigestsItemsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsDigestsManagementApi(client);
    this.items = new NewsDigestsItemsApi(client);
  }


/** News digests.create */
  async create(body: NewsDigestIssueCommand, requestOptions?: ApiRequestOptions): Promise<NewsDigestIssue> {
    return this.client.request<NewsDigestIssue>(backendApiPath(`/news/digests`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News digests.publish */
  async publish(digestId: string, requestOptions?: ApiRequestOptions): Promise<NewsDigestIssue> {
    return this.client.request<NewsDigestIssue>(backendApiPath(`/news/digests/${serializePathParameter(digestId, { name: 'digestId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsAlertsBreakingManagementListParams {
  severity?: string;
  targetType?: string;
  targetId?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsAlertsBreakingManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News alerts.breaking.management.list */
  async list(params?: NewsAlertsBreakingManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'severity', value: params?.severity, style: 'form', explode: true, allowReserved: false },
      { name: 'target_type', value: params?.targetType, style: 'form', explode: true, allowReserved: false },
      { name: 'target_id', value: params?.targetId, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/alerts/breaking`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsAlertsBreakingApi {
  private client: HttpClient;
  public readonly management: NewsAlertsBreakingManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsAlertsBreakingManagementApi(client);
  }


/** News alerts.breaking.create */
  async create(body: NewsBreakingAlertCommand, requestOptions?: ApiRequestOptions): Promise<NewsBreakingAlert> {
    return this.client.request<NewsBreakingAlert>(backendApiPath(`/news/alerts/breaking`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News alerts.breaking.update */
  async update(alertId: string, body: NewsBreakingAlertCommand, requestOptions?: ApiRequestOptions): Promise<NewsBreakingAlert> {
    return this.client.request<NewsBreakingAlert>(backendApiPath(`/news/alerts/breaking/${serializePathParameter(alertId, { name: 'alertId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News alerts.breaking.publish */
  async publish(alertId: string, requestOptions?: ApiRequestOptions): Promise<NewsBreakingAlert> {
    return this.client.request<NewsBreakingAlert>(backendApiPath(`/news/alerts/breaking/${serializePathParameter(alertId, { name: 'alertId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News alerts.breaking.cancel */
  async cancel(alertId: string, requestOptions?: ApiRequestOptions): Promise<NewsBreakingAlert> {
    return this.client.request<NewsBreakingAlert>(backendApiPath(`/news/alerts/breaking/${serializePathParameter(alertId, { name: 'alertId', style: 'simple', explode: false })}/cancel`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsAlertsApi {
  public readonly breaking: NewsAlertsBreakingApi;

  constructor(client: HttpClient) {
    this.breaking = new NewsAlertsBreakingApi(client);
  }

}

export interface NewsNotificationSubscriptionsManagementListParams {
  userId?: string;
  targetType?: string;
  targetId?: string;
  channel?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsNotificationSubscriptionsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News notification.subscriptions.management.list */
  async list(params?: NewsNotificationSubscriptionsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'target_type', value: params?.targetType, style: 'form', explode: true, allowReserved: false },
      { name: 'target_id', value: params?.targetId, style: 'form', explode: true, allowReserved: false },
      { name: 'channel', value: params?.channel, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/notification/subscriptions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsNotificationSubscriptionsApi {
  private client: HttpClient;
  public readonly management: NewsNotificationSubscriptionsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsNotificationSubscriptionsManagementApi(client);
  }


/** News notification.subscriptions.delete */
  async delete(subscriptionId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/notification/subscriptions/${serializePathParameter(subscriptionId, { name: 'subscriptionId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsNotificationApi {
  public readonly subscriptions: NewsNotificationSubscriptionsApi;

  constructor(client: HttpClient) {
    this.subscriptions = new NewsNotificationSubscriptionsApi(client);
  }

}

export interface NewsExperimentsManagementListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsExperimentsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News experiments.management.list */
  async list(params?: NewsExperimentsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsExperiment[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsExperiment[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/experiments`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsExperimentsApi {
  private client: HttpClient;
  public readonly management: NewsExperimentsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsExperimentsManagementApi(client);
  }


/** News experiments.create */
  async create(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsExperiment> {
    return this.client.request<NewsExperiment>(backendApiPath(`/news/experiments`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News experiments.update */
  async update(experimentId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsExperiment> {
    return this.client.request<NewsExperiment>(backendApiPath(`/news/experiments/${serializePathParameter(experimentId, { name: 'experimentId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News experiments.archive */
  async archive(experimentId: string, requestOptions?: ApiRequestOptions): Promise<NewsExperiment> {
    return this.client.request<NewsExperiment>(backendApiPath(`/news/experiments/${serializePathParameter(experimentId, { name: 'experimentId', style: 'simple', explode: false })}/archive`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsSearchProjectionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News search.projections.rebuild */
  async rebuild(requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(backendApiPath(`/news/search/projections/rebuild`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsSearchEventsListParams {
  q?: string;
  userId?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsSearchEventsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News search.events.list */
  async list(params?: NewsSearchEventsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsSearchEvent[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsSearchEvent[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/search/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface NewsSearchSuggestionsManagementListParams {
  q?: string;
  cursor?: string;
  pageSize?: number;
  locale?: string;
}

export class NewsSearchSuggestionsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News search.suggestions.management.list */
  async list(params?: NewsSearchSuggestionsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/search/suggestions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsSearchSuggestionsApi {
  private client: HttpClient;
  public readonly management: NewsSearchSuggestionsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsSearchSuggestionsManagementApi(client);
  }


/** News search.suggestions.upsert */
  async update(body: NewsSearchSuggestionCommand, requestOptions?: ApiRequestOptions): Promise<NewsSearchSuggestion> {
    return this.client.request<NewsSearchSuggestion>(backendApiPath(`/news/search/suggestions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News search.suggestions.delete */
  async delete(suggestionId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/search/suggestions/${serializePathParameter(suggestionId, { name: 'suggestionId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsSearchApi {
  public readonly suggestions: NewsSearchSuggestionsApi;
  public readonly events: NewsSearchEventsApi;
  public readonly projections: NewsSearchProjectionsApi;

  constructor(client: HttpClient) {
    this.suggestions = new NewsSearchSuggestionsApi(client);
    this.events = new NewsSearchEventsApi(client);
    this.projections = new NewsSearchProjectionsApi(client);
  }

}

export interface NewsInterestsManagementListParams {
  userId?: string;
  targetType?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsInterestsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News interests.management.list */
  async list(params?: NewsInterestsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'target_type', value: params?.targetType, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/interests`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsInterestsApi {
  private client: HttpClient;
  public readonly management: NewsInterestsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsInterestsManagementApi(client);
  }


/** News interests.rebuild */
  async rebuild(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(backendApiPath(`/news/interests/rebuild`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News interests.delete */
  async delete(interestId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/interests/${serializePathParameter(interestId, { name: 'interestId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface NewsFeedCandidatesListParams {
  streamKey?: string;
  userId?: string;
  cursor?: string;
  pageSize?: number;
}

export class NewsFeedCandidatesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News feed.candidates.list */
  async list(params?: NewsFeedCandidatesListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'stream_key', value: params?.streamKey, style: 'form', explode: true, allowReserved: false },
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/feed/candidates`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News feed.candidates.upsert */
  async update(body: NewsFeedCandidateCommand, requestOptions?: ApiRequestOptions): Promise<NewsFeedCandidate> {
    return this.client.request<NewsFeedCandidate>(backendApiPath(`/news/feed/candidates`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News feed.candidates.delete */
  async delete(candidateId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/feed/candidates/${serializePathParameter(candidateId, { name: 'candidateId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsFeedApi {
  public readonly candidates: NewsFeedCandidatesApi;

  constructor(client: HttpClient) {
    this.candidates = new NewsFeedCandidatesApi(client);
  }

}

export interface NewsTrendingMetricsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsTrendingMetricsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News trending.metrics.list */
  async list(params?: NewsTrendingMetricsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsTrendingMetric[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsTrendingMetric[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/trending/metrics`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News trending.metrics.upsert */
  async update(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsTrendingMetric> {
    return this.client.request<NewsTrendingMetric>(backendApiPath(`/news/trending/metrics`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsTrendingApi {
  public readonly metrics: NewsTrendingMetricsApi;

  constructor(client: HttpClient) {
    this.metrics = new NewsTrendingMetricsApi(client);
  }

}

export interface NewsReportsManagementListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsReportsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News reports.management.list */
  async list(params?: NewsReportsManagementListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(backendApiPath(`/news/reports`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsReportsApi {
  private client: HttpClient;
  public readonly management: NewsReportsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsReportsManagementApi(client);
  }


/** News reports.update */
  async update(reportId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(backendApiPath(`/news/reports/${serializePathParameter(reportId, { name: 'reportId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsCommentsModerationListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsCommentsModerationApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News comments.moderation.list */
  async list(params?: NewsCommentsModerationListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsComment[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsComment[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/comments/moderation`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News comments.moderation.update */
  async update(commentId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsComment> {
    return this.client.request<NewsComment>(backendApiPath(`/news/comments/${serializePathParameter(commentId, { name: 'commentId', style: 'simple', explode: false })}/moderation`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsCommentsApi {
  public readonly moderation: NewsCommentsModerationApi;

  constructor(client: HttpClient) {
    this.moderation = new NewsCommentsModerationApi(client);
  }

}

export interface NewsModerationCasesListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsModerationCasesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News moderation.cases.list */
  async list(params?: NewsModerationCasesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsModerationCase[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsModerationCase[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/moderation/cases`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News moderation.cases.retrieve */
  async retrieve(caseId: string, requestOptions?: ApiRequestOptions): Promise<NewsModerationCase> {
    return this.client.request<NewsModerationCase>(backendApiPath(`/news/moderation/cases/${serializePathParameter(caseId, { name: 'caseId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }

/** News moderation.cases.update */
  async update(caseId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsModerationCase> {
    return this.client.request<NewsModerationCase>(backendApiPath(`/news/moderation/cases/${serializePathParameter(caseId, { name: 'caseId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsModerationApi {
  public readonly cases: NewsModerationCasesApi;

  constructor(client: HttpClient) {
    this.cases = new NewsModerationCasesApi(client);
  }

}

export interface NewsTopicsManagementListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsTopicsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News topics.management.list */
  async list(params?: NewsTopicsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsTopic[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsTopic[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/topics`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsTopicsApi {
  private client: HttpClient;
  public readonly management: NewsTopicsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsTopicsManagementApi(client);
  }


/** News topics.create */
  async create(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsTopic> {
    return this.client.request<NewsTopic>(backendApiPath(`/news/topics`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News topics.update */
  async update(topicId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsTopic> {
    return this.client.request<NewsTopic>(backendApiPath(`/news/topics/${serializePathParameter(topicId, { name: 'topicId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News topics.delete */
  async delete(topicId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/topics/${serializePathParameter(topicId, { name: 'topicId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface NewsChannelsManagementListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsChannelsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News channels.management.list */
  async list(params?: NewsChannelsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsChannel[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsChannel[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/channels`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsChannelsApi {
  private client: HttpClient;
  public readonly management: NewsChannelsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsChannelsManagementApi(client);
  }


/** News channels.create */
  async create(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsChannel> {
    return this.client.request<NewsChannel>(backendApiPath(`/news/channels`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News channels.update */
  async update(channelId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsChannel> {
    return this.client.request<NewsChannel>(backendApiPath(`/news/channels/${serializePathParameter(channelId, { name: 'channelId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News channels.delete */
  async delete(channelId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/channels/${serializePathParameter(channelId, { name: 'channelId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface NewsAuthorsManagementListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsAuthorsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News authors.management.list */
  async list(params?: NewsAuthorsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsAuthor[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsAuthor[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/authors`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsAuthorsApi {
  private client: HttpClient;
  public readonly management: NewsAuthorsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsAuthorsManagementApi(client);
  }


/** News authors.create */
  async create(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsAuthor> {
    return this.client.request<NewsAuthor>(backendApiPath(`/news/authors`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News authors.update */
  async update(authorId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsAuthor> {
    return this.client.request<NewsAuthor>(backendApiPath(`/news/authors/${serializePathParameter(authorId, { name: 'authorId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News authors.delete */
  async delete(authorId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/authors/${serializePathParameter(authorId, { name: 'authorId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface NewsSourcesManagementListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsSourcesManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News sources.management.list */
  async list(params?: NewsSourcesManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsSource[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsSource[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/sources`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsSourcesApi {
  private client: HttpClient;
  public readonly management: NewsSourcesManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsSourcesManagementApi(client);
  }


/** News sources.create */
  async create(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsSource> {
    return this.client.request<NewsSource>(backendApiPath(`/news/sources`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News sources.update */
  async update(sourceId: string, body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<NewsSource> {
    return this.client.request<NewsSource>(backendApiPath(`/news/sources/${serializePathParameter(sourceId, { name: 'sourceId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News sources.delete */
  async delete(sourceId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/sources/${serializePathParameter(sourceId, { name: 'sourceId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface NewsItemsMetricsListParams {
  cursor?: string;
  pageSize?: number;
}

export class NewsItemsMetricsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.metrics.list */
  async list(params?: NewsItemsMetricsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItemMetricSnapshot[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsItemMetricSnapshot[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/items/metrics`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News items.metrics.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItemMetricSnapshot> {
    return this.client.request<NewsItemMetricSnapshot>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/metrics`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }

/** News items.metrics.rebuild */
  async rebuild(body: NewsGenericCommand, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(backendApiPath(`/news/items/metrics/rebuild`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsItemsMediaApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.media.list */
  async list(itemId: string, requestOptions?: ApiRequestOptions): Promise<{ items: MediaResource[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: MediaResource[]; pageInfo: PageInfo; }>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/media`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News items.media.attach */
  async create(itemId: string, body: MediaResource, requestOptions?: ApiRequestOptions): Promise<MediaResource> {
    return this.client.request<MediaResource>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/media`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News items.media.delete */
  async delete(itemId: string, mediaId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/media/${serializePathParameter(mediaId, { name: 'mediaId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsItemsVersionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.versions.list */
  async list(itemId: string, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItem[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: NewsItem[]; pageInfo: PageInfo; }>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/versions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** News items.versions.create */
  async create(itemId: string, body: NewsItemCommand, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/versions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class NewsItemsEditorialReadinessApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.editorialReadiness.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsEditorialReadiness> {
    return this.client.request<NewsEditorialReadiness>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/editorial_readiness`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface NewsItemsManagementListParams {
  categoryId?: string;
  q?: string;
  status?: string;
}

export class NewsItemsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.management.list */
  async list(params?: NewsItemsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: NewsItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'categoryId', value: params?.categoryId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: NewsItem[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/news/items`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsItemsApi {
  private client: HttpClient;
  public readonly management: NewsItemsManagementApi;
  public readonly editorialReadiness: NewsItemsEditorialReadinessApi;
  public readonly versions: NewsItemsVersionsApi;
  public readonly media: NewsItemsMediaApi;
  public readonly metrics: NewsItemsMetricsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsItemsManagementApi(client);
    this.editorialReadiness = new NewsItemsEditorialReadinessApi(client);
    this.versions = new NewsItemsVersionsApi(client);
    this.media = new NewsItemsMediaApi(client);
    this.metrics = new NewsItemsMetricsApi(client);
  }


/** News items.create */
  async create(body: NewsItemCommand, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News items.update */
  async update(itemId: string, body: NewsItemCommand, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News items.delete */
  async delete(itemId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }

/** News items.publish */
  async publish(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News items.schedule */
  async schedule(itemId: string, body: NewsScheduleCommand, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/schedule`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News items.archive */
  async archive(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/archive`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** News items.feature */
  async feature(itemId: string, requestOptions?: ApiRequestOptions): Promise<NewsItem> {
    return this.client.request<NewsItem>(backendApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/feature`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class NewsCategoriesManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News categories.management.list */
  async list(requestOptions?: ApiRequestOptions): Promise<{ items: NewsCategory[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: NewsCategory[]; pageInfo: PageInfo; }>(backendApiPath(`/news/categories`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class NewsCategoriesApi {
  private client: HttpClient;
  public readonly management: NewsCategoriesManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new NewsCategoriesManagementApi(client);
  }


/** News categories.create */
  async create(body: NewsCategoryCommand, requestOptions?: ApiRequestOptions): Promise<NewsCategory> {
    return this.client.request<NewsCategory>(backendApiPath(`/news/categories`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News categories.update */
  async update(categoryId: string, body: NewsCategoryCommand, requestOptions?: ApiRequestOptions): Promise<NewsCategory> {
    return this.client.request<NewsCategory>(backendApiPath(`/news/categories/${serializePathParameter(categoryId, { name: 'categoryId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** News categories.delete */
  async delete(categoryId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(backendApiPath(`/news/categories/${serializePathParameter(categoryId, { name: 'categoryId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class NewsApi {
  public readonly categories: NewsCategoriesApi;
  public readonly items: NewsItemsApi;
  public readonly sources: NewsSourcesApi;
  public readonly authors: NewsAuthorsApi;
  public readonly channels: NewsChannelsApi;
  public readonly topics: NewsTopicsApi;
  public readonly moderation: NewsModerationApi;
  public readonly comments: NewsCommentsApi;
  public readonly reports: NewsReportsApi;
  public readonly trending: NewsTrendingApi;
  public readonly feed: NewsFeedApi;
  public readonly interests: NewsInterestsApi;
  public readonly search: NewsSearchApi;
  public readonly experiments: NewsExperimentsApi;
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
    this.sources = new NewsSourcesApi(client);
    this.authors = new NewsAuthorsApi(client);
    this.channels = new NewsChannelsApi(client);
    this.topics = new NewsTopicsApi(client);
    this.moderation = new NewsModerationApi(client);
    this.comments = new NewsCommentsApi(client);
    this.reports = new NewsReportsApi(client);
    this.trending = new NewsTrendingApi(client);
    this.feed = new NewsFeedApi(client);
    this.interests = new NewsInterestsApi(client);
    this.search = new NewsSearchApi(client);
    this.experiments = new NewsExperimentsApi(client);
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
