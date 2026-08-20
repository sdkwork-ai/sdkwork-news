import { customApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { ChannelsFeedListResponse, ChannelsListResponse, ItemsBySlugRetrieveResponse, ItemsListResponse, ItemsRelatedListResponse, ItemsRetrieveResponse, LiveEventsRetrieveResponse, SdkWorkListResponse, SearchListResponse, TopicsItemsListResponse, TopicsListResponse, TrendingListResponse, TrustItemRetrieveResponse } from '../types';


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
  async list(eventId: string, params?: NewsLiveUpdatesListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}/updates`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsLiveEventsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'event_type', value: params?.eventType, style: 'form', explode: true, allowReserved: false },
      { name: 'region', value: params?.region, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/live/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
  }

/** News live.events.retrieve */
  async retrieve(eventId: string, requestOptions?: ApiRequestOptions): Promise<LiveEventsRetrieveResponse> {
    return this.client.request<LiveEventsRetrieveResponse>(customApiPath(`/news/live/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsCorrectionsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'correction_type', value: params?.correctionType, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/corrections`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsFactChecksListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'verdict', value: params?.verdict, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/fact_checks`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
  }
}

export class NewsTrustItemApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News trust.item.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<TrustItemRetrieveResponse> {
    return this.client.request<TrustItemRetrieveResponse>(customApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/trust`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsDigestsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'digest_type', value: params?.digestType, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/digests`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsAlertsBreakingListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'severity', value: params?.severity, style: 'form', explode: true, allowReserved: false },
      { name: 'target_type', value: params?.targetType, style: 'form', explode: true, allowReserved: false },
      { name: 'target_id', value: params?.targetId, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/alerts/breaking`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
  }
}

export class NewsAlertsApi {
  public readonly breaking: NewsAlertsBreakingApi;

  constructor(client: HttpClient) {
    this.breaking = new NewsAlertsBreakingApi(client);
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
  async list(params?: NewsSearchSuggestionsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkListResponse> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkListResponse>(appendQueryString(customApiPath(`/news/search/suggestions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsSearchListParams, requestOptions?: ApiRequestOptions): Promise<SearchListResponse> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SearchListResponse>(appendQueryString(customApiPath(`/news/search`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsTrendingListParams, requestOptions?: ApiRequestOptions): Promise<TrendingListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<TrendingListResponse>(appendQueryString(customApiPath(`/news/trending`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(topicId: string, params?: NewsTopicsItemsListParams, requestOptions?: ApiRequestOptions): Promise<TopicsItemsListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'trace_id', value: params?.traceId, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<TopicsItemsListResponse>(appendQueryString(customApiPath(`/news/topics/${serializePathParameter(topicId, { name: 'topicId', style: 'simple', explode: false })}/items`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsTopicsListParams, requestOptions?: ApiRequestOptions): Promise<TopicsListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<TopicsListResponse>(appendQueryString(customApiPath(`/news/topics`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(channelId: string, params?: NewsChannelsFeedListParams, requestOptions?: ApiRequestOptions): Promise<ChannelsFeedListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'trace_id', value: params?.traceId, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<ChannelsFeedListResponse>(appendQueryString(customApiPath(`/news/channels/${serializePathParameter(channelId, { name: 'channelId', style: 'simple', explode: false })}/feed`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsChannelsListParams, requestOptions?: ApiRequestOptions): Promise<ChannelsListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<ChannelsListResponse>(appendQueryString(customApiPath(`/news/channels`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(itemId: string, params?: NewsItemsRelatedListParams, requestOptions?: ApiRequestOptions): Promise<ItemsRelatedListResponse> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<ItemsRelatedListResponse>(appendQueryString(customApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}/related`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
  }
}

export class NewsItemsBySlugApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** News items.bySlug.retrieve */
  async retrieve(slug: string, requestOptions?: ApiRequestOptions): Promise<ItemsBySlugRetrieveResponse> {
    return this.client.request<ItemsBySlugRetrieveResponse>(customApiPath(`/news/items/by_slug/${serializePathParameter(slug, { name: 'slug', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
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
  async list(params?: NewsItemsListParams, requestOptions?: ApiRequestOptions): Promise<ItemsListResponse> {
    const query = buildQueryString([
      { name: 'categoryId', value: params?.categoryId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<ItemsListResponse>(appendQueryString(customApiPath(`/news/items`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
  }

/** News items.retrieve */
  async retrieve(itemId: string, requestOptions?: ApiRequestOptions): Promise<ItemsRetrieveResponse> {
    return this.client.request<ItemsRetrieveResponse>(customApiPath(`/news/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any });
  }
}

export class NewsApi {
  public readonly items: NewsItemsApi;
  public readonly channels: NewsChannelsApi;
  public readonly topics: NewsTopicsApi;
  public readonly trending: NewsTrendingApi;
  public readonly search: NewsSearchApi;
  public readonly alerts: NewsAlertsApi;
  public readonly digests: NewsDigestsApi;
  public readonly trust: NewsTrustApi;
  public readonly factChecks: NewsFactChecksApi;
  public readonly corrections: NewsCorrectionsApi;
  public readonly live: NewsLiveApi;

  constructor(client: HttpClient) {
    this.items = new NewsItemsApi(client);
    this.channels = new NewsChannelsApi(client);
    this.topics = new NewsTopicsApi(client);
    this.trending = new NewsTrendingApi(client);
    this.search = new NewsSearchApi(client);
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
