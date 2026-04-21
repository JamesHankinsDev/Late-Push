import { TIERS, TRICKS } from "@/lib/curriculum";
import { STATUS_RANK, TrickProgress, TrickStatus } from "@/lib/types";
import { getEffectiveStatus } from "@/lib/curriculum";
import { Bar, Tag } from "@/components/ui/primitives";

interface TierProgressCardsProps {
  trickProgress: Record<string, TrickProgress>;
  currentTier: number;
}

export default function TierProgressCards({
  trickProgress,
  currentTier,
}: TierProgressCardsProps) {
  const rows = TIERS.map((t) => {
    const tricks = TRICKS.filter((x) => x.tier === t.number);
    const landed = tricks.filter((x) => {
      const s: TrickStatus = getEffectiveStatus(x.id, trickProgress);
      return STATUS_RANK[s] >= STATUS_RANK.landed_once;
    }).length;
    return {
      number: t.number,
      name: t.name,
      landed,
      total: tricks.length,
      pct: tricks.length ? Math.round((landed / tricks.length) * 100) : 0,
    };
  });

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}
    >
      {rows.map((t) => {
        const isCurrent = t.number === currentTier;
        const isDone = t.pct === 100;
        return (
          <div
            key={t.number}
            className="card-dark"
            style={{
              padding: 18,
              borderColor: isCurrent ? "var(--hazard)" : "var(--ink-3)",
              background: isCurrent
                ? "rgba(245,212,0,0.06)"
                : "var(--ink-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color: isCurrent ? "var(--hazard)" : "var(--paper-dim)",
                }}
              >
                TIER 0{t.number}
              </span>
              {isDone && <Tag tone="mint">DONE</Tag>}
              {isCurrent && !isDone && <Tag tone="yellow">HERE</Tag>}
            </div>
            <div
              style={{
                fontFamily: "var(--hammer)",
                fontSize: 22,
                letterSpacing: "0.04em",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {t.name.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--paper-dim)",
                fontFamily: "var(--mono)",
                marginBottom: 14,
              }}
            >
              {t.landed}/{t.total} LANDED
            </div>
            <Bar value={t.pct} />
          </div>
        );
      })}
    </div>
  );
}
