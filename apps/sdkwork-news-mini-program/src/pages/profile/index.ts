import { toFeedCardView, type NewsFeedCardView } from "@sdkwork/news-mp-news";

import { getNewsMiniProgramRuntime } from "../../bootstrap/runtime.js";

const SAVED_KEY = "sdkwork.news.saved.v1";

interface ProfilePageData {
  errorMessage: string;
  interests: readonly string[];
  menu: readonly { readonly label: string; readonly value: string }[];
  savedCount: number;
  savedItems: readonly NewsFeedCardView[];
  statusBarHeight: number;
}

interface ProfilePageContext {
  data: ProfilePageData;
  setData(data: Partial<ProfilePageData>): void;
}

interface ProfilePageConfig {
  data: ProfilePageData;
  onShow(this: ProfilePageContext): void;
  clearSaved(this: ProfilePageContext): void;
  openArticle(this: ProfilePageContext, event: WeixinEvent): void;
  openSearch(this: ProfilePageContext): void;
  showNotice(this: ProfilePageContext, event: WeixinEvent): void;
}

interface WeixinEvent {
  currentTarget: { dataset: Record<string, string | undefined> };
}

Page<ProfilePageConfig>({
  data: {
    errorMessage: "",
    interests: ["AI Agent", "供应链", "新能源"],
    menu: [
      { label: "阅读设置", value: "字号、自动播放与数据同步" },
      { label: "通知与提醒", value: "每日简报与突发新闻" },
      { label: "隐私与安全", value: "本地收藏与阅读记录" },
      { label: "关于 SDKWork 头条", value: "版本 0.1.0" },
    ],
    savedCount: 0,
    savedItems: [],
    statusBarHeight: 24,
  },

  onShow() {
    this.setData({
      statusBarHeight: getNewsMiniProgramRuntime().host.statusBarHeight(),
    });
    void loadProfile(this);
  },

  clearSaved() {
    const runtime = getNewsMiniProgramRuntime();
    void runtime.host.setStorage(SAVED_KEY, []).then(() => {
      this.setData({ savedCount: 0, savedItems: [] });
      void runtime.host.showToast("已清空收藏");
    });
  },

  openArticle(this: ProfilePageContext, event: WeixinEvent) {
    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    void getNewsMiniProgramRuntime().host.navigateTo(
      `/subpackages/news/pages/article/index?id=${encodeURIComponent(id)}`,
    );
  },

  openSearch() {
    void getNewsMiniProgramRuntime().host.navigateTo("/pages/search/index");
  },

  showNotice(this: ProfilePageContext, event: WeixinEvent) {
    const label = event.currentTarget.dataset.label ?? "该功能";
    void getNewsMiniProgramRuntime().host.showToast(`${label}将在正式版本开放`);
  },
});

async function loadProfile(page: ProfilePageContext): Promise<void> {
  const runtime = getNewsMiniProgramRuntime();
  try {
    const savedIds = await runtime.host.getStorage<string[]>(SAVED_KEY) ?? [];
    const articles = await Promise.all(
      savedIds.slice(0, 5).map((id) => runtime.service.getArticle(id).catch(() => undefined)),
    );
    page.setData({
      errorMessage: "",
      savedCount: savedIds.length,
      savedItems: articles
        .filter((article): article is NonNullable<typeof article> => Boolean(article))
        .map(toFeedCardView),
    });
  } catch (error) {
    page.setData({
      errorMessage: error instanceof Error ? error.message : "收藏加载失败",
    });
  }
}
