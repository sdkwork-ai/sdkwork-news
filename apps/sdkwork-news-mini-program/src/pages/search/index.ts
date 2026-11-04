import { toFeedCardView, type NewsFeedCardView } from "@sdkwork/news-mp-news";

import { getNewsMiniProgramRuntime } from "../../bootstrap/runtime.js";

const SUGGESTIONS = ["AI Agent", "低空经济", "美联储", "供应链", "新能源"] as const;

interface SearchPageData {
  errorMessage: string;
  inputValue: string;
  loading: boolean;
  query: string;
  results: readonly NewsFeedCardView[];
  searched: boolean;
  statusBarHeight: number;
  suggestions: readonly string[];
}

interface SearchPageContext {
  data: SearchPageData;
  setData(data: Partial<SearchPageData>): void;
}

interface SearchPageConfig {
  data: SearchPageData;
  onLoad(this: SearchPageContext, options: Record<string, string | undefined>): void;
  clear(this: SearchPageContext): void;
  goBack(this: SearchPageContext): void;
  onInput(this: SearchPageContext, event: WeixinInputEvent): void;
  openArticle(this: SearchPageContext, event: WeixinEvent): void;
  pickSuggestion(this: SearchPageContext, event: WeixinEvent): void;
  submit(this: SearchPageContext): void;
}

interface WeixinEvent {
  currentTarget: { dataset: Record<string, string | undefined> };
}

interface WeixinInputEvent {
  detail: { value: string };
}

Page<SearchPageConfig>({
  data: {
    errorMessage: "",
    inputValue: "",
    loading: false,
    query: "",
    results: [],
    searched: false,
    statusBarHeight: 24,
    suggestions: [...SUGGESTIONS],
  },

  onLoad(this: SearchPageContext, options: Record<string, string | undefined>) {
    const runtime = getNewsMiniProgramRuntime();
    const query = options.q ?? "";
    this.setData({
      inputValue: query,
      query,
      statusBarHeight: runtime.host.statusBarHeight(),
    });
    if (query) {
      void runSearch(this, query);
    }
  },

  clear() {
    this.setData({ errorMessage: "", inputValue: "", query: "", results: [], searched: false });
  },

  goBack() {
    void getNewsMiniProgramRuntime().host.navigateBack();
  },

  onInput(this: SearchPageContext, event: WeixinInputEvent) {
    this.setData({ inputValue: event.detail.value });
  },

  openArticle(this: SearchPageContext, event: WeixinEvent) {
    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    void getNewsMiniProgramRuntime().host.navigateTo(
      `/subpackages/news/pages/article/index?id=${encodeURIComponent(id)}`,
    );
  },

  pickSuggestion(this: SearchPageContext, event: WeixinEvent) {
    const value = event.currentTarget.dataset.value;
    if (!value) {
      return;
    }
    this.setData({ inputValue: value });
    void runSearch(this, value);
  },

  submit() {
    const query = this.data.inputValue.trim();
    if (!query) {
      void getNewsMiniProgramRuntime().host.showToast("请输入搜索关键词");
      return;
    }
    void runSearch(this, query);
  },
});

async function runSearch(page: SearchPageContext, query: string): Promise<void> {
  page.setData({ errorMessage: "", loading: true, query, searched: true });
  try {
    const result = await getNewsMiniProgramRuntime().service.listFeed({
      pageSize: 20,
      q: query,
    });
    page.setData({
      loading: false,
      results: result.items.map(toFeedCardView),
    });
  } catch (error) {
    page.setData({
      errorMessage: error instanceof Error ? error.message : "搜索失败",
      loading: false,
    });
  }
}
