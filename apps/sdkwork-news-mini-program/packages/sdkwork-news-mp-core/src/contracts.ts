export type NewsMiniProgramEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export type NewsMiniProgramDeploymentProfile = "standalone" | "cloud";

export type NewsMiniProgramPlatform = "mp-weixin";

export interface NewsMiniProgramRuntimeConfig {
  readonly accessToken: string;
  readonly appId: string;
  readonly deploymentProfile: NewsMiniProgramDeploymentProfile;
  readonly environment: NewsMiniProgramEnvironment;
  readonly platform: NewsMiniProgramPlatform;
  readonly profileId: string;
  readonly runtimeTarget: "mini-program";
}

export interface NewsChannel {
  readonly id: string;
  readonly title: string;
}

export interface NewsItem {
  readonly categoryId: string;
  readonly featured: boolean;
  readonly id: string;
  readonly image?: string;
  readonly publishedLabel: string;
  readonly readMinutes?: number;
  readonly source: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly title: string;
}

export interface NewsArticle extends NewsItem {
  readonly body: readonly string[];
}

export interface NewsPage {
  readonly hasMore: boolean;
  readonly items: readonly NewsItem[];
  readonly nextCursor?: string;
}

export interface NewsListInput {
  readonly channelId?: string;
  readonly cursor?: string;
  readonly pageSize?: number;
  readonly q?: string;
}

/** User-facing news port. Implementations are injected by the root bootstrap. */
export interface NewsMiniProgramService {
  getArticle(itemId: string): Promise<NewsArticle>;
  listChannels(): Promise<readonly NewsChannel[]>;
  listFeed(input?: NewsListInput): Promise<NewsPage>;
  listTrending(): Promise<NewsPage>;
  setFavorite?(itemId: string, favorite: boolean): Promise<void>;
}

export type HostErrorCode =
  | "cancelled"
  | "invalid-state"
  | "permission-denied"
  | "unavailable"
  | "unsupported";

export class NewsHostError extends Error {
  constructor(
    readonly code: HostErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "NewsHostError";
  }
}

/** Platform capabilities consumed by feature packages through injection. */
export interface NewsMiniProgramHost {
  copyText(text: string): Promise<void>;
  getStorage<T>(key: string): Promise<T | undefined>;
  navigateBack(): Promise<void>;
  navigateTo(url: string): Promise<void>;
  setStorage<T>(key: string, value: T): Promise<void>;
  showToast(message: string): Promise<void>;
  statusBarHeight(): number;
  switchTab(url: string): Promise<void>;
}
