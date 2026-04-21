import { MOCK_SKATERS } from "@/lib/social/mock";
import { Button, Tag } from "@/components/ui/primitives";

export default function NearbyPreview() {
  const shown = MOCK_SKATERS.slice(0, 3);
  return (
    <div className="skaters-grid">
      {shown.map((s) => (
        <div key={s.id} className={`skater-card ${s.live ? "live" : ""}`}>
          {s.live && (
            <div className="live-banner">
              <span className="live-dot" /> LIVE · {s.spot}
            </div>
          )}
          <div className="head">
            <div className="avatar" style={{ background: s.color }}>
              {s.avatar}
            </div>
            <div className="name-line">
              <span className="nm">{s.name}</span>
              <span className="distance">
                {s.distance} AWAY · {s.match}% MATCH
              </span>
            </div>
          </div>
          <div className="working-on">
            Working on <b>{s.workingOn}</b>
          </div>
          <div className="tier-strip">
            <span className="lvl">TIER {s.tier}</span>
            {s.vibe.slice(0, 2).map((v) => (
              <Tag key={v} tone="outline">
                {v}
              </Tag>
            ))}
          </div>
          <div className="actions">
            <Button size="sm" variant="primary" disabled>
              Say hi
            </Button>
            <Button size="sm" variant="ghost" disabled>
              Profile
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
