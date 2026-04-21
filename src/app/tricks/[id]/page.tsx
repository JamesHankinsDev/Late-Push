"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import {
  TRICKS,
  TIERS,
  getTrickById,
  getPrerequisiteTricks,
  getEffectiveStatus,
} from "@/lib/curriculum";
import { TrickStatus, YouTubeVideo, STATUS_RANK } from "@/lib/types";
import {
  Button,
  Eyebrow,
  StatusPill,
  DifficultyMeter,
} from "@/components/ui/primitives";

type CheckinOutcome = "landed" | "close" | "bailed" | "injured";

const CHECKIN_OPTIONS: { id: CheckinOutcome; lbl: string; ico: string }[] = [
  { id: "landed", lbl: "LANDED IT CLEAN", ico: "✦" },
  { id: "close", lbl: "GOT CLOSE — FELT THE POP", ico: "◐" },
  { id: "bailed", lbl: "BAILED. GOING TO SLEEP", ico: "✕" },
  { id: "injured", lbl: "HURT — NOT TONIGHT", ico: "!" },
];

const RISK_LABEL = { low: "LOW", medium: "MEDIUM", high: "HIGH" } as const;

export default function LessonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { profile } = useAuthContext();
  const trick = useMemo(() => getTrickById(params.id), [params.id]);

  const trickProgress = profile?.trickProgress ?? {};
  const status: TrickStatus = trick
    ? getEffectiveStatus(trick.id, trickProgress)
    : "locked";

  const prereqs = useMemo(
    () => (trick ? getPrerequisiteTricks(trick) : []),
    [trick]
  );

  const allPrereqsLanded = prereqs.every((p) => {
    const s = trickProgress[p.id]?.status;
    return (
      s === "landed_once" ||
      s === "consistent" ||
      s === "mastered"
    );
  });

  const [attempt, setAttempt] = useState<CheckinOutcome | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    if (!trick) return;
    setLoadingVideos(true);
    fetch(`/api/youtube?q=${encodeURIComponent(trick.searchQuery)}`)
      .then((r) => r.json())
      .then((data) => setVideos(data.videos ?? []))
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false));
  }, [trick]);

  if (!trick) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NOT FOUND</Eyebrow>
        <h2 className="hed hed-m" style={{ marginTop: 12, marginBottom: 8 }}>
          No such trick
        </h2>
        <p className="dim">We couldn&apos;t find a trick with id <code>{params.id}</code>.</p>
        <div style={{ marginTop: 18 }}>
          <Link href="/tricks">
            <Button variant="ghost">← Back to the path</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tier = TIERS[trick.tier];
  const nameParts = trick.name.split(" ");
  const lead = nameParts.slice(0, -1).join(" ");
  const highlight = nameParts[nameParts.length - 1];

  const steps = [
    {
      t: "Set up",
      p:
        "Start slow — stationary or on grass first. Running through the motion once before you fully commit saves you from fighting muscle memory later.",
    },
    {
      t: "Try it slow",
      p:
        "Half speed, half height. You're training coordination, not winning the X Games. Precision before power.",
    },
    {
      t: "Commit",
      p:
        "Half-committing is how you get hurt. When you decide to do it, do the whole thing, even if it's ugly.",
    },
  ];

  const drill = [
    { t: "25 controlled attempts", s: "Film 3 from the side" },
    { t: "5 motion-only reps (no land)", s: "Focus on the mechanics" },
    { t: "10 attempts at working speed", s: "Only after the motion feels solid" },
  ];

  function logSession() {
    const url = `/sessions/new?trickId=${encodeURIComponent(trick!.id)}${
      attempt ? `&outcome=${attempt}` : ""
    }`;
    router.push(url);
  }

  return (
    <div>
      <div className="lesson-hero">
        <div className="crumb">
          <Link href="/tricks">THE PATH</Link>
          <span className="sep">/</span>
          <span>TIER 0{trick.tier}</span>
          <span className="sep">/</span>
          <span style={{ color: "var(--hazard)" }}>#{trick.id.toUpperCase()}</span>
        </div>
        <h1 className="big-title">
          {lead}
          {lead ? " " : ""}
          <span className="hi">{highlight}</span>
        </h1>
        <p className="blurb">{trick.description}</p>
        <div className="chip-row">
          <span className="chip">
            DIFF <DifficultyMeter value={trick.difficulty} max={10} />{" "}
            {trick.difficulty}/10
          </span>
          <span className="chip">{RISK_LABEL[trick.injuryRisk]} RISK</span>
          {trick.estimatedAdultLearningTime && (
            <span className="chip">{trick.estimatedAdultLearningTime}</span>
          )}
          <StatusPill status={status} />
        </div>
      </div>

      <div className="lesson">
        <div className="lesson-main">
          {/* Video */}
          <div className="sec-head" style={{ marginTop: 0 }}>
            <h3>Watch it first</h3>
            <span className="label">
              {loadingVideos
                ? "LOADING..."
                : videos.length
                ? `${videos.length} RESULTS · TAP TO OPEN`
                : "NO VIDEOS"}
            </span>
          </div>

          {videos.length > 0 ? (
            <a
              href={`https://www.youtube.com/watch?v=${videos[0].videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="video-box"
              style={{ display: "block" }}
            >
              <div className="play">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="overlay-meta">
                <div className="v-title">{videos[0].title}</div>
                <div className="v-chan">{videos[0].channelTitle.toUpperCase()}</div>
              </div>
            </a>
          ) : (
            <div className="video-box" aria-disabled>
              <div className="play">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="overlay-meta">
                <div className="v-title">HOW TO {trick.name.toUpperCase()}</div>
                <div className="v-chan">
                  {loadingVideos ? "LOADING..." : "SET YOUTUBE API KEY TO ENABLE"}
                </div>
              </div>
            </div>
          )}

          {videos.length > 1 && (
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              {videos.slice(1).map((v) => (
                <a
                  key={v.videoId}
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 10,
                    background: "var(--ink-2)",
                    border: "1px solid var(--ink-3)",
                    borderRadius: "var(--r-s)",
                  }}
                >
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    style={{
                      width: 96,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--paper)",
                        fontWeight: 500,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {v.title}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--paper-dim)",
                        letterSpacing: "0.08em",
                        marginTop: 4,
                      }}
                    >
                      {v.channelTitle.toUpperCase()}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Steps */}
          <div className="sec-head">
            <h3>Step-by-Step</h3>
            <span className="label">{steps.length} PHASES</span>
          </div>
          <div className="steps">
            {steps.map((s, i) => (
              <div key={i} className="step">
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h5>{s.t}</h5>
                  <p>{s.p}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="sec-head">
            <h3>Tips & Common Mistakes</h3>
            <span className="label">{trick.tips.length} THINGS TO REMEMBER</span>
          </div>
          <div className="tips">
            {trick.tips.map((t, i) => (
              <div key={i} className="tip">
                <span className="bullet">▸</span>
                <p>{t}</p>
              </div>
            ))}
          </div>

          {/* Drill */}
          <div className="sec-head">
            <h3>Tonight&apos;s Drill</h3>
            <span className="label">~30 MIN · CHECK OFF AS YOU GO</span>
          </div>
          <div className="drill">
            <h4>⚑ Complete the set, check in below.</h4>
            {drill.map((d, i) => (
              <div
                key={i}
                className={`drill-item ${checked[i] ? "done" : ""}`}
                onClick={() =>
                  setChecked((c) => ({ ...c, [i]: !c[i] }))
                }
              >
                <div className="drill-check">{checked[i] && "✓"}</div>
                <div style={{ flex: 1 }}>
                  <div className="drill-text">{d.t}</div>
                  <div className="drill-sub">{d.s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Check-in */}
          <div className="sec-head">
            <h3>End-of-session Check-in</h3>
            <span className="label">LOG IT · BUILD THE RECORD</span>
          </div>
          <div className="checkin">
            <h4>HOW&apos;D IT GO?</h4>
            <div className="sub">PICK ONE — WE&apos;LL LOG IT AND NUDGE YOUR STATUS</div>
            <div className="checkin-options">
              {CHECKIN_OPTIONS.map((o) => (
                <div
                  key={o.id}
                  className={`check-opt ${attempt === o.id ? "sel" : ""}`}
                  onClick={() => setAttempt(o.id)}
                >
                  <span className="ico">{o.ico}</span>
                  <span>{o.lbl}</span>
                </div>
              ))}
            </div>
            {attempt && (
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <Button variant="coral" onClick={logSession}>
                  Log session →
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttempt(null)}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lesson-side">
          <div className="card-dark" style={{ marginBottom: 18 }}>
            <Eyebrow tone={allPrereqsLanded ? "mint" : "coral"}>
              PREREQUISITE CHECK
            </Eyebrow>
            <div className="hed hed-s" style={{ margin: "10px 0 4px" }}>
              {prereqs.length === 0
                ? "No prereqs."
                : allPrereqsLanded
                ? "You're ready."
                : "Not quite yet."}
            </div>
            <p className="dim" style={{ fontSize: 12, margin: "0 0 12px" }}>
              {prereqs.length === 0
                ? "This one's a starting point — jump in."
                : allPrereqsLanded
                ? "All prereqs landed at least once."
                : "Knock these out first to get the most out of this lesson."}
            </p>
            {prereqs.length > 0 && (
              <div className="prereqs">
                {prereqs.map((p) => {
                  const pStatus = getEffectiveStatus(p.id, trickProgress);
                  const landed =
                    STATUS_RANK[pStatus] >= STATUS_RANK.landed_once;
                  return (
                    <Link
                      key={p.id}
                      href={`/tricks/${p.id}`}
                      className={`prereq-item ${landed ? "" : "incomplete"}`}
                    >
                      <span className="dot" />
                      <div>
                        <div className="n">{p.name}</div>
                        <div className="s">
                          T{p.tier} · {landed ? "LANDED" : "IN PROGRESS"}
                        </div>
                      </div>
                      <span style={{ color: "var(--paper-dim)" }}>→</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="card-dark"
            style={{
              marginBottom: 18,
              background: "rgba(179,140,255,0.05)",
              borderColor: "var(--violet)",
            }}
          >
            <Eyebrow tone="default">AI COACH</Eyebrow>
            <div className="hed hed-s" style={{ margin: "10px 0 4px" }}>
              Stuck on this one?
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--paper-2)",
                margin: "0 0 12px",
              }}
            >
              Tell me what&apos;s happening and I&apos;ll give you targeted
              drills. Log a session and the coach writes you back.
            </p>
            <Link href={`/sessions/new?trickId=${encodeURIComponent(trick.id)}`}>
              <Button variant="ghost" size="sm">
                Ask the coach →
              </Button>
            </Link>
          </div>

          <div className="card-dark">
            <Eyebrow tone="mint">WHO&apos;S WORKING ON THIS</Eyebrow>
            <p
              className="dim"
              style={{ fontSize: 12, margin: "10px 0 12px" }}
            >
              Social is coming in the next update. For now, it&apos;s you and
              the internet.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
