"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { TRICKS, TIERS, isTrickUnlockable, getEffectiveStatus } from "@/lib/curriculum";
import { TrickStatus, TrickProgress, STATUS_RANK } from "@/lib/types";
import TrickCard from "@/components/tricks/TrickCard";
import TrickDetail from "@/components/tricks/TrickDetail";
import { updateTrickProgress } from "@/lib/sources/firestore";
import { getBadgeProgress, BADGES } from "@/lib/badges";

export default function TricksPage() {
  const { profile, refreshProfile } = useAuthContext();
  const [selectedTrickId, setSelectedTrickId] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState(0);

  const trickProgress = useMemo(() => profile?.trickProgress ?? {}, [profile]);

  const getStatus = useCallback(
    (trickId: string): TrickStatus => getEffectiveStatus(trickId, trickProgress),
    [trickProgress]
  );

  const handleStatusChange = useCallback(
    async (trickId: string, status: TrickStatus) => {
      if (!profile) return;
      const existing = trickProgress[trickId];
      const now = new Date().toISOString();
      const progress: TrickProgress = {
        trickId,
        status,
        attempts: (existing?.attempts ?? 0) + (status === "landed_once" ? 1 : 0),
        notes: existing?.notes ?? "",
        firstLandedDate:
          status === "landed_once" && !existing?.firstLandedDate
            ? now
            : existing?.firstLandedDate,
        consistentDate:
          status === "consistent" && !existing?.consistentDate
            ? now
            : existing?.consistentDate,
        masteredDate:
          status === "mastered" && !existing?.masteredDate ? now : existing?.masteredDate,
      };
      await updateTrickProgress(profile.uid, trickId, progress);
      await refreshProfile();
    },
    [profile, trickProgress, refreshProfile]
  );

  const tierTricks = TRICKS.filter((t) => t.tier === activeTier);
  const selectedTrick = selectedTrickId
    ? TRICKS.find((t) => t.id === selectedTrickId)
    : null;

  const totalLanded = Object.values(trickProgress).filter(
    (p) => STATUS_RANK[p.status] >= STATUS_RANK.landed_once
  ).length;
  const totalPracticing = Object.values(trickProgress).filter(
    (p) => p.status === "practicing"
  ).length;

  const activeTierBadge = BADGES.find((b) => b.tier === activeTier);
  const activeTierBadgeProgress = activeTierBadge
    ? getBadgeProgress(activeTier, trickProgress)
    : null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Trick Curriculum
        </h1>
        <p className="text-sm text-concrete-400 mt-1">
          {totalLanded} landed &middot; {totalPracticing} practicing &middot;{" "}
          {TRICKS.length} total tricks
        </p>
      </div>

      {/* Tier tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {TIERS.map((tier) => {
          const stTricks = TRICKS.filter((t) => t.tier === tier.number);
          const stLanded = stTricks.filter(
            (t) => STATUS_RANK[getStatus(t.id)] >= STATUS_RANK.landed_once
          ).length;
          return (
            <button
              key={tier.number}
              onClick={() => setActiveTier(tier.number)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTier === tier.number
                  ? "bg-skate-lime text-concrete-950 font-bold"
                  : "bg-concrete-800 text-concrete-300 hover:bg-concrete-700"
              }`}
            >
              Tier {tier.number}
              <span className="ml-1 opacity-70">
                ({stLanded}/{stTricks.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Tier description + badge */}
      <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="font-display font-bold text-white">
              Tier {activeTier}: {TIERS.find((t) => t.number === activeTier)?.name}
            </h2>
            <p className="text-sm text-concrete-400 mt-1">
              {TIERS.find((t) => t.number === activeTier)?.description}
            </p>
          </div>
          {activeTierBadge && activeTierBadgeProgress && (
            <div className="flex flex-col items-center text-center min-w-[80px]">
              <div className="text-2xl mb-1">{activeTierBadge.icon}</div>
              <p className="text-[10px] font-bold text-concrete-300 leading-tight">
                {activeTierBadge.name}
              </p>
              <p className="text-[10px] text-concrete-500 mt-0.5">
                {activeTierBadgeProgress.earned}/{activeTierBadgeProgress.total}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tierTricks.map((trick) => (
          <TrickCard
            key={trick.id}
            trick={trick}
            status={getStatus(trick.id)}
            unlockable={isTrickUnlockable(trick.id, trickProgress)}
            onStatusChange={handleStatusChange}
            onClick={() => setSelectedTrickId(trick.id)}
          />
        ))}
      </div>

      {selectedTrick && (
        <TrickDetail
          trick={selectedTrick}
          status={getStatus(selectedTrick.id)}
          onClose={() => setSelectedTrickId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
