import { MOCK_LIVE_NOW, MOCK_LEADERBOARD, MOCK_DMS } from "@/lib/social/mock";

export function LiveNowWidget() {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">
          <span className="live-dot" style={{ marginRight: 6 }} /> LIVE NOW
        </span>
        <span className="label">{MOCK_LIVE_NOW.length} SKATING</span>
      </div>
      <div className="live-rail">
        {MOCK_LIVE_NOW.map((s) => (
          <div key={s.id} className="live-skater">
            <div className="avatar" style={{ background: s.color }}>
              {s.avatar}
            </div>
            <div className="line">
              <span className="n">{s.name}</span>
              <span className="s">{s.spot}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardWidget() {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">WEEK XP · FRIENDS</span>
        <span className="label">RESETS SUN</span>
      </div>
      {MOCK_LEADERBOARD.map((l) => (
        <div
          key={l.r}
          className={`lb-item ${l.r <= 3 ? "top-3" : ""}`}
          style={{
            background: l.you ? "rgba(255,90,60,0.06)" : "transparent",
            margin: "0 -4px",
            padding: "8px 4px",
            borderRadius: 4,
          }}
        >
          <span className="lb-rank">{l.r}</span>
          <div className="lb-avatar" style={{ background: l.color }}>
            {l.avatar}
          </div>
          <span
            className="lb-name"
            style={{
              color: l.you ? "var(--coral)" : "var(--paper)",
              fontWeight: l.you ? 700 : 400,
            }}
          >
            {l.name}
            {l.you && " ← you"}
          </span>
          <span className="lb-xp">{l.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

export function DMsWidget() {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">DMs</span>
        <span className="label">
          {MOCK_DMS.filter((d) => d.unread).length} UNREAD
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_DMS.map((c) => (
          <div
            key={c.nm}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px dashed var(--ink-3)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: c.color,
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--display)",
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {c.avatar}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  color: c.unread ? "var(--paper)" : "var(--paper-dim)",
                  fontWeight: c.unread ? 600 : 400,
                }}
              >
                {c.nm}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--paper-dim)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.preview}
              </div>
            </div>
            {c.unread && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--coral)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
