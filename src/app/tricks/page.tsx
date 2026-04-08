"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { TRICKS, STAGES, isTrickUnlockable } from "@/lib/curriculum";
import { TrickStatus, TrickProgress } from "@/lib/types";
import TrickCard from "@/components/tricks/TrickCard";
import TrickDetail from "@/components/tricks/TrickDetail";
import { updateTrickProgress } from "@/lib/sources/firestore";

export default function TricksPage() {
  const { profile, refreshProfile } = useAuthContext();
  const [selectedTrickId, setSelectedTrickId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState(1);

  const trickProgress = useMemo(() => profile?.trickProgress ?? {}, [profile]);

  const getStatus = (trickId: string): TrickStatus => {
    return trickProgress[trickId]?.status ?? "locked";
  };

  const handleStatusChange = useCallback(
    async (trickId: string, status: TrickStatus) => {
      if (!profile) return;

      const progress: TrickProgress = {
        trickId,
        status,
        attempts: (trickProgress[trickId]?.attempts ?? 0) + (status === "landed" ? 1 : 0),
        notes: trickProgress[trickId]?.notes ?? "",
        ...(status === "landed" ? { landedDate: new Date().toISOString() } : {}),
      };

      await updateTrickProgress(profile.uid, trickId, progress);
      await refreshProfile();
    },
    [profile, trickProgress, refreshProfile]
  );

  const stageTricks = TRICKS.filter((t) => t.stage === activeStage);
  const selectedTrick = selectedTrickId
    ? TRICKS.find((t) => t.id === selectedTrickId)
    : null;

  // Stats
  const totalLanded = Object.values(trickProgress).filter(
    (p) => p.status === "landed"
  ).length;
  const totalInProgress = Object.values(trickProgress).filter(
    (p) => p.status === "in_progress"
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Trick Curriculum
        </h1>
        <p className="text-sm text-concrete-400 mt-1">
          {totalLanded} landed &middot; {totalInProgress} in progress &middot;{" "}
          {TRICKS.length} total tricks
        </p>
      </div>

      {/* Stage tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {STAGES.map((stage) => {
          const stTricks = TRICKS.filter((t) => t.stage === stage.number);
          const stLanded = stTricks.filter(
            (t) => getStatus(t.id) === "landed"
          ).length;
          return (
            <button
              key={stage.number}
              onClick={() => setActiveStage(stage.number)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeStage === stage.number
                  ? "bg-skate-lime text-concrete-950 font-bold"
                  : "bg-concrete-800 text-concrete-300 hover:bg-concrete-700"
              }`}
            >
              Stage {stage.number}
              <span className="ml-1 opacity-70">
                ({stLanded}/{stTricks.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage description */}
      <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-4 mb-6">
        <h2 className="font-display font-bold text-white">
          Stage {activeStage}: {STAGES[activeStage - 1]?.name}
        </h2>
        <p className="text-sm text-concrete-400 mt-1">
          {STAGES[activeStage - 1]?.description}
        </p>
      </div>

      {/* Trick grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stageTricks.map((trick) => (
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

      {/* Detail modal */}
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
