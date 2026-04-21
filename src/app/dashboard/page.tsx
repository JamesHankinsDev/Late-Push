"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { getUserSessions } from "@/lib/sources/firestore";
import { Session, STATUS_RANK } from "@/lib/types";
import { TIERS, getTrickById } from "@/lib/curriculum";
import { getEarnedBadges, getNextBadge, BADGES } from "@/lib/badges";
import TrickTree from "@/components/tricks/TrickTree";
import CoachResponse from "@/components/sessions/CoachResponse";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";

export default function DashboardPage() {
  const { profile } = useAuthContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getUserSessions(profile.uid)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [profile]);

  const trickProgress = useMemo(() => profile?.trickProgress ?? {}, [profile]);

  const totalHours = useMemo(
    () => (sessions.reduce((acc, s) => acc + s.duration, 0) / 60).toFixed(1),
    [sessions]
  );

  const tricksLanded = useMemo(
    () =>
      Object.values(trickProgress).filter(
        (p) => STATUS_RANK[p.status] >= STATUS_RANK.landed_once
      ).length,
    [trickProgress]
  );

  const thisMonthSessions = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= monthStart && d <= monthEnd;
    });
  }, [sessions]);

  const thisMonthTricksLanded = useMemo(() => {
    return Object.values(trickProgress).filter((p) => {
      if (!p.firstLandedDate) return false;
      const d = new Date(p.firstLandedDate);
      return d >= startOfMonth(new Date()) && d <= endOfMonth(new Date());
    }).length;
  }, [trickProgress]);

  // Streak calculation
  const streak = useMemo(() => {
    if (sessions.length === 0) return 0;
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let count = 0;
    let currentDate = new Date();
    for (const s of sorted) {
      const sDate = new Date(s.date);
      const daysDiff = Math.floor(
        (currentDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= 7) {
        count++;
        currentDate = sDate;
      } else {
        break;
      }
    }
    return count;
  }, [sessions]);

  const bodyTrend = useMemo(() => {
    const recent = sessions.slice(0, 10);
    const soreCount = recent.filter((s) => s.bodyFeel === "sore").length;
    const injuredCount = recent.filter((s) => s.bodyFeel === "injured").length;
    if (injuredCount >= 2) return { label: "Take it easy", color: "text-skate-red", warning: true };
    if (soreCount >= 3) return { label: "Getting beat up", color: "text-skate-orange", warning: true };
    if (soreCount >= 1) return { label: "Normal wear", color: "text-skate-cyan", warning: false };
    return { label: "Feeling good", color: "text-skate-lime", warning: false };
  }, [sessions]);

  const earnedBadges = useMemo(
    () => getEarnedBadges(trickProgress),
    [trickProgress]
  );
  const nextBadge = useMemo(() => getNextBadge(trickProgress), [trickProgress]);

  const currentTierName =
    TIERS.find((t) => t.number === (profile?.currentTier ?? 0))?.name ??
    "Pre-Board";

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
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-concrete-800 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-concrete-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {profile?.displayName ? `Hey, ${profile.displayName.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-concrete-400 mt-1">
            Tier {profile?.currentTier ?? 0}: {currentTierName}
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="px-4 py-2 rounded-lg bg-skate-lime text-concrete-950 font-bold text-sm hover:bg-skate-lime/90 transition-colors"
        >
          + Log Session
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total Hours" value={totalHours} icon="⏱" />
        <StatCard label="Tricks Landed" value={tricksLanded.toString()} icon="🛹" />
        <StatCard
          label="Sessions Logged"
          value={`${streak}`}
          subtext={`recent week${streak !== 1 ? "s" : ""}`}
          icon="🔥"
        />
        <StatCard
          label="This Month"
          value={`${thisMonthTricksLanded} landed`}
          subtext={`${thisMonthSessions.length} sessions`}
          icon="📅"
        />
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-bold text-white mb-3">Badges</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {BADGES.map((badge) => {
            const earned = earnedBadges.some((b) => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`flex-shrink-0 w-24 p-3 rounded-lg border text-center ${
                  earned
                    ? "bg-skate-lime/10 border-skate-lime/40"
                    : "bg-concrete-900 border-concrete-700 opacity-50"
                }`}
                title={badge.description}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className="text-[10px] font-bold text-concrete-200 leading-tight">
                  {badge.name}
                </p>
                <p className="text-[9px] text-concrete-500 mt-0.5">
                  Tier {badge.tier}
                </p>
              </div>
            );
          })}
        </div>
        {nextBadge && (
          <p className="text-xs text-concrete-400 mt-2">
            Next up: <span className="text-skate-cyan font-medium">{nextBadge.badge.name}</span>{" "}
            — {nextBadge.tricksRemaining} trick{nextBadge.tricksRemaining !== 1 ? "s" : ""} left
          </p>
        )}
      </div>

      {sessions.length > 0 && (
        <div
          className={`mb-6 p-3 rounded-lg border ${
            bodyTrend.warning
              ? "bg-skate-red/10 border-skate-red/30"
              : "bg-concrete-900 border-concrete-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🦴</span>
            <span className="text-xs text-concrete-400">Body Status:</span>
            <span className={`text-sm font-bold ${bodyTrend.color}`}>
              {bodyTrend.label}
            </span>
          </div>
          {bodyTrend.warning && (
            <p className="text-xs text-concrete-400 mt-1 ml-6">
              You&apos;ve been reporting pain frequently. Consider a rest day or two — your body will thank you.
            </p>
          )}
        </div>
      )}

      {/* Trick tree */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-bold text-white mb-3">
          Progression Tree
        </h2>
        <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-4">
          <div className="flex flex-wrap justify-center gap-3 mb-3 text-[10px] text-concrete-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-skate-lime bg-skate-lime/40" />
              Mastered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-skate-lime bg-skate-lime/20" />
              Consistent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-skate-cyan bg-skate-cyan/20" />
              Landed Once
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-skate-orange bg-skate-orange/20" />
              Practicing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border-2 border-concrete-700 bg-concrete-900" />
              Locked
            </span>
          </div>
          <TrickTree trickProgress={trickProgress} />
          <Link
            href="/tricks"
            className="block text-center text-xs text-skate-cyan hover:text-skate-cyan/80 mt-3 transition-colors"
          >
            View full curriculum →
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-white">
            Monthly Summary
          </h2>
          {thisMonthSessions.length > 0 && !monthlySummary && (
            <button
              onClick={handleMonthlySummary}
              disabled={summaryLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-skate-purple/20 text-skate-purple hover:bg-skate-purple/30 transition-colors disabled:opacity-50"
            >
              {summaryLoading ? "Generating..." : "Generate Summary"}
            </button>
          )}
        </div>
        {monthlySummary ? (
          <CoachResponse response={monthlySummary} />
        ) : thisMonthSessions.length === 0 ? (
          <p className="text-sm text-concrete-500">
            No sessions this month yet. Get out there!
          </p>
        ) : (
          <p className="text-sm text-concrete-500">
            Click &quot;Generate Summary&quot; to get your AI coach&apos;s take on your month.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-white">
            Recent Sessions
          </h2>
          <Link
            href="/sessions"
            className="text-xs text-skate-cyan hover:text-skate-cyan/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        {sessions.length === 0 ? (
          <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-8 text-center">
            <p className="text-concrete-500 mb-3">
              Your session log is empty. Board&apos;s waiting.
            </p>
            <Link
              href="/sessions/new"
              className="inline-block px-4 py-2 rounded-lg bg-skate-lime text-concrete-950 font-bold text-sm"
            >
              Log Your First Session
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="bg-concrete-900 border border-concrete-700 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white font-medium">{s.date}</p>
                  <p className="text-xs text-concrete-400">
                    {s.duration}min &middot;{" "}
                    {s.tricksPracticed
                      .slice(0, 3)
                      .map((id) => getTrickById(id)?.name ?? id)
                      .join(", ")}
                    {s.tricksPracticed.length > 3 && ` +${s.tricksPracticed.length - 3}`}
                  </p>
                </div>
                <span className="text-sm">
                  {s.bodyFeel === "fine"
                    ? "🟢"
                    : s.bodyFeel === "sore"
                    ? "🟡"
                    : "🔴"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtext,
}: {
  label: string;
  value: string;
  icon: string;
  subtext?: string;
}) {
  return (
    <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] text-concrete-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="font-display text-xl font-bold text-white">{value}</p>
      {subtext && (
        <p className="text-[10px] text-concrete-500">{subtext}</p>
      )}
    </div>
  );
}
