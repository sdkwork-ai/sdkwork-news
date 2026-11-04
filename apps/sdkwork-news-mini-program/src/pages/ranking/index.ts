import { toFeedCardView, type NewsFeedCardView } from "@sdkwork/news-mp-news";

import { getNewsMiniProgramRuntime } from "../../bootstrap/runtime.js";

interface RankingPageData {
  errorMessage: string;
  loading: boolean;
  statusBarHeight: number;
  items: readonly (NewsFeedCardView & { rank: number; isHot: boolean })[];
}

interface RankingPageContext {
  data: RankingPageData;
  setData(data: Partial<RankingPageData>): void;
}

interface RankingPageConfig {
  data: RankingPageData;
  onLoad(this: RankingPageContext): void;
  onShareAppMessage(): { title: string; path: string };
  openArticle(this: RankingPageContext, event: WeixinEvent): void;
  retry(this: RankingPageContext): void;
}

interface WeixinEvent {
  currentTarget: { dataset: Record<string, string | undefined> };
}

Page<RankingPageConfig>({
  data: {
    errorMessage: "",
    items: [],
    loading: true,
    statusBarHeight: 24,
  },

  onLoad() {
    this.setData({
      statusBarHeight: getNewsMiniProgramRuntime().host.statusBarHeight(),
    });
    void loadRanking(this);
  },

  onShareAppMessage() {
    return { path: "/pages/ranking/index", title: "SDKWork 头条 · 今日热榜" };
  },

  openArticle(this: RankingPageContext, event: WeixinEvent) {
    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    void getNewsMiniProgramRuntime().host.navigateTo(
      `/subpackages/news/pages/article/index?id=${encodeURIComponent(id)}`,
    );
  },

  retry() {
    void loadRanking(this);
  },
});

async function loadRanking(page: RankingPageContext): Promise<void> {
  page.setData({ errorMessage: "", loading: true });
  try {
    const result = await getNewsMiniProgramRuntime().service.listTrending();
    page.setData({
      items: result.items.map((item, index) => ({
        ...toFeedCardView(item),
        isHot: index < 3,
        rank: index + 1,
      })),
      loading: false,
    });
  } catch (error) {
    page.setData({
      errorMessage: error instanceof Error ? error.message : "热榜加载失败",
      loading: false,
    });
  }
}
