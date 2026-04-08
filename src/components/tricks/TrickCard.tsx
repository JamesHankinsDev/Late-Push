"use client";

import { Trick, TrickStatus } from "@/lib/types";

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

const statusBg = {
  locked: "bg-concrete-900 border-concrete-700",
  in_progress: "bg-concrete-850 border-skate-orange",
  landed: "bg-concrete-850 border-skate-lime",
};

export default function TrickCard({
  trick,
  status,
  unlockable,
  onStatusChange,
  onClick,
}: TrickCardProps) {
  const isLocked = status === "locked" && !unlockable;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={`relative border-2 rounded-lg p-4 transition-all ${
        statusBg[status] ?? statusBg.locked
      } ${
        isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:border-concrete-500 hover:scale-[1.02]"
      }`}
    >
      {/* Status indicator */}
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
      </div>

      {/* Quick status buttons */}
      {!isLocked && onStatusChange && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-concrete-700">
          {status !== "in_progress" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(trick.id, "in_progress");
              }}
              className="text-xs px-3 py-1 rounded bg-skate-orange/20 text-skate-orange hover:bg-skate-orange/30 transition-colors"
            >
              Start Learning
            </button>
          )}
          {status !== "landed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(trick.id, "landed");
              }}
              className="text-xs px-3 py-1 rounded bg-skate-lime/20 text-skate-lime hover:bg-skate-lime/30 transition-colors"
            >
              Mark Landed
            </button>
          )}
          {status !== "locked" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(trick.id, "locked");
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
  if (status === "landed") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-skate-lime/20 text-skate-lime font-medium">
        Landed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-skate-orange/20 text-skate-orange font-medium">
        Learning
      </span>
    );
  }
  if (unlockable) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-skate-cyan/20 text-skate-cyan font-medium">
        Ready
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-concrete-700 text-concrete-500 font-medium">
      Locked
    </span>
  );
}
