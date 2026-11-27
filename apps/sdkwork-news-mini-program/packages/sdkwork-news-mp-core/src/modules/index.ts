/**
 * Module data contracts for the news mini program.
 *
 * Feature packages import the item/channel/page shapes from here; they never reach
 * into the contracts module directly, so the public surface stays explicit.
 */
export type {
  NewsArticle,
  NewsChannel,
  NewsItem,
  NewsListInput,
  NewsPage,
} from "../contracts.js";
