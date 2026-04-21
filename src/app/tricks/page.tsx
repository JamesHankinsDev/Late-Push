"use client";

import { useMemo, useState, useCallback } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { TRICKS, TIERS, getEffectiveStatus } from "@/lib/curriculum";
import { STATUS_RANK, TrickStatus } from "@/lib/types";
import { Bar, Eyebrow } from "@/components/ui/primitives";
import WindingPath from "@/components/path/WindingPath";

type ActiveTier = number | "all";

export default function TricksPage() {
  const { profile } = useAuthContext();
  const [activeTier, setActiveTier] = useState<ActiveTier>(
    profile?.currentTier ?? 0
  );

  const trickProgress = useMemo(() => profile?.trickProgress ?? {}, [profile]);

  const getStatus = useCallback(
    (trickId: string): TrickStatus => getEffectiveStatus(trickId, trickProgress),
    [trickProgress]
  );

  const totalLanded = TRICKS.filter(
    (t) => STATUS_RANK[getStatus(t.id)] >= STATUS_RANK.landed_once
  ).length;
  const totalPct = Math.round((totalLanded / TRICKS.length) * 100);

  return (
    <div>
      <div className="path-header">
        <div>
          <Eyebrow>
            CURRICULUM · {TRICKS.length} TRICKS · {TIERS.length} TIERS
          </Eyebrow>
          <h2 className="hed hed-l" style={{ marginTop: 10 }}>
            The Path
          </h2>
          <p className="dim" style={{ maxWidth: "52ch", marginTop: 8 }}>
            Every trick has prerequisites. Skip them at your own risk — most
            adult skaters plateau because they rushed past the boring stuff.
            Take the path.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <span className="label">
            {totalLanded} / {TRICKS.length} LANDED
          </span>
          <Bar value={totalPct} tall />
        </div>
      </div>

      <div className="path-tiers">
        {TIERS.map((t) => {
          const count = TRICKS.filter((x) => x.tier === t.number).length;
          return (
            <button
              key={t.number}
              className={`tier-pill ${activeTier === t.number ? "active" : ""}`}
              onClick={() => setActiveTier(t.number)}
            >
              <span className="n">T{t.number}</span>
              {t.name.toUpperCase()}
              <span className="n">{count}</span>
            </button>
          );
        })}
        <button
          className={`tier-pill ${activeTier === "all" ? "active" : ""}`}
          onClick={() => setActiveTier("all")}
          style={{ marginLeft: "auto" }}
        >
          ALL TIERS
        </button>
      </div>

      <WindingPath activeTier={activeTier} getStatus={getStatus} />
    </div>
  );
}
