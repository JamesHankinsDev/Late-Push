"use client";

import { getSkateScoreLabel, getSkateScoreColor } from "@/lib/sources/weather";

export default function SkateScoreBadge({ score }: { score: number }) {
  const label = getSkateScoreLabel(score);
  const color = getSkateScoreColor(score);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 44, height: 44 }}>
        <svg
          width={44}
          height={44}
          viewBox="0 0 36 36"
          style={{ transform: "rotate(-90deg)" }}
        >
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--ink-3)"
            strokeWidth={3}
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <span
          className="mono"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color,
          }}
        >
          {score}
        </span>
      </div>
      <span
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color,
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </div>
  );
}
