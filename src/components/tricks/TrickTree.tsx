"use client";

import { useMemo } from "react";
import { Trick, TrickStatus, TrickProgress, STATUS_RANK } from "@/lib/types";
import { TRICKS, isTrickUnlockable } from "@/lib/curriculum";

interface TrickTreeProps {
  trickProgress: Record<string, TrickProgress>;
  onTrickClick?: (trickId: string) => void;
}

export default function TrickTree({ trickProgress, onTrickClick }: TrickTreeProps) {
  const tiers = useMemo(() => {
    const grouped = new Map<number, Trick[]>();
    for (const trick of TRICKS) {
      const list = grouped.get(trick.tier) ?? [];
      list.push(trick);
      grouped.set(trick.tier, list);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, []);

  const getStatus = (trickId: string): TrickStatus => {
    return trickProgress[trickId]?.status ?? "not_started";
  };

  return (
    <div className="space-y-1">
      {tiers.map(([tierNum, tricks]) => (
        <div key={tierNum} className="relative">
          {tierNum > 0 && (
            <div className="absolute left-1/2 -top-1 w-0.5 h-1 bg-concrete-700" />
          )}

          <div className="flex flex-wrap justify-center gap-2 py-2">
            {tricks.map((trick) => {
              const status = getStatus(trick.id);
              const unlockable = isTrickUnlockable(trick.id, trickProgress);
              const rank = STATUS_RANK[status];
              const isLocked = !unlockable && rank <= STATUS_RANK.not_started;

              const className = (() => {
                if (status === "mastered") {
                  return "border-skate-lime bg-skate-lime/40 text-white";
                }
                if (status === "consistent") {
                  return "border-skate-lime bg-skate-lime/20 text-skate-lime";
                }
                if (status === "landed_once") {
                  return "border-skate-cyan bg-skate-cyan/20 text-skate-cyan";
                }
                if (status === "practicing") {
                  return "border-skate-orange bg-skate-orange/20 text-skate-orange";
                }
                if (unlockable) {
                  return "border-concrete-500 bg-concrete-800 text-concrete-200 cursor-pointer hover:scale-110";
                }
                return "border-concrete-700 bg-concrete-900 text-concrete-600 cursor-not-allowed";
              })();

              return (
                <button
                  key={trick.id}
                  onClick={() => !isLocked && onTrickClick?.(trick.id)}
                  className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${className}`}
                  title={`${trick.name} — ${status.replace("_", " ")}`}
                >
                  {status === "mastered" || status === "consistent" ? (
                    "✓"
                  ) : status === "landed_once" ? (
                    "1"
                  ) : status === "practicing" ? (
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
