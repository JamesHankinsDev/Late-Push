"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuthContext } from "@/components/AuthProvider";
import { STATUS_RANK, TrickStatus } from "@/lib/types";
import { TIERS, TRICKS, getEffectiveStatus, getTrickById } from "@/lib/curriculum";
import { BADGES, isBadgeEarned } from "@/lib/badges";
import { computeStreak, daysSince } from "@/lib/stats";
import { STANCE_LABEL } from "@/lib/profile/options";
import { Button, Bar, Tag, Eyebrow } from "@/components/ui/primitives";

const XP_BY_STATUS: Record<TrickStatus, number> = {
  locked: 0,
  not_started: 0,
  practicing: 10,
  landed_once: 40,
  consistent: 60,
  mastered: 100,
};
const XP_PER_LEVEL = 300;

function initials(name: string | null | undefined): string {
  if (!name) return "YO";
  const parts = name.trim().split(/\s+/);
  const f = parts[0]?.[0] ?? "";
  const l = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (f + l).toUpperCase() || "YO";
}

function handleFromEmail(email: string | undefined): string {
  if (!email) return "@you";
  const prefix = email.split("@")[0].replace(/[^a-z0-9_]/gi, "");
  return "@" + (prefix || "you");
}

export default function ProfilePage() {
  const { profile, sessions, signOut, profileLoading, sessionsLoading } =
    useAuthContext();

  const loading = profileLoading || sessionsLoading || !profile;

  const trickProgress = useMemo(() => profile?.trickProgress ?? {}, [profile]);

  const tricksLanded = useMemo(
    () =>
      Object.values(trickProgress).filter(
        (p) => STATUS_RANK[p.status] >= STATUS_RANK.landed_once
      ).length,
    [trickProgress]
  );
  const totalTricks = TRICKS.length;

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const days = useMemo(() => daysSince(profile?.createdAt), [profile]);

  const totalXp = useMemo(() => {
    return TRICKS.reduce((acc, t) => {
      const status = getEffectiveStatus(t.id, trickProgress);
      return acc + (XP_BY_STATUS[status] ?? 0);
    }, 0);
  }, [trickProgress]);

  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL;
  const xpPct = Math.round((xpIntoLevel / xpToNext) * 100);

  const displayName = profile?.displayName || "Skater";
  const initialsStr = initials(displayName);
  const handle = handleFromEmail(profile?.email);
  const currentTier = profile?.currentTier ?? 0;

  if (loading) {
    return (
      <div>
        <div
          className="card-dark animate-pulse"
          style={{ height: 240, marginBottom: 24 }}
        />
        <div
          className="card-dark animate-pulse"
          style={{ height: 180 }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NOT SIGNED IN</Eyebrow>
        <p className="dim" style={{ marginTop: 10 }}>
          Sign in to see your profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-ident">
          <div className="avatar">{initialsStr}</div>
          <div>
            <h2>
              {displayName.split(" ")[0].toUpperCase()}{" "}
              <span style={{ color: "var(--hazard)" }}>/</span> TIER {currentTier}
            </h2>
            <div className="handle">
              {handle} ·{" "}
              {profile.stance ? STANCE_LABEL[profile.stance] : "STANCE UNSET"} ·
              JOINED{" "}
              {format(
                new Date(profile.createdAt),
                "MMM yyyy"
              ).toUpperCase()}
            </div>
            <p className="bio">
              {profile.bio ||
                "No bio yet. Click Edit profile to tell Late Push your story — why you started, what you want to land."}
            </p>
            {(profile.goals?.length ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                <span
                  className="label"
                  style={{ alignSelf: "center", marginRight: 4 }}
                >
                  GOALS →
                </span>
                {profile.goals!.map((g) => (
                  <Tag key={g} tone="yellow">
                    {g}
                  </Tag>
                ))}
              </div>
            )}
            <div
              style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}
            >
              {(profile.vibe?.length ?? 0) > 0 ? (
                <>
                  <span
                    className="label"
                    style={{ alignSelf: "center", marginRight: 4 }}
                  >
                    VIBE →
                  </span>
                  {profile.vibe!.map((v) => (
                    <Tag key={v} tone="outline">
                      {v}
                    </Tag>
                  ))}
                </>
              ) : (
                <Tag tone="outline">ADD YOUR VIBES</Tag>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/profile/edit">
              <Button variant="primary">Edit profile</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                Settings & privacy
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="v">
              {days}
              <span className="unit">days</span>
            </span>
            <span className="l">IN THE GAME</span>
          </div>
          <div className="profile-stat">
            <span className="v">{sessions.length}</span>
            <span className="l">SESSIONS LOGGED</span>
          </div>
          <div className="profile-stat">
            <span className="v">
              {tricksLanded}
              <span className="unit">/{totalTricks}</span>
            </span>
            <span className="l">TRICKS LANDED</span>
          </div>
          <div className="profile-stat">
            <span className="v">{streak}</span>
            <span className="l">SESSION STREAK</span>
          </div>
        </div>

        <div className="xp-hero">
          <div className="top">
            <div>
              <div className="label">LEVEL {level}</div>
              <div className="lvl">{totalXp} XP</div>
            </div>
            <div className="to-next">
              {xpToNext - xpIntoLevel} XP TO LEVEL {level + 1}
            </div>
          </div>
          <Bar value={xpPct} tall />
        </div>
      </div>

      {/* PROGRESS BY TIER */}
      <div className="sec-head">
        <h3>Progress by Tier</h3>
        <span className="label">
          {tricksLanded}/{totalTricks} TOTAL
        </span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {TIERS.map((t) => {
          const tierTricks = TRICKS.filter((x) => x.tier === t.number);
          const got = tierTricks.filter(
            (x) =>
              STATUS_RANK[getEffectiveStatus(x.id, trickProgress)] >=
              STATUS_RANK.landed_once
          ).length;
          const pct = tierTricks.length
            ? Math.round((got / tierTricks.length) * 100)
            : 0;
          return (
            <div key={t.number} className="card-dark" style={{ padding: "18px 22px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "baseline",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="mono"
                    style={{ fontSize: 11, color: "var(--paper-dim)" }}
                  >
                    TIER 0{t.number}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--hammer)",
                      fontSize: 22,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t.name.toUpperCase()}
                  </span>
                  <span
                    className="dim small"
                    style={{ maxWidth: "44ch", lineHeight: 1.4 }}
                  >
                    {t.description}
                  </span>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: pct === 100 ? "var(--mint)" : "var(--paper-dim)",
                  }}
                >
                  {got}/{tierTricks.length}
                </span>
              </div>
              <Bar value={pct} />
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                {tierTricks.map((tr) => {
                  const s = getEffectiveStatus(tr.id, trickProgress);
                  const tone =
                    STATUS_RANK[s] >= STATUS_RANK.landed_once
                      ? "mint"
                      : s === "practicing"
                      ? "coral"
                      : s === "locked"
                      ? "default"
                      : "outline";
                  return (
                    <Link key={tr.id} href={`/tricks/${tr.id}`}>
                      <Tag tone={tone}>{tr.name}</Tag>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* BADGES */}
      <div className="sec-head">
        <h3>Badges</h3>
        <span className="label">
          {BADGES.filter((b) => isBadgeEarned(b.tier, trickProgress)).length}/
          {BADGES.length} EARNED
        </span>
      </div>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const earned = isBadgeEarned(b.tier, trickProgress);
          return (
            <div
              key={b.id}
              className={`badge-card ${earned ? "earned" : ""}`}
              title={b.description}
            >
              <div className="disc">{b.icon}</div>
              <h6>{b.name.toUpperCase()}</h6>
              <p>TIER 0{b.tier}</p>
            </div>
          );
        })}
      </div>

      {/* RECENT SESSIONS */}
      <div className="sec-head">
        <h3>Recent Sessions</h3>
        <Link
          href="/sessions"
          className="label"
          style={{ color: "var(--hazard)" }}
        >
          VIEW ALL →
        </Link>
      </div>
      {sessions.length === 0 ? (
        <div className="card-dark" style={{ padding: 32, textAlign: "center" }}>
          <Eyebrow>NO SESSIONS</Eyebrow>
          <p
            style={{
              color: "var(--paper-dim)",
              margin: "10px 0 14px",
              fontSize: 14,
            }}
          >
            Log your first session and this section fills up.
          </p>
          <Link href="/sessions/new">
            <Button variant="primary">Log a session →</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sessions.slice(0, 6).map((s) => {
            const trickNames = s.tricksPracticed
              .slice(0, 3)
              .map((id) => getTrickById(id)?.name ?? id)
              .join(", ");
            const dateLabel = (() => {
              try {
                return format(new Date(s.date), "MMM d").toUpperCase();
              } catch {
                return s.date.slice(5, 10).toUpperCase();
              }
            })();
            return (
              <div key={s.id} className="card-dark session-row">
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
                    {s.duration}M · FELT {s.bodyFeel.toUpperCase()}
                  </div>
                </div>
                <Tag tone={s.bodyFeel === "injured" ? "coral" : "yellow"}>
                  {format(new Date(s.createdAt || s.date), "p")}
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
