"use client";

import { TIERS, TRICKS } from "@/lib/curriculum";
import { Trick, TrickStatus } from "@/lib/types";
import PathNode from "./PathNode";

interface WindingPathProps {
  activeTier: number | "all";
  getStatus: (id: string) => TrickStatus;
}

export default function WindingPath({ activeTier, getStatus }: WindingPathProps) {
  const tricks: Trick[] =
    activeTier === "all"
      ? TRICKS
      : TRICKS.filter((t) => t.tier === activeTier);

  const groups = TIERS.map((tier) => ({
    n: tier.number,
    name: tier.name,
    items: tricks.filter((t) => t.tier === tier.number),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {groups.map((g) => (
        <div key={g.n}>
          <div className="tier-divider">
            <div className="rule" />
            <div className="stamp-lg">
              TIER 0{g.n} · {g.name.toUpperCase()}
            </div>
          </div>
          <div className="winding-path">
            <div className="path-spine" />
            {g.items.map((trick, i) => {
              const side = i % 2 === 0 ? "left" : "right";
              return (
                <div key={trick.id} className={`winding-row ${side}`}>
                  <div className="node-wrap">
                    <PathNode trick={trick} status={getStatus(trick.id)} />
                  </div>
                  <div className="node-wrap">
                    <PathNode trick={trick} status={getStatus(trick.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
