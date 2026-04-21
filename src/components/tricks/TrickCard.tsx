"use client";

import { Trick, TrickStatus, STATUS_RANK, STATUS_LABELS } from "@/lib/types";

interface TrickCardProps {
  trick: Trick;
  status: TrickStatus;
  unlockable: boolean;
  onStatusChange?: (trickId: string, status: TrickStatus) => void;
  onClick?: () => void;
}

const riskColors = {
  low: "text-skate-lime",
  medium: "text-skate-orange",
  high: "text-skate-red",
};

const statusBg: Record<TrickStatus, string> = {
  locked: "bg-concrete-900 border-concrete-700",
  not_started: "bg-concrete-900 border-concrete-700",
  practicing: "bg-concrete-800/70 border-skate-orange/60",
  landed_once: "bg-concrete-800/70 border-skate-cyan/60",
  consistent: "bg-concrete-800/70 border-skate-lime/60",
  mastered: "bg-concrete-800/70 border-skate-lime",
};

function getNextAction(
  status: TrickStatus
): { label: string; nextStatus: TrickStatus } | null {
  switch (status) {
    case "not_started":
      return { label: "Start Practicing", nextStatus: "practicing" };
    case "practicing":
      return { label: "Landed Once!", nextStatus: "landed_once" };
    case "landed_once":
      return { label: "It's Consistent", nextStatus: "consistent" };
    case "consistent":
      return { label: "Mastered", nextStatus: "mastered" };
    default:
      return null;
  }
}

export default function TrickCard({
  trick,
  status,
  unlockable,
  onStatusChange,
  onClick,
}: TrickCardProps) {
  const isLocked = status === "locked" && !unlockable;
  const nextAction = getNextAction(status);

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={`relative border-2 rounded-lg p-4 transition-all ${
        statusBg[status] ?? statusBg.locked
      } ${
        isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:border-concrete-500 hover:scale-[1.01]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-bold text-base text-white">
          {trick.name}
        </h3>
        <StatusBadge status={status} unlockable={unlockable} />
      </div>

      <p className="text-xs text-concrete-300 mb-3 line-clamp-2">
        {trick.description}
      </p>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-concrete-400">
          Difficulty:{" "}
          <span className="text-white font-mono">{trick.difficulty}/10</span>
        </span>
        <span className="text-concrete-400">
          Risk:{" "}
          <span className={riskColors[trick.injuryRisk]}>
            {trick.injuryRisk}
          </span>
        </span>
        {trick.estimatedAdultLearningTime && (
          <span className="text-concrete-400 hidden sm:inline">
            ⏱{" "}
            <span className="text-concrete-200">
              {trick.estimatedAdultLearningTime}
            </span>
          </span>
        )}
      </div>

      {!isLocked && onStatusChange && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-concrete-700">
          {nextAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(trick.id, nextAction.nextStatus);
              }}
              className="text-xs px-3 py-1 rounded bg-skate-lime/20 text-skate-lime hover:bg-skate-lime/30 transition-colors font-medium"
            >
              {nextAction.label}
            </button>
          )}
          {STATUS_RANK[status] > STATUS_RANK.not_started && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(trick.id, "not_started");
              }}
              className="text-xs px-3 py-1 rounded bg-concrete-700 text-concrete-400 hover:bg-concrete-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  unlockable,
}: {
  status: TrickStatus;
  unlockable: boolean;
}) {
  const styles: Record<TrickStatus, string> = {
    locked: "bg-concrete-700 text-concrete-500",
    not_started: "bg-concrete-700 text-concrete-300",
    practicing: "bg-skate-orange/20 text-skate-orange",
    landed_once: "bg-skate-cyan/20 text-skate-cyan",
    consistent: "bg-skate-lime/20 text-skate-lime",
    mastered: "bg-skate-lime/30 text-skate-lime border border-skate-lime",
  };

  if (status === "locked" && unlockable) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-skate-cyan/20 text-skate-cyan font-medium">
        Ready
      </span>
    );
  }

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
