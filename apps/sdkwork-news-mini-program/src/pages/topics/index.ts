import { getNewsMiniProgramRuntime } from "../../bootstrap/runtime.js";

interface TopicCard {
  readonly count: string;
  readonly description: string;
  readonly image: string;
  readonly query: string;
  readonly tag: string;
  readonly title: string;
}

interface TopicsPageData {
  statusBarHeight: number;
  topics: readonly TopicCard[];
}

interface TopicsPageContext {
  data: TopicsPageData;
  setData(data: Partial<TopicsPageData>): void;
}

interface TopicsPageConfig {
  data: TopicsPageData;
  onLoad(this: TopicsPageContext): void;
  openTopic(this: TopicsPageContext, event: WeixinEvent): void;
}

interface WeixinEvent {
  currentTarget: { dataset: Record<string, string | undefined> };
}

const TOPICS: readonly TopicCard[] = [
  {
    count: "1.2 万篇",
    description: "从模型能力到企业工作流，追踪 Agent 落地与评估标准。",
    image: "/assets/news/ai-chips.jpg",
    query: "AI Agent",
    tag: "科技",
    title: "AI Agent 落地",
  },
  {
    count: "8,640 篇",
    description: "资金面、政策信号与机构策略的实时变化。",
    image: "/assets/news/markets.jpg",
    query: "美联储",
    tag: "财经",
    title: "美联储与流动性",
  },
  {
    count: "6,210 篇",
    description: "区域化、库存与多源策略，制造企业如何重新校准。",
    image: "/assets/news/logistics.jpg",
    query: "供应链",
    tag: "国际",
    title: "全球供应链重构",
  },
  {
    count: "4,380 篇",
    description: "储能、光伏与电力市场改革带来的资产重估。",
    image: "/assets/news/workspace.jpg",
    query: "新能源",
    tag: "科技",
    title: "新能源价值重估",
  },
];

Page<TopicsPageConfig>({
  data: {
    statusBarHeight: 24,
    topics: TOPICS,
  },

  onLoad() {
    this.setData({
      statusBarHeight: getNewsMiniProgramRuntime().host.statusBarHeight(),
    });
  },

  openTopic(this: TopicsPageContext, event: WeixinEvent) {
    const query = event.currentTarget.dataset.query;
    if (!query) {
      return;
    }
    void getNewsMiniProgramRuntime().host.navigateTo(
      `/pages/search/index?q=${encodeURIComponent(query)}`,
    );
  },
});
