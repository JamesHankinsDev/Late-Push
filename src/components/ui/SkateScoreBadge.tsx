"use client";

import { getSkateScoreLabel, getSkateScoreColor } from "@/lib/sources/weather";

export default function SkateScoreBadge({ score }: { score: number }) {
  const label = getSkateScoreLabel(score);
  const color = getSkateScoreColor(score);

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#44403c"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            className={color.replace("text-", "stroke-")}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
          {score}
        </span>
      </div>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
