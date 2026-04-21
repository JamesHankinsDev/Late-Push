"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  clearReaction,
  createPost,
  deletePost,
  getMyReactionsForPosts,
  listPublicFeed,
  setReaction,
} from "@/lib/sources/posts";
import { detectPii, PII_LABELS } from "@/lib/moderation/patterns";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import {
  Post,
  PostReaction,
  PostStamp,
  PostVisibility,
  ReactionType,
} from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

const VISIBILITY_LABEL: Record<PostVisibility, string> = {
  public: "PUBLIC",
  friends: "FRIENDS",
  "only-me": "DRAFT",
};

const STAMP_TONE: Record<PostStamp, "mint" | "yellow" | "coral"> = {
  LANDED: "mint",
  PROGRESS: "yellow",
  BAILED: "coral",
  FIRST: "mint",
};

export default function FeedTab() {
  const { profile } = useAuthContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Record<string, PostReaction>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const fresh = await listPublicFeed(30);
      setPosts(fresh);
      const mine = await getMyReactionsForPosts(
        profile.uid,
        fresh.map((p) => p.id)
      );
      setReactions(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load feed.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onReact(post: Post, type: ReactionType) {
    if (!profile) return;
    const current = reactions[post.id]?.type;
    // Optimistic: same reaction toggles off; otherwise swap.
    try {
      if (current === type) {
        setReactions((r) => {
          const next = { ...r };
          delete next[post.id];
          return next;
        });
        setPosts((ps) =>
          ps.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  reactionCounts: {
                    ...p.reactionCounts,
                    [type]: Math.max(0, p.reactionCounts[type] - 1),
                  },
                }
              : p
          )
        );
        await clearReaction(post.id, profile.uid);
      } else {
        setReactions((r) => ({
          ...r,
          [post.id]: {
            id: `${post.id}__${profile.uid}`,
            postId: post.id,
            uid: profile.uid,
            alias: profile.alias ?? "",
            type,
            createdAt: new Date().toISOString(),
          },
        }));
        setPosts((ps) =>
          ps.map((p) => {
            if (p.id !== post.id) return p;
            const next = { ...p.reactionCounts };
            if (current) next[current] = Math.max(0, next[current] - 1);
            next[type] = next[type] + 1;
            return { ...p, reactionCounts: next };
          })
        );
        await setReaction(
          post,
          { uid: profile.uid, alias: profile.alias ?? "" },
          type
        );
      }
    } catch {
      // On failure, refresh to get truth back.
      refresh();
    }
  }

  async function onDelete(post: Post) {
    if (!profile) return;
    if (!confirm("Delete this post? Reactions and comments go with it.")) return;
    try {
      await deletePost(post.id);
      setPosts((ps) => ps.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete post.");
    }
  }

  if (!profile) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span className="label">
          {posts.length} PUBLIC POST{posts.length === 1 ? "" : "S"}
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setComposerOpen((v) => !v)}
        >
          {composerOpen ? "Close composer" : "+ Share something"}
        </Button>
      </div>

      {composerOpen && (
        <Composer
          onPosted={() => {
            setComposerOpen(false);
            refresh();
          }}
          onError={(e) => setError(e)}
        />
      )}

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

      {loading && posts.length === 0 ? (
        <div style={{ display: "grid", gap: 18 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 220 }}
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 32, textAlign: "center" }}
        >
          <Eyebrow>QUIET FEED</Eyebrow>
          <p
            className="dim"
            style={{ fontSize: 14, marginTop: 12 }}
          >
            No public posts yet. Be the first — log a session and share the
            result, or drop a quick update.
          </p>
        </div>
      ) : (
        <div className="feed">
          {posts.map((p) => (
            <FeedPost
              key={p.id}
              post={p}
              myReaction={reactions[p.id]?.type}
              isAuthor={p.authorUid === profile.uid}
              onReact={(type) => onReact(p, type)}
              onDelete={() => onDelete(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Composer({
  onPosted,
  onError,
}: {
  onPosted: () => void;
  onError: (msg: string) => void;
}) {
  const { profile } = useAuthContext();
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [saving, setSaving] = useState(false);

  const piiHits = detectPii(body);
  const canPost = body.trim().length > 0 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !canPost) return;
    if (piiHits.length > 0 && visibility === "public") {
      const labels = piiHits.map((h) => PII_LABELS[h]).join(", ");
      if (
        !confirm(
          `Heads up — this post looks like it includes ${labels}. Public posts are visible to anyone. Share anyway?`
        )
      )
        return;
    }
    setSaving(true);
    try {
      await createPost(
        { body, visibility },
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        }
      );
      setBody("");
      onPosted();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Couldn't post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-dark"
      style={{ padding: 18, marginBottom: 18, display: "grid", gap: 12 }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="What went down today?"
        style={{
          width: "100%",
          background: "var(--ink)",
          border: "1px solid var(--ink-3)",
          borderRadius: "var(--r-s)",
          padding: "10px 12px",
          color: "var(--paper)",
          fontFamily: "var(--body)",
          fontSize: 14,
          outline: "none",
          resize: "vertical",
          minHeight: 80,
        }}
      />
      {piiHits.length > 0 && visibility === "public" && (
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--coral)",
            padding: "6px 10px",
            border: "1px solid var(--coral)",
            borderRadius: 4,
          }}
        >
          ⚠ Looks like this includes{" "}
          {piiHits.map((h) => PII_LABELS[h]).join(", ")}. Public posts are
          visible to everyone — we&apos;ll ask you to confirm before sending.
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span className="label" style={{ marginRight: 2 }}>
          VISIBLE TO →
        </span>
        {(
          [
            { id: "public", lbl: "PUBLIC" },
            { id: "friends", lbl: "FRIENDS" },
            { id: "only-me", lbl: "ONLY ME" },
          ] as const
        ).map((v) => {
          const active = visibility === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setVisibility(v.id)}
              style={{
                background: active ? "var(--hazard)" : "var(--ink)",
                color: active ? "var(--ink)" : "var(--paper-dim)",
                border: `1px solid ${active ? "var(--ink)" : "var(--ink-3)"}`,
                padding: "5px 10px",
                borderRadius: 4,
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                cursor: "pointer",
                fontWeight: active ? 700 : 400,
              }}
            >
              {v.lbl}
            </button>
          );
        })}
        <span style={{ flex: 1 }} />
        <Button type="submit" variant="primary" size="sm" disabled={!canPost}>
          {saving ? "Posting…" : "Share →"}
        </Button>
      </div>
    </form>
  );
}

function FeedPost({
  post,
  myReaction,
  isAuthor,
  onReact,
  onDelete,
}: {
  post: Post;
  myReaction: ReactionType | undefined;
  isAuthor: boolean;
  onReact: (type: ReactionType) => void;
  onDelete: () => void;
}) {
  const color =
    post.authorAliasColor ?? aliasColor(post.authorAlias.toLowerCase());

  return (
    <div className="feed-post">
      <div className="post-head">
        <div className="avatar" style={{ background: color }}>
          {aliasInitials(post.authorAlias)}
        </div>
        <div className="meta">
          <span className="nm">@{post.authorAlias}</span>
          <span className="ts">
            {relativeTime(post.createdAt)} ·{" "}
            {VISIBILITY_LABEL[post.visibility]}
          </span>
        </div>
        <div className="spacer" />
        {isAuthor && (
          <button
            className="react-btn"
            onClick={onDelete}
            title="Delete post"
            aria-label="Delete post"
            style={{ cursor: "pointer" }}
          >
            ✕
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
                fontSize: 40,
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
                fontSize: 40,
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
          className={`react-btn ${myReaction === "push" ? "on" : ""}`}
          onClick={() => onReact("push")}
        >
          ▲ PUSH · {post.reactionCounts.push}
        </button>
        <button
          className={`react-btn ${myReaction === "same" ? "on" : ""}`}
          onClick={() => onReact("same")}
        >
          ◉ SAME BOAT · {post.reactionCounts.same}
        </button>
        <button
          className={`react-btn ${myReaction === "fire" ? "on" : ""}`}
          onClick={() => onReact("fire")}
        >
          ✺ FIRE · {post.reactionCounts.fire}
        </button>
        <Link
          href={`/posts/${post.id}`}
          className="react-btn"
          style={{ marginLeft: "auto", cursor: "pointer" }}
        >
          ✎ {post.commentCount} comments
        </Link>
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}D`;
  return "A WHILE AGO";
}
