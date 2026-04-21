"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import { Session, STATUS_RANK } from "@/lib/types";
import { getTrickById } from "@/lib/curriculum";
import {
  computeStreak,
  daysSince,
  pickActiveTrick,
  computeBodyTrend,
} from "@/lib/stats";
import { startOfMonth, endOfMonth, format } from "date-fns";

import { Button, Eyebrow, Tag } from "@/components/ui/primitives";
import HeroBlock from "@/components/home/HeroBlock";
import MissionCard from "@/components/home/MissionCard";
import TierProgressCards from "@/components/home/TierProgressCards";
import BodyStatusWidget from "@/components/home/BodyStatusWidget";
import RecentActivityWidget from "@/components/home/RecentActivityWidget";
import NearbyPreview from "@/components/home/NearbyPreview";
import MeetupsPreview from "@/components/home/MeetupsPreview";
import CoachResponse from "@/components/sessions/CoachResponse";

export default function DashboardPage() {
  const { profile, sessions, profileLoading, sessionsLoading } = useAuthContext();
  const [monthlySummary, setMonthlySummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Loading gate: wait for profile + sessions on the *first* load. Subsequent
  // navigations back to the dashboard reuse the cached values instantly.
  const loading = profileLoading || sessionsLoading || !profile;

  const trickProgress = useMemo(() => profile?.trickProgress ?? {}, [profile]);

  const tricksLanded = useMemo(
    () =>
      Object.values(trickProgress).filter(
        (p) => STATUS_RANK[p.status] >= STATUS_RANK.landed_once
      ).length,
    [trickProgress]
  );

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const bodyTrend = useMemo(() => computeBodyTrend(sessions), [sessions]);
  const daysIn = useMemo(() => daysSince(profile?.createdAt), [profile]);

  const activeTrick = useMemo(
    () => pickActiveTrick(trickProgress, profile?.currentTier ?? 0),
    [trickProgress, profile]
  );

  const thisMonthSessions = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= monthStart && d <= monthEnd;
    });
  }, [sessions]);

  const sessionNumber = sessions.length + 1;
  const drillEstimate = activeTrick?.estimatedAdultLearningTime
    ? undefined
    : "~30 min";

  const handleMonthlySummary = async () => {
    if (!profile || thisMonthSessions.length === 0) return;
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "monthly",
          profile,
          sessions: thisMonthSessions,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMonthlySummary(data.response);
      }
    } catch (error) {
      console.error("Monthly summary error:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div
          className="card-dark animate-pulse"
          style={{ height: 280, marginBottom: 24 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20 }}>
          <div className="card-dark animate-pulse" style={{ height: 200 }} />
          <div
            className="card-dark animate-pulse"
            style={{ height: 200 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroBlock
        landed={tricksLanded}
        sessions={sessions.length}
        streak={streak}
        daysIn={daysIn}
        nextTrickName={activeTrick?.name}
      />

      {/* Today: mission + side stack */}
      <div className="today-grid">
        <MissionCard
          trick={activeTrick}
          sessionNumber={sessionNumber}
          drillEstimate={drillEstimate}
        />
        <div className="side-stack">
          <BodyStatusWidget trend={bodyTrend} />
          <RecentActivityWidget sessions={sessions} />
        </div>
      </div>

      {/* Tier progression */}
      <div className="sec-head">
        <h3>The Road So Far</h3>
        <span className="label">
          {tricksLanded}/{Object.keys(trickProgress).length || 0} TRACKED ·{" "}
          {sessions.length} SESSIONS
        </span>
      </div>
      <TierProgressCards
        trickProgress={trickProgress}
        currentTier={profile?.currentTier ?? 0}
      />

      {/* Nearby — mock */}
      <div className="sec-head">
        <h3>Who&apos;s Nearby at Your Level</h3>
        <Tag tone="outline">SOCIAL PREVIEW</Tag>
      </div>
      <NearbyPreview />

      {/* Meetups — mock */}
      <div className="sec-head">
        <h3>Upcoming Meetups</h3>
        <Tag tone="outline">SOCIAL PREVIEW</Tag>
      </div>
      <MeetupsPreview />

      {/* Monthly summary */}
      <div className="sec-head">
        <h3>Monthly Summary</h3>
        {thisMonthSessions.length > 0 && !monthlySummary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMonthlySummary}
            disabled={summaryLoading}
          >
            {summaryLoading ? "Generating..." : "Generate →"}
          </Button>
        )}
      </div>
      {monthlySummary ? (
        <CoachResponse response={monthlySummary} />
      ) : thisMonthSessions.length === 0 ? (
        <p className="dim" style={{ fontSize: 13 }}>
          No sessions this month yet. Get out there.
        </p>
      ) : (
        <p className="dim" style={{ fontSize: 13 }}>
          {thisMonthSessions.length} session
          {thisMonthSessions.length === 1 ? "" : "s"} logged this month. Click
          Generate to get the AI coach&apos;s take.
        </p>
      )}

      {/* Recent sessions */}
      <div className="sec-head">
        <h3>Recent Sessions</h3>
        <Link href="/sessions" className="label" style={{ color: "var(--hazard)" }}>
          VIEW ALL →
        </Link>
      </div>
      {sessions.length === 0 ? (
        <div className="card-dark" style={{ padding: 32, textAlign: "center" }}>
          <Eyebrow>EMPTY LOG</Eyebrow>
          <p
            style={{
              color: "var(--paper-dim)",
              margin: "10px 0 14px",
              fontSize: 14,
            }}
          >
            Your session log is empty. Board&apos;s waiting.
          </p>
          <Link href="/sessions/new">
            <Button variant="primary">Log your first session →</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sessions.slice(0, 5).map((s) => {
            const trickNames = s.tricksPracticed
              .slice(0, 3)
              .map((id) => getTrickById(id)?.name ?? id)
              .join(", ");
            const feel =
              s.bodyFeel === "fine"
                ? "fine"
                : s.bodyFeel === "sore"
                ? "sore"
                : "injured";
            const dateLabel = formatSessionDate(s.date);
            return (
              <div
                key={s.id}
                className="card-dark"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto auto",
                  gap: 20,
                  alignItems: "center",
                  padding: "14px 20px",
                }}
              >
                <span
                  className="mono"
                  style={{
                    color: "var(--hazard)",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                  }}
                >
                  {dateLabel}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 16,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {(trickNames || "SESSION").toUpperCase()}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--paper-dim)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {s.location ? s.location.toUpperCase() + " · " : ""}
                    {s.duration}M · FELT {feel.toUpperCase()}
                  </div>
                </div>
                <Tag tone={feel === "injured" ? "coral" : "yellow"}>
                  +{estimateXp(s)} XP
                </Tag>
                <span style={{ color: "var(--paper-dim)" }}>→</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatSessionDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d").toUpperCase();
  } catch {
    return iso.slice(5, 10).toUpperCase();
  }
}

function estimateXp(s: Session): number {
  // Rough placeholder XP computation until a real XP system exists.
  const base = Math.min(60, Math.round(s.duration / 2));
  const multiplier = s.tricksPracticed.length ? 1 + s.tricksPracticed.length * 0.1 : 1;
  return Math.round(base * multiplier);
}
