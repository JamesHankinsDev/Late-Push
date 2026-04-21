"use client";

import Link from "next/link";
import { Trick, TrickStatus } from "@/lib/types";
import { DifficultyMeter } from "@/components/ui/primitives";

const STATUS_CLASS: Record<TrickStatus, string> = {
  locked: "locked",
  not_started: "",
  practicing: "current",
  landed_once: "landed",
  consistent: "consistent",
  mastered: "mastered",
};

const STAMP: Partial<Record<TrickStatus, string>> = {
  practicing: "GRINDING",
  landed_once: "LANDED",
  consistent: "SOLID",
  mastered: "★ MASTERED",
};

const RISK_LABEL = { low: "LOW", medium: "MED", high: "HIGH" } as const;

export default function PathNode({
  trick,
  status,
}: {
  trick: Trick;
  status: TrickStatus;
}) {
  const statusCls = STATUS_CLASS[status] ?? "";
  const stamp = STAMP[status];
  const time = trick.estimatedAdultLearningTime ?? "—";
  const risk = RISK_LABEL[trick.injuryRisk] ?? "LOW";
  // Condense difficulty 1-10 to 7-tick meter for the card.
  const meter = Math.round((trick.difficulty / 10) * 7);

  return (
    <Link href={`/tricks/${trick.id}`} className={`node ${statusCls}`}>
      {stamp && <div className="stamp">{stamp}</div>}
      <div className="node-top">
        <span className="tier-n">
          T{trick.tier} · #{trick.id.slice(0, 4).toUpperCase()}
        </span>
        <DifficultyMeter value={meter} max={7} />
      </div>
      <div className="node-ttl">{trick.name}</div>
      <div className="node-meta">
        <span style={{ color: "var(--ink)", opacity: 0.6 }}>{time}</span>
        <span style={{ color: "var(--ink)", opacity: 0.6 }}>· {risk} RISK</span>
      </div>
    </Link>
  );
}
