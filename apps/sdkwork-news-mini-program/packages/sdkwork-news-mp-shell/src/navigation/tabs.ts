import { NEWS_MINI_PROGRAM_ROUTES } from "@sdkwork/news-mp-core";

export type NewsMiniProgramTabId = "feed" | "ranking" | "topics" | "profile";

export interface NewsMiniProgramTab {
  readonly iconPath: string;
  readonly id: NewsMiniProgramTabId;
  readonly labelKey: string;
  readonly pagePath: string;
  readonly routeId: string;
  readonly selectedIconPath: string;
}

export const NEWS_MINI_PROGRAM_TABS: readonly NewsMiniProgramTab[] = [
  {
    iconPath: "assets/tabbar/home.png",
    id: "feed",
    labelKey: "nav.home",
    pagePath: "pages/feed/index",
    routeId: NEWS_MINI_PROGRAM_ROUTES.feed,
    selectedIconPath: "assets/tabbar/home-active.png",
  },
  {
    iconPath: "assets/tabbar/ranking.png",
    id: "ranking",
    labelKey: "nav.ranking",
    pagePath: "pages/ranking/index",
    routeId: NEWS_MINI_PROGRAM_ROUTES.ranking,
    selectedIconPath: "assets/tabbar/ranking-active.png",
  },
  {
    iconPath: "assets/tabbar/topics.png",
    id: "topics",
    labelKey: "nav.topics",
    pagePath: "pages/topics/index",
    routeId: NEWS_MINI_PROGRAM_ROUTES.topics,
    selectedIconPath: "assets/tabbar/topics-active.png",
  },
  {
    iconPath: "assets/tabbar/profile.png",
    id: "profile",
    labelKey: "nav.account",
    pagePath: "pages/profile/index",
    routeId: NEWS_MINI_PROGRAM_ROUTES.profile,
    selectedIconPath: "assets/tabbar/profile-active.png",
  },
];

export const NEWS_MINI_PROGRAM_TAB_ROOTS: readonly string[] =
  NEWS_MINI_PROGRAM_TABS.map((tab) => tab.pagePath);
