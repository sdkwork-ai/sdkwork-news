import { type FormEvent, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Clock3,
  Flame,
  Hash,
  Heart,
  LoaderCircle,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  WifiOff,
} from "lucide-react";
import {
  useNewsArticleController,
  useNewsFeedController,
  type NewsFeedStatus,
} from "@sdkwork/news-feed-react";
import { useNewsEngagement } from "@sdkwork/news-comments-react";
import { NewsPcComments } from "@sdkwork/news-pc-comments";
import type { NewsCommentsService } from "@sdkwork/news-comments-service";
import type {
  NewsArticle,
  NewsFeedChannel,
  NewsFeedItem,
  NewsFeedService,
} from "@sdkwork/news-feed-service";
import aiChipsImage from "../../../../sdkwork-news-common/assets/news/ai-chips.jpg";
import logisticsImage from "../../../../sdkwork-news-common/assets/news/logistics.jpg";
import marketsImage from "../../../../sdkwork-news-common/assets/news/markets.jpg";
import newsroomImage from "../../../../sdkwork-news-common/assets/news/newsroom.jpg";
import workspaceImage from "../../../../sdkwork-news-common/assets/news/workspace.jpg";
import "./styles.css";

export interface NewsPcNewsProps {
  commentsService?: NewsCommentsService;
  demoMode?: boolean;
  shareArticle?: (input: NewsPcShareInput) => Promise<void>;
  service?: NewsFeedService;
}

export interface NewsPcShareInput {
  text: string;
  title: string;
}

interface PcViewItem {
  authorName?: string;
  body?: string;
  categoryId: string;
  featured: boolean;
  id: string;
  image?: string;
  publishedAt?: string;
  publishedLabel?: string;
  readMinutes?: number;
  reason?: string;
  source?: string;
  summary: string;
  tags: readonly string[];
  title: string;
}

const FALLBACK_CHANNELS: readonly NewsFeedChannel[] = [
  { id: "headlines", title: "要闻" },
  { id: "technology", title: "科技" },
  { id: "finance", title: "财经" },
  { id: "business", title: "商业" },
  { id: "world", title: "国际" },
  { id: "policy", title: "政策" },
];

const TOPICS = ["AI Agent", "低空经济", "美联储", "供应链", "新能源"] as const;

export function NewsPcNews({
  commentsService,
  demoMode = false,
  shareArticle,
  service,
}: NewsPcNewsProps) {
  if (demoMode) {
    return (
      <NewsPcDemo
        commentsService={commentsService}
        shareArticle={shareArticle}
      />
    );
  }
  return (
    <NewsPcLive
      commentsService={commentsService}
      service={service}
      shareArticle={shareArticle}
    />
  );
}

function NewsPcLive({
  commentsService,
  service,
  shareArticle,
}: Omit<NewsPcNewsProps, "demoMode">) {
  const controller = useNewsFeedController(service);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [searchText, setSearchText] = useState("");
  const [showRanking, setShowRanking] = useState(false);
  const articleController = useNewsArticleController(service, selectedItemId);

  if (selectedItemId) {
    if (articleController.status !== "ready" || !articleController.article) {
      return (
        <NewsPcDetailState
          onBack={() => setSelectedItemId(undefined)}
          onRetry={articleController.retry}
          status={articleController.status}
        />
      );
    }
    return (
      <NewsPcDetail
        commentsService={commentsService}
        feedbackError={articleController.feedbackError}
        feedbackMessage={articleController.feedbackMessage}
        feedbackPending={articleController.feedbackPending}
        item={toDetailView(articleController.article)}
        onBack={() => setSelectedItemId(undefined)}
        onOpenRelated={(itemId) => setSelectedItemId(itemId)}
        onShare={
          shareArticle
            ? async () => {
                await shareArticle({
                  text: articleController.article?.summary ?? "",
                  title: articleController.article?.title ?? "",
                });
                await articleController.recordShare();
              }
            : undefined
        }
        onSubmitFeedback={articleController.submitFeedback}
        relatedError={articleController.relatedError}
        relatedItems={articleController.relatedItems.map((item, index) =>
          toViewItem(item, index),
        )}
      />
    );
  }

  const channels = controller.channels.length > 0
    ? controller.channels
    : FALLBACK_CHANNELS;

  return (
    <NewsPcHome
      activeChannelId={controller.activeChannelId}
      channels={channels}
      favoriteItemIds={controller.favoriteItemIds}
      favoritePendingItemIds={controller.favoritePendingItemIds}
      items={controller.items.map((item, index) => toViewItem(item, index))}
      onChannel={(channelId) => {
        setShowRanking(false);
        controller.selectChannel(channelId);
      }}
      onOpenArticle={setSelectedItemId}
      onRetry={controller.retry}
      onSearch={(value) => {
        setShowRanking(false);
        controller.search(value);
      }}
      onSearchChange={setSearchText}
      onShowRanking={() => setShowRanking((current) => !current)}
      onToggleFavorite={(itemId) => void controller.toggleFavorite(itemId)}
      query={controller.query}
      searchText={searchText}
      showRanking={showRanking}
      status={controller.status}
      trending={controller.trendingItems.map((item, index) =>
        toViewItem(item, index),
      )}
    />
  );
}

function NewsPcDemo({
  commentsService,
  shareArticle,
}: Pick<NewsPcNewsProps, "commentsService" | "shareArticle">) {
  const [category, setCategory] = useState("推荐");
  const [feedbackMessage, setFeedbackMessage] = useState<string>();
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<ReadonlySet<string>>(() => new Set());
  const [searchText, setSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState<PcViewItem | null>(null);
  const [showRanking, setShowRanking] = useState(false);

  const normalizedQuery = query.toLocaleLowerCase("zh-CN");
  const visibleItems = DEMO_ITEMS.filter(
    (item) =>
      (category === "推荐" || item.categoryId === category)
      && (!normalizedQuery
        || [item.source, item.categoryId, item.summary, item.title]
          .filter((value): value is string => Boolean(value))
          .some((value) =>
            value.toLocaleLowerCase("zh-CN").includes(normalizedQuery)
          )),
  );
  const showLead = !query && (category === "推荐" || category === "要闻");

  if (selectedItem) {
    const relatedItems = [DEMO_LEAD, ...DEMO_ITEMS]
      .filter((item) => item.id !== selectedItem.id)
      .slice(0, 3);
    return (
      <NewsPcDetail
        commentsService={commentsService}
        feedbackMessage={feedbackMessage}
        item={selectedItem}
        onBack={() => {
          setSelectedItem(null);
          setFeedbackMessage(undefined);
        }}
        onOpenRelated={(itemId) => {
          const item = [DEMO_LEAD, ...DEMO_ITEMS].find(
            (candidate) => candidate.id === itemId,
          );
          if (item) {
            setSelectedItem(item);
            setFeedbackMessage(undefined);
          }
        }}
        onShare={
          shareArticle
            ? () =>
                shareArticle({
                  text: selectedItem.summary,
                  title: selectedItem.title,
                })
            : undefined
        }
        onSubmitFeedback={async (type) => {
          setFeedbackMessage(
            type === "more_like_this"
              ? "已记录，将推荐更多此类内容"
              : "已记录，将减少此类内容",
          );
        }}
        relatedItems={relatedItems}
      />
    );
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategory("推荐");
    setQuery(searchText.trim());
    setShowRanking(false);
  };

  return (
    <NewsPcHome
      activeChannelId={query
        ? undefined
        : DEMO_CHANNELS.find((channel) => channel.title === category)?.id}
      channels={DEMO_CHANNELS}
      favoriteItemIds={saved}
      favoritePendingItemIds={new Set()}
      items={visibleItems}
      lead={showLead ? DEMO_LEAD : undefined}
      onChannel={(channelId) => {
        const next = DEMO_CHANNELS.find((channel) => channel.id === channelId);
        setCategory(next?.title ?? "推荐");
        setQuery("");
        setShowRanking(false);
      }}
      onOpenArticle={(itemId) => {
        const item = [DEMO_LEAD, ...DEMO_ITEMS].find(
          (candidate) => candidate.id === itemId,
        );
        if (item) {
          setSelectedItem(item);
          setFeedbackMessage(undefined);
        }
      }}
      onRetry={() => undefined}
      onSearch={(value) => {
        setCategory("推荐");
        setQuery(value.trim());
        setShowRanking(false);
      }}
      onSearchChange={setSearchText}
      onShowRanking={() => setShowRanking((current) => !current)}
      onToggleFavorite={(itemId) =>
        setSaved((current) => withSetValue(current, itemId))}
      query={query}
      searchText={searchText}
      showRanking={showRanking}
      status="ready"
      trending={DEMO_TRENDING}
      onSubmitSearch={submitSearch}
    />
  );
}

interface PcHomeProps {
  activeChannelId?: string;
  channels: readonly NewsFeedChannel[];
  favoriteItemIds: ReadonlySet<string>;
  favoritePendingItemIds: ReadonlySet<string>;
  items: readonly PcViewItem[];
  lead?: PcViewItem;
  onChannel(channelId?: string): void;
  onOpenArticle(itemId: string): void;
  onRetry(): void;
  onSearch(value: string): void;
  onSearchChange(value: string): void;
  onShowRanking(): void;
  onSubmitSearch?(event: FormEvent<HTMLFormElement>): void;
  onToggleFavorite(itemId: string): void;
  query?: string;
  searchText: string;
  showRanking: boolean;
  status: NewsFeedStatus;
  trending: readonly PcViewItem[];
}

function NewsPcHome({
  activeChannelId,
  channels,
  favoriteItemIds,
  favoritePendingItemIds,
  items,
  lead,
  onChannel,
  onOpenArticle,
  onRetry,
  onSearch,
  onSearchChange,
  onShowRanking,
  onSubmitSearch,
  onToggleFavorite,
  query,
  searchText,
  showRanking,
  status,
  trending,
}: PcHomeProps) {
  const hero = lead ?? (!activeChannelId && !query && items.length > 1
    ? items.find((item) => item.featured) ?? items[0]
    : undefined);
  const rest = hero ? items.filter((item) => item.id !== hero.id) : items;
  const sideStories = hero ? rest.slice(0, 2) : [];
  const feed = hero ? rest.slice(2) : items;
  const channelTitle = channels.find(
    (channel) => channel.id === activeChannelId,
  )?.title;
  const sectionTitle = query
    ? `“${query}”的搜索结果`
    : channelTitle
      ? `${channelTitle}频道`
      : "最新动态";

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchText);
  };

  return (
    <div className="news-pc-page">
      <header className="news-pc-masthead">
        <div className="news-pc-masthead__brand">
          <span>头</span>
          <div>
            <strong>SDKWork 头条</strong>
            <small>{formatToday()} · 你的资讯工作台</small>
          </div>
        </div>
        <form
          className="news-pc-search"
          onSubmit={onSubmitSearch ?? submitSearch}
          role="search"
        >
          <Search aria-hidden="true" size={17} />
          <input
            aria-label="搜索新闻"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="搜索新闻、话题或来源"
            value={searchText}
          />
          <button aria-label="提交搜索" type="submit">
            <Search size={15} />
          </button>
        </form>
        <div className="news-pc-masthead__meta">
          <span className="news-pc-live-dot" />
          实时更新
        </div>
      </header>

      <nav aria-label="新闻分类" className="news-pc-channels">
        <button
          className={!activeChannelId && !query ? "is-active" : ""}
          onClick={() => onChannel(undefined)}
          type="button"
        >
          推荐
        </button>
        {channels.map((channel) => (
          <button
            aria-current={activeChannelId === channel.id ? "page" : undefined}
            className={activeChannelId === channel.id ? "is-active" : ""}
            key={channel.id}
            onClick={() => onChannel(channel.id)}
            type="button"
          >
            {channel.title}
          </button>
        ))}
        <button
          className={`news-pc-channels__rank${showRanking ? " is-active" : ""}`}
          onClick={onShowRanking}
          type="button"
        >
          <TrendingUp size={14} />热榜
        </button>
      </nav>

      <div className="news-pc-layout">
        <main>
          {showRanking ? (
            <NewsPcRanking
              items={trending.length > 0 ? trending : items}
              onBack={onShowRanking}
            />
          ) : (
            <>
              <NewsPcState onRetry={onRetry} status={status} />

              {status === "ready" && hero && (
                <section className="news-pc-lead-grid">
                  <HeroStory item={hero} onOpen={() => onOpenArticle(hero.id)} />
                  <div className="news-pc-side-stories">
                    {sideStories.map((item) => (
                      <SideStory
                        item={item}
                        key={item.id}
                        onOpen={() => onOpenArticle(item.id)}
                      />
                    ))}
                    <div className="news-pc-topic-panel">
                      <span>正在关注</span>
                      <div>
                        {TOPICS.slice(0, 3).map((topic) => (
                          <button
                            key={topic}
                            onClick={() => onSearch(topic)}
                            type="button"
                          >
                            #{topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {status === "ready" && (
                <section className="news-pc-topic-rail" aria-label="热门话题">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => onSearch(topic)}
                      type="button"
                    >
                      <Hash size={12} />{topic}
                    </button>
                  ))}
                </section>
              )}

              {status === "ready" && (
                <div className="news-pc-section-heading">
                  <div>
                    <h2>{sectionTitle}</h2>
                    {query && (
                      <button onClick={() => onChannel(undefined)} type="button">
                        清除筛选
                      </button>
                    )}
                  </div>
                  <span>{items.length > 0 ? `已加载 ${items.length} 条` : ""}</span>
                </div>
              )}

              {status === "ready" && (
                <section className="news-pc-feed">
                  {feed.map((item) => (
                    <FeedRow
                      favorite={favoriteItemIds.has(item.id)}
                      favoritePending={favoritePendingItemIds.has(item.id)}
                      item={item}
                      key={item.id}
                      onOpen={() => onOpenArticle(item.id)}
                      onToggleFavorite={() => onToggleFavorite(item.id)}
                    />
                  ))}
                  {feed.length === 0 && sideStories.length === 0 && (
                    <p className="news-pc-empty">暂无更多内容。</p>
                  )}
                </section>
              )}
            </>
          )}
        </main>

        <aside className="news-pc-rail">
          <section className="news-pc-ranking">
            <header>
              <span><Flame size={15} />实时热榜</span>
              <button onClick={onShowRanking} type="button">查看全部</button>
            </header>
            <ol>
              {(trending.length > 0 ? trending : items).slice(0, 7).map(
                (item, index) => (
                  <li key={item.id}>
                    <b className={index < 3 ? "is-hot" : ""}>{index + 1}</b>
                    <button onClick={() => onOpenArticle(item.id)} type="button">
                      {rankingLabel(item.title)}
                    </button>
                  </li>
                ),
              )}
              {trending.length === 0 && items.length === 0 && (
                <li className="is-empty">热榜正在聚合</li>
              )}
            </ol>
          </section>

          <section className="news-pc-brief">
            <header><Sparkles size={15} /><span>今日简报</span></header>
            <p>AI 正在重写资讯产品的阅读路径：更少的噪音，更清晰的证据链。</p>
            <ul>
              <li>科技：企业级 Agent 进入工作流</li>
              <li>财经：资金面与政策信号博弈</li>
              <li>国际：供应链区域化继续</li>
            </ul>
            <button type="button"><span>订阅每日简报</span><ChevronRight size={14} /></button>
          </section>

          <section className="news-pc-follow">
            <header><span>编辑推荐关注</span></header>
            <div>
              <span className="news-pc-follow__avatar">研</span>
              <div><strong>SDKWork 研究院</strong><small>12.8 万人关注</small></div>
              <button type="button">关注</button>
            </div>
            <div>
              <span className="news-pc-follow__avatar is-blue">财</span>
              <div><strong>第一财经</strong><small>86.4 万人关注</small></div>
              <button type="button">关注</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HeroStory({ item, onOpen }: { item: PcViewItem; onOpen(): void }) {
  return (
    <section
      aria-label={"阅读 " + item.title}
      className={`news-pc-hero${item.image ? "" : " is-text"}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {item.image ? (
        <img src={item.image} alt="" />
      ) : (
        <span className="news-pc-hero__glyph" aria-hidden="true">
          {item.categoryId.slice(0, 1)}
        </span>
      )}
      <div>
        <span className="news-pc-hero__badge"><Flame size={12} />今日要闻</span>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <footer>
          <span>{item.source ?? "SDKWork 资讯"}</span>
          <span>{item.publishedLabel ?? formatPublishedAt(item.publishedAt)}</span>
          {item.readMinutes && <span>{item.readMinutes} 分钟</span>}
        </footer>
      </div>
    </section>
  );
}

function SideStory({ item, onOpen }: { item: PcViewItem; onOpen(): void }) {
  return (
    <article
      aria-label={"阅读 " + item.title}
      className="news-pc-side-story"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span>{item.categoryId}</span>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <footer>{item.source} · {item.publishedLabel}</footer>
    </article>
  );
}

function FeedRow({
  favorite,
  favoritePending,
  item,
  onOpen,
  onToggleFavorite,
}: {
  favorite: boolean;
  favoritePending: boolean;
  item: PcViewItem;
  onOpen(): void;
  onToggleFavorite(): void;
}) {
  return (
    <article
      aria-label={"阅读 " + item.title}
      className="news-pc-row"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="news-pc-row__content">
        <div className="news-pc-row__meta">
          <span>{item.categoryId}</span>
          {item.featured && <b><Flame size={11} />精选</b>}
          <span>{item.source}</span>
          <span>{item.publishedLabel}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        {item.reason && <blockquote>{item.reason}</blockquote>}
        <footer>
          <span><Clock3 size={12} />{item.readMinutes ?? 4} 分钟</span>
          {item.tags.slice(0, 3).map((tag) => <small key={tag}>{tag}</small>)}
          <button
            aria-label={`${favorite ? "取消收藏" : "收藏"} ${item.title}`}
            aria-pressed={favorite}
            className={favorite ? "is-saved" : ""}
            disabled={favoritePending}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
            type="button"
          >
            {favoritePending
              ? <LoaderCircle className="is-spinning" size={15} />
              : <Bookmark fill={favorite ? "currentColor" : "none"} size={15} />}
          </button>
        </footer>
      </div>
      <PcThumb item={item} />
    </article>
  );
}

function PcThumb({ item }: { item: PcViewItem }) {
  if (item.image) {
    return <img className="news-pc-row__image" src={item.image} alt="" />;
  }
  return (
    <div aria-hidden="true" className="news-pc-row__image news-pc-thumb-glyph">
      {item.categoryId.slice(0, 1)}
    </div>
  );
}

function NewsPcRanking({
  items,
  onBack,
}: {
  items: readonly PcViewItem[];
  onBack(): void;
}) {
  return (
    <section className="news-pc-ranking-page">
      <header>
        <button aria-label="返回新闻列表" onClick={onBack} type="button">
          <ArrowLeft size={17} />返回
        </button>
        <div><h1>今日热榜</h1><p>全网热度聚合 · 每 5 分钟更新</p></div>
        <TrendingUp size={20} />
      </header>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <b className={index < 3 ? "is-hot" : ""}>{index + 1}</b>
            <div><strong>{item.title}</strong><span>{item.source}</span></div>
            <Flame size={14} />
          </li>
        ))}
        {items.length === 0 && <li className="is-empty">热榜正在聚合。</li>}
      </ol>
    </section>
  );
}

function NewsPcDetail({
  commentsService,
  feedbackError,
  feedbackMessage,
  feedbackPending,
  item,
  onBack,
  onOpenRelated,
  onShare,
  onSubmitFeedback,
  relatedError,
  relatedItems,
}: {
  commentsService?: NewsCommentsService;
  feedbackError?: string;
  feedbackMessage?: string;
  feedbackPending?: boolean;
  item: PcViewItem;
  onBack(): void;
  onOpenRelated?(itemId: string): void;
  onShare?(): Promise<void>;
  onSubmitFeedback?(type: "less_like_this" | "more_like_this"): Promise<void>;
  relatedError?: string;
  relatedItems?: readonly PcViewItem[];
}) {
  const engagement = useNewsEngagement(commentsService, {
    id: item.id,
    kind: "news-item",
  });
  const [sharePending, setSharePending] = useState(false);
  const [shareError, setShareError] = useState<string>();
  const [largeText, setLargeText] = useState(false);
  const keyPoints = buildKeyPoints(item);

  const submitShare = async () => {
    if (!onShare || sharePending) {
      return;
    }
    setSharePending(true);
    setShareError(undefined);
    try {
      await onShare();
    } catch {
      setShareError("分享失败，请重试");
    } finally {
      setSharePending(false);
    }
  };

  return (
    <div className={`news-pc-article${largeText ? " is-large-text" : ""}`}>
      <header className="news-pc-article__header">
        <button aria-label="返回新闻列表" onClick={onBack} type="button">
          <ArrowLeft size={17} />返回新闻
        </button>
        <div>
          <span>{item.categoryId}</span>
          <button
            aria-label={largeText ? "恢复标准字号" : "放大字号"}
            onClick={() => setLargeText((current) => !current)}
            type="button"
          >
            A{largeText ? "-" : "+"}
          </button>
          {onShare && (
            <button
              aria-label="分享新闻"
              disabled={sharePending}
              onClick={() => void submitShare()}
              type="button"
            >
              {sharePending
                ? <LoaderCircle className="is-spinning" size={17} />
                : <Share2 size={17} />}
            </button>
          )}
          <button
            aria-label={engagement.liked ? "取消点赞" : "点赞新闻"}
            aria-pressed={engagement.liked}
            className={engagement.liked ? "is-liked" : ""}
            disabled={engagement.liking}
            onClick={() => void engagement.toggleLike()}
            type="button"
          >
            <Heart
              fill={engagement.liked ? "currentColor" : "none"}
              size={17}
            />
            <span className="news-pc-article__count">
              {engagement.summary.likeCount}
            </span>
          </button>
          <button
            aria-label={engagement.favorited ? "取消收藏" : "收藏新闻"}
            aria-pressed={engagement.favorited}
            className={engagement.favorited ? "is-saved" : ""}
            disabled={engagement.pending}
            onClick={() => void engagement.toggleFavorite()}
            type="button"
          >
            {engagement.pending
              ? <LoaderCircle className="is-spinning" size={17} />
              : <Bookmark
                  fill={engagement.favorited ? "currentColor" : "none"}
                  size={17}
                />}
          </button>
        </div>
      </header>

      <div className="news-pc-article__layout">
        <main>
          {item.image && <img className="news-pc-article__cover" src={item.image} alt="" />}
          <div className="news-pc-article__meta">
            <span>{item.categoryId}</span>
            <span>{item.publishedLabel}</span>
            {item.readMinutes && <span>约 {item.readMinutes} 分钟</span>}
          </div>
          <h1>{item.title}</h1>
          <div className="news-pc-article__byline">
            <span className="news-pc-article__avatar">
              {(item.source ?? "资").slice(0, 1)}
            </span>
            <div>
              <strong>{item.source ?? "SDKWork 资讯"}</strong>
              <small>{item.authorName ?? "编辑部"}</small>
            </div>
            <button type="button">关注</button>
          </div>

          <section className="news-pc-ai-summary" aria-label="智能摘要">
            <header><Sparkles size={15} /><strong>智能摘要</strong><span>AI 生成</span></header>
            <p>{item.summary}</p>
            {keyPoints.length > 0 && (
              <ul>{keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            )}
          </section>

          <article className="news-pc-article__body">
            {item.body
              ? item.body
                  .split(/\r?\n\s*\r?\n/u)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              : (
                <p className="news-pc-article__summary-only">
                  当前来源只提供摘要，原文将在来源同步后继续呈现。
                </p>
              )}
          </article>

          {item.tags.length > 0 && (
            <div className="news-pc-article__tags">
              {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          )}

          {onSubmitFeedback && (
            <section className="news-pc-article__feedback">
              <h2>这篇内容对你有帮助吗？</h2>
              <div>
                <button
                  disabled={feedbackPending}
                  onClick={() => void onSubmitFeedback("more_like_this")}
                  type="button"
                >
                  <ThumbsUp size={15} />更多此类
                </button>
                <button
                  disabled={feedbackPending}
                  onClick={() => void onSubmitFeedback("less_like_this")}
                  type="button"
                >
                  <ThumbsDown size={15} />减少此类
                </button>
              </div>
              {(feedbackMessage || feedbackError || shareError) && (
                <p role={feedbackError || shareError ? "alert" : "status"}>
                  {feedbackError ?? shareError ?? feedbackMessage}
                </p>
              )}
            </section>
          )}

          <NewsPcComments
            service={commentsService}
            targetId={item.id}
            targetTitle={item.title}
          />

          {relatedError && (
            <p className="news-pc-command-error" role="status">{relatedError}</p>
          )}
        </main>

        <aside>
          {(relatedItems?.length ?? 0) > 0 && (
            <section className="news-pc-related">
              <h2>继续阅读</h2>
              {relatedItems?.map((related) => (
                <button
                  key={related.id}
                  onClick={() => onOpenRelated?.(related.id)}
                  type="button"
                >
                  <span>{related.categoryId}</span>
                  <strong>{related.title}</strong>
                  <small>{related.summary}</small>
                </button>
              ))}
            </section>
          )}
          <section className="news-pc-article__stats">
            <h2>阅读信息</h2>
            <dl>
              <div><dt>来源</dt><dd>{item.source ?? "SDKWork"}</dd></div>
              <div><dt>阅读时长</dt><dd>{item.readMinutes ?? 4} 分钟</dd></div>
              <div><dt>标签</dt><dd>{item.tags.length}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function NewsPcDetailState({
  onBack,
  onRetry,
  status,
}: {
  onBack(): void;
  onRetry(): void;
  status: ReturnType<typeof useNewsArticleController>["status"];
}) {
  return (
    <div className="news-pc-article">
      <header className="news-pc-article__header">
        <button aria-label="返回新闻列表" onClick={onBack} type="button">
          <ArrowLeft size={17} />返回新闻
        </button>
      </header>
      <main>
        <section className="news-pc-state" role={status === "error" ? "alert" : "status"}>
          {status === "loading" && <LoaderCircle className="is-spinning" size={22} />}
          <h2>{status === "error" ? "新闻详情加载失败" : "正在加载新闻详情"}</h2>
          {status === "error" && (
            <button onClick={onRetry} type="button"><RefreshCw size={15} />重试</button>
          )}
        </section>
      </main>
    </div>
  );
}

function NewsPcState({
  onRetry,
  status,
}: {
  onRetry(): void;
  status: NewsFeedStatus;
}) {
  if (status === "ready") {
    return null;
  }
  if (status === "loading") {
    return (
      <section aria-live="polite" className="news-pc-state">
        <LoaderCircle className="is-spinning" size={22} />
        <h2>正在加载今日资讯</h2>
        <p>正在连接个性化推荐与频道。</p>
      </section>
    );
  }
  if (status === "unavailable") {
    return (
      <section className="news-pc-state" role="status">
        <WifiOff size={23} />
        <h2>新闻服务未连接</h2>
        <p>完成登录并连接新闻服务后即可查看个性化内容。</p>
      </section>
    );
  }
  if (status === "error") {
    return (
      <section className="news-pc-state" role="alert">
        <WifiOff size={23} />
        <h2>新闻流暂不可用</h2>
        <button onClick={onRetry} type="button"><RefreshCw size={15} />重试</button>
      </section>
    );
  }
  return (
    <section className="news-pc-state" role="status">
      <Search size={23} />
      <h2>暂无匹配新闻</h2>
      <p>可以切换分类或调整搜索关键词。</p>
    </section>
  );
}

function toViewItem(item: NewsFeedItem, index: number): PcViewItem {
  return {
    ...(item.authorName ? { authorName: item.authorName } : {}),
    categoryId: item.categoryId,
    featured: item.featured,
    id: item.id,
    ...(index % 4 === 1 ? { image: NEWS_IMAGE_POOL[index % NEWS_IMAGE_POOL.length] } : {}),
    ...(item.publishedAt ? { publishedAt: item.publishedAt } : {}),
    ...(item.publishedAt ? { publishedLabel: formatPublishedAt(item.publishedAt) } : {}),
    ...(item.estimatedReadMinutes ? { readMinutes: item.estimatedReadMinutes } : {}),
    ...(item.reason ? { reason: item.reason } : {}),
    source: item.authorName ?? "SDKWork 资讯",
    summary: item.summary,
    tags: item.tags,
    title: item.title,
  };
}

function toDetailView(item: NewsArticle): PcViewItem {
  return { ...toViewItem(item, 0), ...(item.body ? { body: item.body } : {}) };
}

function buildKeyPoints(item: PcViewItem): readonly string[] {
  return item.summary
    .split(/(?<=[。！？!?])\s*/u)
    .map((point) => point.trim())
    .filter((point) => point.length >= 12 && point !== item.summary)
    .slice(0, 3);
}

function withSetValue(
  current: ReadonlySet<string>,
  value: string,
): ReadonlySet<string> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

function rankingLabel(value: string): string {
  return `${truncate(value, 15)}…`;
}

function formatToday(): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
}

function formatPublishedAt(value?: string): string {
  if (!value) {
    return "刚刚";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const NEWS_IMAGE_POOL = [
  aiChipsImage,
  marketsImage,
  workspaceImage,
  newsroomImage,
  logisticsImage,
] as const;

const DEMO_CHANNELS: readonly NewsFeedChannel[] = [
  { id: "headlines", title: "要闻" },
  { id: "technology", title: "科技" },
  { id: "finance", title: "财经" },
  { id: "business", title: "商业" },
  { id: "world", title: "国际" },
  { id: "policy", title: "政策" },
];

const DEMO_LEAD: PcViewItem = {
  body: "过去的新闻产品依赖推荐算法，把用户留在一条不断刷新的信息流里。AI 时代的阅读方式开始转向长期协作：用户定义目标，智能体持续追踪变化并解释它们为什么重要。\n\n这意味着新闻产品需要同时处理来源筛选、事实核验和上下文整理。高质量的阅读体验不再是更多内容，而是在合适的时间交付更少但更有用的判断依据。\n\n对读者而言，真正稀缺的不是信息，而是可信的判断。把重复扫描交给智能体，把注意力留给需要决策的部分，正在成为新一代资讯产品的核心价值。",
  categoryId: "要闻",
  featured: true,
  id: "lead",
  image: newsroomImage,
  publishedLabel: "12 分钟前",
  readMinutes: 6,
  source: "SDKWork 研究院",
  summary: "用户不再需要消费所有内容，而是让不同角色的智能体持续阅读、验证并呈现真正影响决策的变化。",
  tags: ["AI 阅读", "信息流", "智能体"],
  title: "从信息流到智能体：新闻阅读正在发生结构性变化",
};

const DEMO_ITEMS: readonly PcViewItem[] = [
  {
    body: "企业正在把智能体从单次问答工具放进销售、客服和研发流程。\n\n随着任务持续执行，可靠性、权限边界和可观察性成为采购决策的核心。\n\n采购方开始要求智能体提供完整的执行轨迹、失败回滚机制以及可审计的权限记录，这些能力正在取代单纯的模型参数，成为新一轮选型的硬指标。",
    categoryId: "科技",
    featured: true,
    id: "1",
    image: aiChipsImage,
    publishedLabel: "42 分钟前",
    readMinutes: 5,
    source: "MIT Technology Review",
    summary: "从单次回答走向长期执行后，可靠性、权限边界和可观察性成为采购决策的核心。",
    tags: ["AI Agent", "企业软件"],
    title: "AI Agent 开始进入企业核心工作流，评估标准正在改变",
  },
  {
    body: "公开市场操作规模连续上升，短端利率回落。\n\n机构仍在观察政策传导到实体经济的速度，趋势判断保持谨慎。\n\n多家机构在最新策略报告中提示，资金面的宽松并不等同于信用扩张，后续仍需观察企业中长期贷款和居民消费信心的修复情况。",
    categoryId: "财经",
    featured: false,
    id: "2",
    image: marketsImage,
    publishedLabel: "1 小时前",
    readMinutes: 4,
    source: "第一财经",
    summary: "公开市场操作规模连续上升，短端利率回落，但机构对趋势判断仍保持谨慎。",
    tags: ["流动性", "货币政策"],
    title: "资金面延续宽松，市场关注下一阶段政策信号",
  },
  {
    body: "越来越多 AI 产品尝试按任务、调用或业务结果计费。\n\n当价值从席位转向结果，传统 SaaS 的增长和留存指标也需要重新解释。\n\n投资人开始关注单位任务成本、结果达成率和客户扩展收入，而不是单一的年度经常性收入。",
    categoryId: "商业",
    featured: false,
    id: "3",
    image: workspaceImage,
    publishedLabel: "2 小时前",
    readMinutes: 7,
    source: "Bloomberg",
    summary: "越来越多 AI 产品尝试按任务、调用或业务结果计费，传统 SaaS 指标面临重估。",
    tags: ["SaaS", "商业模式"],
    title: "企业软件定价从席位转向结果，新的商业模型浮出水面",
  },
  {
    body: "效率与韧性的权衡正在改变，企业开始重新评估供应商集中度。\n\n关键零部件的多源策略增加，也让库存和物流协同成为新的管理重点。\n\n区域化生产并不意味全球化结束，而是供应链从单一成本最优转向成本、时效与风险的多目标平衡。",
    categoryId: "国际",
    featured: false,
    id: "4",
    image: logisticsImage,
    publishedLabel: "3 小时前",
    readMinutes: 6,
    source: "Reuters",
    summary: "效率与韧性的权衡正在改变，关键零部件的多源策略明显增加。",
    tags: ["供应链", "制造业"],
    title: "全球供应链继续区域化，制造企业重新校准库存策略",
  },
  {
    body: "政策文件首次把数据要素流通与产业数字化放在同一框架下。\n\n地方试点将围绕公共数据授权运营、跨境数据流动和企业数据资产入表展开。\n\n业内普遍认为，清晰的权属和定价机制是数据要素市场从试点走向规模化交易的前提。",
    categoryId: "政策",
    featured: false,
    id: "5",
    image: newsroomImage,
    publishedLabel: "4 小时前",
    readMinutes: 4,
    source: "经济日报",
    summary: "数据要素市场建设提速，公共数据授权运营与数据资产入表成为试点重点。",
    tags: ["数据要素", "政策"],
    title: "数据要素市场化配置改革提速，多地启动新一轮试点",
  },
  {
    body: "新一代储能电芯在循环寿命和安全性上同时提升。\n\n成本下降与电网调峰需求叠加，让储能从配套设备变成独立的收益资产。\n\n不过，商业模式仍依赖电力市场规则，峰谷价差和辅助服务补偿决定项目回报。",
    categoryId: "科技",
    featured: false,
    id: "6",
    image: workspaceImage,
    publishedLabel: "5 小时前",
    readMinutes: 5,
    source: "财新",
    summary: "储能电芯技术迭代叠加电力市场改革，储能资产开始获得独立收益模型。",
    tags: ["新能源", "储能"],
    title: "储能产业进入价值重估期，技术迭代与市场机制同步推进",
  },
];

const DEMO_TRENDING: readonly PcViewItem[] = [
  DEMO_ITEMS[0]!,
  DEMO_LEAD,
  DEMO_ITEMS[4]!,
  DEMO_ITEMS[1]!,
  DEMO_ITEMS[5]!,
  DEMO_ITEMS[2]!,
  DEMO_ITEMS[3]!,
];

export default NewsPcNews;
