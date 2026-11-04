import type { NewsChannel } from "@sdkwork/news-mp-core";
import {
  toFeedCardView,
  type NewsFeedCardView,
} from "@sdkwork/news-mp-news";
import { formatMiniProgramToday } from "@sdkwork/news-mp-commons";

import { getNewsMiniProgramRuntime } from "../../bootstrap/runtime.js";

const TOPICS = ["AI Agent", "低空经济", "美联储", "供应链", "新能源"] as const;

interface FeedPageData {
  activeChannelId: string;
  cards: NewsFeedCardView[];
  channels: readonly NewsChannel[];
  errorMessage: string;
  hasMore: boolean;
  hero?: NewsFeedCardView;
  hotTitle: string;
  loading: boolean;
  loadingMore: boolean;
  nextCursor: string;
  statusBarHeight: number;
  today: string;
  topics: string[];
}

interface FeedPageContext {
  data: FeedPageData;
  setData(data: Partial<FeedPageData>): void;
}

interface FeedPageConfig {
  data: FeedPageData;
  onLoad(this: FeedPageContext): void;
  onReachBottom(this: FeedPageContext): void;
  onShareAppMessage(): { title: string; path: string };
  openArticle(this: FeedPageContext, event: WeixinEvent): void;
  openRanking(this: FeedPageContext): void;
  openSearch(this: FeedPageContext): void;
  openTopic(this: FeedPageContext, event: WeixinEvent): void;
  retry(this: FeedPageContext): void;
  selectChannel(this: FeedPageContext, event: WeixinEvent): void;
}

interface WeixinEvent {
  currentTarget: { dataset: Record<string, string | undefined> };
}

Page<FeedPageConfig>({
  data: {
    activeChannelId: "recommended",
    cards: [],
    channels: [],
    errorMessage: "",
    hasMore: false,
    hotTitle: "实时热点正在聚合",
    loading: true,
    loadingMore: false,
    nextCursor: "",
    statusBarHeight: 24,
    today: formatMiniProgramToday(),
    topics: [...TOPICS],
  },

  onLoad() {
    const runtime = getNewsMiniProgramRuntime();
    this.setData({ statusBarHeight: runtime.host.statusBarHeight() });
    void loadInitial(this);
  },

  onReachBottom() {
    if (this.data.loading || this.data.loadingMore || !this.data.hasMore) {
      return;
    }
    void loadMore(this);
  },

  onShareAppMessage() {
    return {
      path: "/pages/feed/index",
      title: "SDKWork 头条 · 今日资讯",
    };
  },

  openArticle(this: FeedPageContext, event: WeixinEvent) {
    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    void getNewsMiniProgramRuntime().host.navigateTo(
      `/subpackages/news/pages/article/index?id=${encodeURIComponent(id)}`,
    );
  },

  openRanking() {
    void getNewsMiniProgramRuntime().host.switchTab("/pages/ranking/index");
  },

  openSearch() {
    void getNewsMiniProgramRuntime().host.navigateTo("/pages/search/index");
  },

  openTopic(this: FeedPageContext, event: WeixinEvent) {
    const topic = event.currentTarget.dataset.topic;
    if (!topic) {
      return;
    }
    void getNewsMiniProgramRuntime().host.navigateTo(
      `/pages/search/index?q=${encodeURIComponent(topic)}`,
    );
  },

  retry() {
    void loadInitial(this);
  },

  selectChannel(this: FeedPageContext, event: WeixinEvent) {
    const channelId = event.currentTarget.dataset.id;
    if (!channelId || channelId === this.data.activeChannelId) {
      return;
    }
    this.setData({
      activeChannelId: channelId,
      cards: [],
      errorMessage: "",
      hero: undefined,
      loading: true,
    });
    void loadChannel(this, channelId);
  },
});

async function loadInitial(page: FeedPageContext): Promise<void> {
  page.setData({ loading: true, errorMessage: "" });
  try {
    const runtime = getNewsMiniProgramRuntime();
    const [channels, pageData, trending] = await Promise.all([
      runtime.service.listChannels(),
      runtime.service.listFeed({ channelId: "recommended", pageSize: 20 }),
      runtime.service.listTrending(),
    ]);
    const views = pageData.items.map(toFeedCardView);
    const hero = views.find((item) => item.featured) ?? views[0];
    page.setData({
      cards: hero ? views.filter((item) => item.id !== hero.id) : views,
      channels,
      hasMore: pageData.hasMore,
      hero,
      hotTitle: trending.items[0]?.title ?? "实时热点正在聚合",
      loading: false,
      nextCursor: pageData.nextCursor ?? "",
    });
  } catch (error) {
    page.setData({
      errorMessage: error instanceof Error ? error.message : "资讯加载失败",
      loading: false,
    });
  }
}

async function loadChannel(page: FeedPageContext, channelId: string): Promise<void> {
  try {
    const pageData = await getNewsMiniProgramRuntime().service.listFeed({
      channelId,
      pageSize: 20,
    });
    const views = pageData.items.map(toFeedCardView);
    page.setData({
      cards: views,
      hasMore: pageData.hasMore,
      hero: undefined,
      loading: false,
      nextCursor: pageData.nextCursor ?? "",
    });
  } catch (error) {
    page.setData({
      errorMessage: error instanceof Error ? error.message : "频道加载失败",
      loading: false,
    });
  }
}

async function loadMore(page: FeedPageContext): Promise<void> {
  if (!page.data.nextCursor) {
    return;
  }
  page.setData({ loadingMore: true });
  try {
    const pageData = await getNewsMiniProgramRuntime().service.listFeed({
      channelId: page.data.activeChannelId,
      cursor: page.data.nextCursor,
      pageSize: 20,
    });
    const seen = new Set(page.data.cards.map((item) => item.id));
    page.setData({
      cards: [
        ...page.data.cards,
        ...pageData.items.map(toFeedCardView).filter((item) => !seen.has(item.id)),
      ],
      hasMore: pageData.hasMore,
      loadingMore: false,
      nextCursor: pageData.nextCursor ?? "",
    });
  } catch {
    page.setData({ loadingMore: false });
  }
}
