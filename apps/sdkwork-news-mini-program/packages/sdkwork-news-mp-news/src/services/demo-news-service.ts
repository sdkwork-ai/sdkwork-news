import type {
  NewsArticle,
  NewsChannel,
  NewsListInput,
  NewsMiniProgramService,
  NewsPage,
} from "@sdkwork/news-mp-core";

import { DEMO_ARTICLES, DEMO_CHANNELS } from "../demo-data.js";

export class DemoNewsMiniProgramService implements NewsMiniProgramService {
  async getArticle(itemId: string): Promise<NewsArticle> {
    const article = DEMO_ARTICLES.find((entry) => entry.id === itemId);
    if (!article) {
      throw new Error(`News article ${itemId} was not found.`);
    }
    return article;
  }

  async listChannels(): Promise<readonly NewsChannel[]> {
    return DEMO_CHANNELS;
  }

  async listFeed(input: NewsListInput = {}): Promise<NewsPage> {
    const pageSize = clampPageSize(input.pageSize);
    const offset = parseCursor(input.cursor);
    const normalizedQuery = input.q?.trim().toLocaleLowerCase("zh-CN");
    const filtered = DEMO_ARTICLES.filter((article) => {
      const matchesChannel =
        !input.channelId
        || input.channelId === "recommended"
        || article.categoryId === input.channelId;
      const matchesQuery =
        !normalizedQuery
        || [
          article.categoryId,
          article.source,
          article.summary,
          article.title,
          ...article.tags,
        ].some((value) => value.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
      return matchesChannel && matchesQuery;
    });
    const end = Math.min(offset + pageSize, filtered.length);
    return {
      hasMore: end < filtered.length,
      items: offset >= filtered.length ? [] : filtered.slice(offset, end),
      ...(end < filtered.length ? { nextCursor: String(end) } : {}),
    };
  }

  async listTrending(): Promise<NewsPage> {
    return {
      hasMore: false,
      items: DEMO_ARTICLES.slice(0, 7),
    };
  }

  async setFavorite(): Promise<void> {
    return Promise.resolve();
  }
}

export function createDemoNewsMiniProgramService(): NewsMiniProgramService {
  return new DemoNewsMiniProgramService();
}

function clampPageSize(value: number | undefined): number {
  if (!value || !Number.isFinite(value)) {
    return 20;
  }
  return Math.min(50, Math.max(1, Math.floor(value)));
}

function parseCursor(value: string | undefined): number {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}
