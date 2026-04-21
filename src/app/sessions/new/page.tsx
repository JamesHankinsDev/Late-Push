"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import SessionForm from "@/components/sessions/SessionForm";
import CoachResponse from "@/components/sessions/CoachResponse";
import {
  createSession,
  getUserSessions,
  updateSession,
} from "@/lib/sources/firestore";
import { createPost } from "@/lib/sources/posts";
import { getTrickById } from "@/lib/curriculum";
import { mergePrivacy } from "@/lib/social/privacy";
import {
  BodyFeel,
  PostStamp,
  PostVisibility,
  Session,
} from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

type Outcome = "landed" | "close" | "bailed" | "injured";

const OUTCOME_TO_PREFILL: Record<
  Outcome,
  { whatClicked?: string; whatDidnt?: string; bodyFeel?: BodyFeel }
> = {
  landed: { whatClicked: "Landed it clean." },
  close: { whatClicked: "Got close — felt the pop." },
  bailed: { whatDidnt: "Bailed tonight. Going to sleep on it." },
  injured: { bodyFeel: "injured" },
};

export default function NewSessionPage() {
  const { profile, refreshSessions } = useAuthContext();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [error, setError] = useState("");
  const [lastSession, setLastSession] = useState<
    (Session & { id: string }) | null
  >(null);

  const trickIdParam = searchParams.get("trickId");
  const outcomeParam = searchParams.get("outcome") as Outcome | null;
  const initialTricks =
    trickIdParam && getTrickById(trickIdParam) ? [trickIdParam] : [];
  const prefill = outcomeParam ? OUTCOME_TO_PREFILL[outcomeParam] ?? {} : {};

  const handleSubmit = async (
    sessionData: Omit<Session, "id" | "userId" | "createdAt" | "coachResponse">
  ) => {
    if (!profile) {
      setError("You need to be signed in to log a session.");
      return;
    }
    setError("");
    setLoading(true);

    let sessionId: string;
    const createdAt = new Date().toISOString();
    try {
      sessionId = await createSession({
        ...sessionData,
        userId: profile.uid,
        createdAt,
      });
    } catch (err: unknown) {
      console.error("createSession failed:", err);
      setError(
        err instanceof Error
          ? `Couldn't save the session: ${err.message}`
          : "Couldn't save the session. Check your connection and try again."
      );
      setLoading(false);
      return;
    }

    setLastSession({
      id: sessionId,
      ...sessionData,
      userId: profile.uid,
      createdAt,
    });
    setSessionSaved(true);
    setLoading(false);
    setCoachLoading(true);

    try {
      const allSessions = await getUserSessions(profile.uid);
      const currentSession = {
        id: sessionId,
        ...sessionData,
        userId: profile.uid,
        createdAt: new Date().toISOString(),
      };

      const coachRes = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "session",
          session: currentSession,
          profile,
          sessions: allSessions,
        }),
      });

      if (coachRes.ok) {
        const data = await coachRes.json();
        setCoachResponse(data.response);
        await updateSession(sessionId, { coachResponse: data.response });
      }

      await refreshSessions();
    } catch (err) {
      console.error("Coach response failed:", err);
      // The session still saved — just no coach response.
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>LOG A SESSION</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          What went down?
        </h1>
        <p className="dim" style={{ maxWidth: "52ch", marginTop: 8 }}>
          Track what you worked on. Your AI coach reviews every session and
          writes back. More detail = better feedback, but a quick log still
          counts.
        </p>
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      {!sessionSaved ? (
        <SessionForm
          onSubmit={handleSubmit}
          loading={loading}
          initialTricks={initialTricks}
          initialWhatClicked={prefill.whatClicked}
          initialWhatDidnt={prefill.whatDidnt}
          initialBodyFeel={prefill.bodyFeel}
        />
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          <div
            className="card-dark"
            style={{
              padding: 20,
              borderColor: "var(--mint)",
              background: "rgba(120,209,154,0.06)",
              textAlign: "center",
            }}
          >
            <Eyebrow tone="mint">SESSION LOGGED</Eyebrow>
            <p
              style={{
                fontFamily: "var(--hammer)",
                fontSize: 28,
                letterSpacing: "0.02em",
                marginTop: 10,
                marginBottom: 4,
              }}
            >
              Nice work getting out there.
            </p>
            <p className="dim" style={{ fontSize: 13 }}>
              Your coach is writing back below.
            </p>
          </div>

          {lastSession && profile && privacyAllowsShare(profile) && (
            <ShareToFeed session={lastSession} />
          )}

          <CoachResponse response={coachResponse} loading={coachLoading} />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                setSessionSaved(false);
                setCoachResponse("");
              }}
            >
              Log another
            </Button>
            <Link href="/sessions" style={{ flex: 1 }}>
              <Button variant="ghost" style={{ width: "100%", justifyContent: "center" }}>
                View sessions
              </Button>
            </Link>
            <Link href="/dashboard" style={{ flex: 1 }}>
              <Button variant="primary" style={{ width: "100%", justifyContent: "center" }}>
                Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function privacyAllowsShare(profile: {
  privacy?: import("@/lib/types").PrivacySettings;
  alias?: string;
}): boolean {
  const privacy = mergePrivacy(profile.privacy);
  return privacy.socialEnabled && !!profile.alias;
}

function ShareToFeed({
  session,
}: {
  session: Session & { id: string };
}) {
  const { profile } = useAuthContext();
  const [body, setBody] = useState(session.whatClicked || "");
  const [stamp, setStamp] = useState<PostStamp>(
    session.whatClicked ? "LANDED" : "PROGRESS"
  );
  const [visibility, setVisibility] = useState<PostVisibility>("friends");
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");

  const primaryTrick = session.tricksPracticed[0];
  const trick = primaryTrick ? getTrickById(primaryTrick) : undefined;

  if (done) {
    return (
      <div
        className="card-dark"
        style={{
          padding: 18,
          borderColor: "var(--mint)",
          background: "rgba(120,209,154,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Tag tone="mint">SHARED</Tag>
        <span className="dim" style={{ fontSize: 13, flex: 1 }}>
          Your post is live on the feed.
        </span>
        <Link href={`/posts/${done}`}>
          <Button variant="ghost" size="sm">
            View post →
          </Button>
        </Link>
      </div>
    );
  }

  async function handleShare() {
    if (!profile || posting) return;
    setPosting(true);
    setError("");
    try {
      const post = await createPost(
        {
          body: body.trim() || session.whatClicked || "Logged a session.",
          visibility,
          sessionRef: session.id,
          trickRef: trick?.id,
          trickName: trick?.name,
          stamp,
        },
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        }
      );
      setDone(post.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't share that post.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="card-dark" style={{ padding: 18, display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Eyebrow>SHARE TO FEED</Eyebrow>
        <span className="label">OPTIONAL</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="A line or two on how the session went…"
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
          minHeight: 60,
        }}
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span className="label">STAMP →</span>
        {(
          [
            { id: "LANDED", tone: "mint" },
            { id: "PROGRESS", tone: "yellow" },
            { id: "BAILED", tone: "coral" },
            { id: "FIRST", tone: "mint" },
          ] as const
        ).map((s) => {
          const active = stamp === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStamp(s.id as PostStamp)}
              style={{
                background: active ? "var(--hazard)" : "var(--ink)",
                color: active ? "var(--ink)" : "var(--paper-dim)",
                border: `1px solid ${active ? "var(--ink)" : "var(--ink-3)"}`,
                padding: "4px 8px",
                borderRadius: 4,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.08em",
                cursor: "pointer",
                fontWeight: active ? 700 : 400,
              }}
            >
              {s.id}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span className="label">VISIBLE TO →</span>
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
                padding: "4px 10px",
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
        <Button
          variant="primary"
          size="sm"
          onClick={handleShare}
          disabled={posting || body.trim().length === 0}
        >
          {posting ? "Sharing…" : "Share →"}
        </Button>
      </div>
      {error && (
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--coral)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
