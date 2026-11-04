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

export interface NewsH5CommentsProps {
  service?: NewsCommentsService;
  targetId: string;
  targetTitle: string;
}

export function NewsH5Comments({
  service,
  targetId,
  targetTitle,
}: NewsH5CommentsProps) {
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

  const count = controller.summary?.publishedCount ?? controller.comments.length;

  return (
    <section className="news-h5-comments" aria-label="评论">
      <header className="news-h5-comments__header">
        <div>
          <MessageCircle aria-hidden="true" size={17} />
          <strong>评论</strong>
          <span>{count}</span>
        </div>
        <small>理性讨论，尊重事实</small>
      </header>

      <form className="news-h5-comments__composer" onSubmit={(event) => void submit(event)}>
        <div className="news-h5-comments__composer-head">
          <span className="news-h5-comments__avatar is-viewer">我</span>
          <div>
            <strong>{replyTo ? `回复 @${replyTo.name}` : "写下你的看法"}</strong>
            {replyTo && (
              <button type="button" onClick={() => setReplyTo(undefined)}>
                取消回复
              </button>
            )}
          </div>
        </div>
        <textarea
          aria-label="评论内容"
          maxLength={300}
          onChange={(event) => setBody(event.target.value)}
          placeholder={replyTo ? `回复 @${replyTo.name}…` : "说说你的判断，或补充一条来源…"}
          rows={3}
          value={body}
        />
        <footer>
          <span>{body.length}/300</span>
          <button disabled={!body.trim() || submitting} type="submit">
            {submitting
              ? <LoaderCircle className="is-spinning" size={14} />
              : <Send size={14} />}
            发布
          </button>
        </footer>
      </form>

      {controller.status === "loading" && (
        <div className="news-h5-comments__state" role="status">
          <LoaderCircle className="is-spinning" size={20} />
          <span>正在加载评论</span>
        </div>
      )}

      {controller.status === "unavailable" && (
        <div className="news-h5-comments__state" role="status">
          <MessageCircle size={20} />
          <strong>评论服务未连接</strong>
          <span>连接 SDKWork Comments 后即可参与讨论。</span>
        </div>
      )}

      {controller.status === "error" && (
        <div className="news-h5-comments__state" role="alert">
          <strong>评论加载失败</strong>
          <span>{controller.error}</span>
          <button onClick={controller.retry} type="button">
            <RefreshCw size={13} />重试
          </button>
        </div>
      )}

      {controller.status === "ready" && controller.comments.length === 0 && (
        <div className="news-h5-comments__state" role="status">
          <MessageCircle size={20} />
          <strong>还没有评论</strong>
          <span>成为第一个留下判断的人。</span>
        </div>
      )}

      {controller.status === "ready" && controller.comments.length > 0 && (
        <div className="news-h5-comments__list">
          {controller.comments.map((comment) => (
            <CommentRow
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
          className="news-h5-comments__more"
          disabled={controller.loadingMore}
          onClick={() => void controller.loadMore()}
          type="button"
        >
          {controller.loadingMore ? "加载中…" : "查看更多评论"}
        </button>
      )}

      {controller.actionError && (
        <p className="news-h5-comments__error" role="alert">
          {controller.actionError}
        </p>
      )}
    </section>
  );
}

function CommentRow({
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
    <article className="news-h5-comment">
      <span className="news-h5-comments__avatar">
        {comment.authorAvatarUrl
          ? <img src={comment.authorAvatarUrl} alt="" />
          : comment.authorName.slice(0, 1)}
      </span>
      <div className="news-h5-comment__body">
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

export default NewsH5Comments;
