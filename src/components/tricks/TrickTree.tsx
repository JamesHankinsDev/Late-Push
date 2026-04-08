"use client";

import { useMemo } from "react";
import { Trick, TrickStatus, TrickProgress } from "@/lib/types";
import { TRICKS, isTrickUnlockable } from "@/lib/curriculum";

interface TrickTreeProps {
  trickProgress: Record<string, TrickProgress>;
  onTrickClick?: (trickId: string) => void;
}

export default function TrickTree({ trickProgress, onTrickClick }: TrickTreeProps) {
  const stages = useMemo(() => {
    const grouped = new Map<number, Trick[]>();
    for (const trick of TRICKS) {
      const list = grouped.get(trick.stage) ?? [];
      list.push(trick);
      grouped.set(trick.stage, list);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, []);

  const getStatus = (trickId: string): TrickStatus => {
    return trickProgress[trickId]?.status ?? "locked";
  };

  return (
    <div className="space-y-1">
      {stages.map(([stageNum, tricks]) => (
        <div key={stageNum} className="relative">
          {/* Stage connector line */}
          {stageNum > 1 && (
            <div className="absolute left-1/2 -top-1 w-0.5 h-1 bg-concrete-700" />
          )}

          <div className="flex flex-wrap justify-center gap-2 py-2">
            {tricks.map((trick) => {
              const status = getStatus(trick.id);
              const unlockable = isTrickUnlockable(trick.id, trickProgress);
              const isActive = status !== "locked" || unlockable;

              return (
                <button
                  key={trick.id}
                  onClick={() => isActive && onTrickClick?.(trick.id)}
                  className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${
                    status === "landed"
                      ? "border-skate-lime bg-skate-lime/20 text-skate-lime"
                      : status === "in_progress"
                      ? "border-skate-orange bg-skate-orange/20 text-skate-orange"
                      : unlockable
                      ? "border-skate-cyan bg-skate-cyan/10 text-skate-cyan cursor-pointer hover:scale-110"
                      : "border-concrete-700 bg-concrete-900 text-concrete-600 cursor-not-allowed"
                  }`}
                  title={trick.name}
                >
                  {status === "landed" ? (
                    "✓"
                  ) : status === "in_progress" ? (
                    <span className="w-3 h-3 bg-skate-orange rounded-full animate-pulse" />
                  ) : (
                    trick.difficulty
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
