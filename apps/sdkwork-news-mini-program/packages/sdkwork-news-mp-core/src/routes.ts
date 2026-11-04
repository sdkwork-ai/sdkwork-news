export const NEWS_MINI_PROGRAM_ROUTES = {
  article: "app.news.article.detail",
  feed: "app.news.feed.home",
  profile: "app.account.profile.home",
  ranking: "app.news.ranking.list",
  search: "app.news.search.results",
  topics: "app.news.topics.list",
} as const;

export type NewsMiniProgramRouteId =
  (typeof NEWS_MINI_PROGRAM_ROUTES)[keyof typeof NEWS_MINI_PROGRAM_ROUTES];

export interface NewsMiniProgramRoute {
  readonly auth: "public" | "required";
  readonly id: NewsMiniProgramRouteId;
  readonly pagePath: string;
  readonly titleKey: string;
}
