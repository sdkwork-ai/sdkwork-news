import type { NewsArticle, NewsItem } from "@sdkwork/news-mp-core";

export interface NewsFeedCardView {
  readonly categoryLabel: string;
  readonly featured: boolean;
  readonly id: string;
  readonly image?: string;
  readonly publishedLabel: string;
  readonly readLabel: string;
  readonly source: string;
  readonly summary: string;
  readonly title: string;
}

export interface NewsArticleView extends NewsFeedCardView {
  readonly body: readonly string[];
  readonly keyPoints: readonly string[];
  readonly tags: readonly string[];
}

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  business: "商业",
  finance: "财经",
  headlines: "要闻",
  policy: "政策",
  technology: "科技",
  world: "国际",
};

export function resolveCategoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] ?? categoryId;
}

export function toFeedCardView(item: NewsItem): NewsFeedCardView {
  return {
    categoryLabel: resolveCategoryLabel(item.categoryId),
    featured: item.featured,
    id: item.id,
    ...(item.image ? { image: item.image } : {}),
    publishedLabel: item.publishedLabel,
    readLabel: `${item.readMinutes ?? 3} 分钟`,
    source: item.source,
    summary: item.summary,
    title: item.title,
  };
}

export function toArticleView(article: NewsArticle): NewsArticleView {
  return {
    ...toFeedCardView(article),
    body: article.body,
    keyPoints: buildKeyPoints(article),
    tags: article.tags,
  };
}

function buildKeyPoints(article: NewsArticle): readonly string[] {
  const points = article.body
    .flatMap((paragraph) => paragraph.split(/(?<=[。！？!?])\s*/u))
    .map((point) => point.trim())
    .filter((point) => point.length >= 18 && point !== article.summary);
  return points.slice(0, 3);
}
