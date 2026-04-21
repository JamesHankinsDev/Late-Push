import { BodyTrend } from "@/lib/stats";

const TONE_COLOR: Record<BodyTrend["tone"], string> = {
  mint: "var(--mint)",
  hazard: "var(--hazard)",
  coral: "var(--coral)",
  brick: "var(--brick)",
};

export default function BodyStatusWidget({ trend }: { trend: BodyTrend }) {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">Body Status</span>
        <span className="label">LAST 10 SESSIONS</span>
      </div>
      <div className="weather-row">
        <div
          className="weather-score"
          style={{ color: TONE_COLOR[trend.tone] }}
        >
          {trend.tone === "mint"
            ? "✓"
            : trend.tone === "hazard"
            ? "•"
            : trend.tone === "coral"
            ? "!"
            : "⚠"}
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 16,
              letterSpacing: "0.04em",
              color: "var(--paper)",
              textTransform: "uppercase",
            }}
          >
            {trend.label}
          </div>
          {trend.note && (
            <div
              style={{
                fontSize: 12,
                color: "var(--paper-2)",
                marginTop: 6,
                maxWidth: "26ch",
              }}
            >
              {trend.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
