"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  addComment,
  clearReaction,
  deleteComment,
  deletePost,
  getMyReaction,
  getPost,
  listComments,
  setReaction,
} from "@/lib/sources/posts";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import {
  Post,
  PostComment,
  PostReaction,
  PostStamp,
  ReactionType,
} from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

const STAMP_TONE: Record<PostStamp, "mint" | "yellow" | "coral"> = {
  LANDED: "mint",
  PROGRESS: "yellow",
  BAILED: "coral",
  FIRST: "mint",
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { profile } = useAuthContext();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [myReaction, setMyReaction] = useState<PostReaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [p, cs, r] = await Promise.all([
        getPost(params.id),
        listComments(params.id),
        getMyReaction(params.id, profile.uid),
      ]);
      setPost(p);
      setComments(cs);
      setMyReaction(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load post.");
    } finally {
      setLoading(false);
    }
  }, [profile, params.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onReact(type: ReactionType) {
    if (!profile || !post) return;
    const current = myReaction?.type;
    try {
      if (current === type) {
        await clearReaction(post.id, profile.uid);
      } else {
        await setReaction(
          post,
          { uid: profile.uid, alias: profile.alias ?? "" },
          type
        );
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't react.");
    }
  }

  async function onComment(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !post || posting) return;
    setPosting(true);
    setError("");
    try {
      await addComment(
        post.id,
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        },
        commentBody
      );
      setCommentBody("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't comment.");
    } finally {
      setPosting(false);
    }
  }

  async function onDeleteComment(c: PostComment) {
    if (!profile || !post) return;
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(post.id, c.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    }
  }

  async function onDeletePost() {
    if (!profile || !post) return;
    if (!confirm("Delete this post? Reactions and comments go with it.")) return;
    try {
      await deletePost(post.id);
      window.location.href = "/social";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    }
  }

  if (loading && !post) {
    return <div className="card-dark animate-pulse" style={{ height: 260 }} />;
  }

  if (!post) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NOT FOUND</Eyebrow>
        <h2 className="hed hed-m" style={{ marginTop: 12 }}>
          No such post
        </h2>
        <p className="dim">
          The post doesn&apos;t exist, was deleted, or isn&apos;t visible to
          you.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/social">
            <Button variant="ghost">← Back to Social</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = post.authorUid === profile?.uid;
  const authorColor =
    post.authorAliasColor ?? aliasColor(post.authorAlias.toLowerCase());

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="feed-post" style={{ marginBottom: 24 }}>
        <div className="post-head">
          <div className="avatar" style={{ background: authorColor }}>
            {aliasInitials(post.authorAlias)}
          </div>
          <div className="meta">
            <span className="nm">@{post.authorAlias}</span>
            <span className="ts">
              {new Date(post.createdAt).toLocaleString()} ·{" "}
              {post.visibility.toUpperCase()}
            </span>
          </div>
          <div className="spacer" />
          {isAuthor && (
            <button
              className="react-btn"
              onClick={onDeletePost}
              title="Delete post"
            >
              Delete
            </button>
          )}
        </div>

        <div className="post-body">
          <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
        </div>

        {post.stamp && post.trickName && (
          <div
            className={`post-hero ${post.stamp === "BAILED" ? "ko" : ""}`}
            style={{ minHeight: 80, aspectRatio: "auto" }}
          >
            <div className="stamp-banner">
              <Tag tone={STAMP_TONE[post.stamp]}>{post.stamp}</Tag>
            </div>
            {post.trickRef ? (
              <Link
                href={`/tricks/${post.trickRef}`}
                style={{
                  fontFamily: "var(--hammer)",
                  fontSize: 44,
                  color: "var(--hazard)",
                  letterSpacing: "0.02em",
                  zIndex: 1,
                }}
              >
                {post.trickName.toUpperCase()}
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: "var(--hammer)",
                  fontSize: 44,
                  color: "var(--hazard)",
                  letterSpacing: "0.02em",
                }}
              >
                {post.trickName.toUpperCase()}
              </span>
            )}
          </div>
        )}

        <div className="post-actions">
          <button
            className={`react-btn ${myReaction?.type === "push" ? "on" : ""}`}
            onClick={() => onReact("push")}
          >
            ▲ PUSH · {post.reactionCounts.push}
          </button>
          <button
            className={`react-btn ${myReaction?.type === "same" ? "on" : ""}`}
            onClick={() => onReact("same")}
          >
            ◉ SAME BOAT · {post.reactionCounts.same}
          </button>
          <button
            className={`react-btn ${myReaction?.type === "fire" ? "on" : ""}`}
            onClick={() => onReact("fire")}
          >
            ✺ FIRE · {post.reactionCounts.fire}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="sec-head">
        <h3>Comments</h3>
        <span className="label">{post.commentCount}</span>
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 18,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={onComment}
        style={{ display: "flex", gap: 10, marginBottom: 18 }}
      >
        <input
          type="text"
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Add a comment…"
          maxLength={500}
          style={{
            flex: 1,
            background: "var(--ink)",
            border: "1px solid var(--ink-3)",
            borderRadius: "var(--r-s)",
            padding: "10px 12px",
            color: "var(--paper)",
            fontFamily: "var(--body)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={posting || commentBody.trim().length === 0}
        >
          {posting ? "…" : "Reply"}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="dim small" style={{ textAlign: "center", padding: "24px 0" }}>
          No comments yet. Be the first.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              c={c}
              canDelete={
                profile?.uid === c.authorUid || profile?.uid === post.authorUid
              }
              onDelete={() => onDeleteComment(c)}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/social">
          <Button variant="ghost">← Back to Social</Button>
        </Link>
      </div>
    </div>
  );
}

function CommentRow({
  c,
  canDelete,
  onDelete,
}: {
  c: PostComment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const color =
    c.authorAliasColor ?? aliasColor(c.authorAlias.toLowerCase());
  return (
    <div
      className="card-dark"
      style={{ padding: 14, display: "flex", gap: 12 }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: color,
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--hammer)",
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {aliasInitials(c.authorAlias)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "baseline",
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--display)",
              fontSize: 14,
              letterSpacing: "0.04em",
            }}
          >
            @{c.authorAlias}
          </span>
          <span className="label">
            {new Date(c.createdAt).toLocaleString()}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            color: "var(--paper-2)",
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {c.body}
        </p>
      </div>
      {canDelete && (
        <button
          className="react-btn"
          onClick={onDelete}
          style={{ cursor: "pointer" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
