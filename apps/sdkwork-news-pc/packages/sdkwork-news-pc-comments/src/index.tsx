import { type FormEvent, useState } from "react";
import {
  Heart,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Reply,
  Send,
  Trash2,
} from "lucide-react";
import { useNewsCommentsController } from "@sdkwork/news-comments-react";
import type {
  NewsComment,
  NewsCommentsService,
} from "@sdkwork/news-comments-service";
import "./styles.css";

export interface NewsPcCommentsProps {
  service?: NewsCommentsService;
  targetId: string;
  targetTitle: string;
}

export function NewsPcComments({
  service,
  targetId,
  targetTitle,
}: NewsPcCommentsProps) {
  const controller = useNewsCommentsController(service, { id: targetId, title: targetTitle });
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string }>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim() || submitting) {
      return;
    }
    setSubmitting(true);
    const succeeded = await controller.submit({
      body,
      ...(replyTo ? { parentId: replyTo.id } : {}),
    });
    setSubmitting(false);
    if (succeeded) {
      setBody("");
      setReplyTo(undefined);
    }
  };

  return (
    <section className="news-pc-comments" aria-label="评论">
      <header className="news-pc-comments__header">
        <div>
          <MessageCircle aria-hidden="true" size={18} />
          <h2>评论</h2>
          <span>{controller.summary?.publishedCount ?? controller.comments.length}</span>
        </div>
        <p>理性讨论 · 尊重事实 · 保留来源</p>
      </header>

      <form className="news-pc-comments__composer" onSubmit={(event) => void submit(event)}>
        <span className="news-pc-comments__avatar is-viewer">我</span>
        <div className="news-pc-comments__composer-body">
          <div className="news-pc-comments__composer-label">
            <strong>{replyTo ? `回复 @${replyTo.name}` : "参与讨论"}</strong>
            {replyTo && (
              <button type="button" onClick={() => setReplyTo(undefined)}>
                取消回复
              </button>
            )}
          </div>
          <textarea
            aria-label="评论内容"
            maxLength={300}
            onChange={(event) => setBody(event.target.value)}
            placeholder={replyTo ? `回复 @${replyTo.name}…` : "写下你的判断，或补充一条来源…"}
            rows={3}
            value={body}
          />
          <footer>
            <span>{body.length}/300</span>
            <button disabled={!body.trim() || submitting} type="submit">
              {submitting
                ? <LoaderCircle className="is-spinning" size={14} />
                : <Send size={14} />}
              发布评论
            </button>
          </footer>
        </div>
      </form>

      {controller.status === "loading" && (
        <div className="news-pc-comments__state" role="status">
          <LoaderCircle className="is-spinning" size={21} />
          <span>正在加载评论</span>
        </div>
      )}

      {controller.status === "unavailable" && (
        <div className="news-pc-comments__state" role="status">
          <MessageCircle size={22} />
          <strong>评论服务未连接</strong>
          <span>连接 SDKWork Comments 后即可参与讨论。</span>
        </div>
      )}

      {controller.status === "error" && (
        <div className="news-pc-comments__state" role="alert">
          <strong>评论加载失败</strong>
          <span>{controller.error}</span>
          <button onClick={controller.retry} type="button">
            <RefreshCw size={13} />重试
          </button>
        </div>
      )}

      {controller.status === "ready" && controller.comments.length === 0 && (
        <div className="news-pc-comments__state" role="status">
          <MessageCircle size={22} />
          <strong>还没有评论</strong>
          <span>成为第一个留下判断的人。</span>
        </div>
      )}

      {controller.status === "ready" && controller.comments.length > 0 && (
        <div className="news-pc-comments__list">
          {controller.comments.map((comment) => (
            <PcCommentRow
              comment={comment}
              key={comment.id}
              onLike={() => void controller.toggleLike(comment.id)}
              onRemove={() => void controller.removeComment(comment.id)}
              onReply={() =>
                setReplyTo({ id: comment.id, name: comment.authorName })}
            />
          ))}
        </div>
      )}

      {controller.hasMore && (
        <button
          className="news-pc-comments__more"
          disabled={controller.loadingMore}
          onClick={() => void controller.loadMore()}
          type="button"
        >
          {controller.loadingMore ? "加载中…" : "查看更多评论"}
        </button>
      )}

      {controller.actionError && (
        <p className="news-pc-comments__error" role="alert">
          {controller.actionError}
        </p>
      )}
    </section>
  );
}

function PcCommentRow({
  comment,
  onLike,
  onRemove,
  onReply,
}: {
  comment: NewsComment;
  onLike(): void;
  onRemove(): void;
  onReply(): void;
}) {
  return (
    <article className="news-pc-comment">
      <span className="news-pc-comments__avatar">
        {comment.authorAvatarUrl
          ? <img src={comment.authorAvatarUrl} alt="" />
          : comment.authorName.slice(0, 1)}
      </span>
      <div className="news-pc-comment__body">
        <header>
          <strong>{comment.authorName}</strong>
          {comment.parentId && comment.quoteAuthorName && (
            <span>回复 @{comment.quoteAuthorName}</span>
          )}
          <time dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
        </header>
        <p>{comment.body}</p>
        <footer>
          <button
            aria-pressed={comment.viewerLiked}
            className={comment.viewerLiked ? "is-liked" : ""}
            onClick={onLike}
            type="button"
          >
            <Heart fill={comment.viewerLiked ? "currentColor" : "none"} size={14} />
            {comment.likeCount > 0 ? comment.likeCount : "赞"}
          </button>
          <button onClick={onReply} type="button">
            <Reply size={14} />回复
          </button>
          {comment.authorId === "viewer" && (
            <button onClick={onRemove} type="button">
              <Trash2 size={14} />删除
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60_000);
  const formatter = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }
  return formatter.format(Math.round(diffHours / 24), "day");
}

export default NewsPcComments;
