import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Session } from "@/lib/types";
import { getTrickById } from "@/lib/curriculum";

export default function RecentActivityWidget({
  sessions,
}: {
  sessions: Session[];
}) {
  if (sessions.length === 0) {
    return (
      <div className="widget">
        <div className="widget-head">
          <span className="ttl">Recent activity</span>
          <Link
            href="/sessions/new"
            className="label"
            style={{ color: "var(--hazard)" }}
          >
            LOG SESSION →
          </Link>
        </div>
        <p
          className="dim"
          style={{ fontSize: 12, margin: 0, padding: "8px 0" }}
        >
          No sessions logged yet. The board&apos;s waiting.
        </p>
      </div>
    );
  }

  const latest = sessions.slice(0, 3);

  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">Recent activity</span>
        <Link
          href="/sessions"
          className="label"
          style={{ color: "var(--hazard)" }}
        >
          SEE ALL →
        </Link>
      </div>
      {latest.map((s) => {
        const trickNames = s.tricksPracticed
          .slice(0, 2)
          .map((id) => getTrickById(id)?.name ?? id)
          .join(", ");
        const when = tryRelative(s.date);
        return (
          <div key={s.id} className="ticker-item">
            <div
              className="ticker-avatar"
              style={{ background: "var(--hazard)" }}
            >
              ✦
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="who" style={{ fontSize: 13 }}>
                {s.duration}min session
              </div>
              <div className="what" style={{ fontSize: 12 }}>
                {trickNames || "No tricks logged"}
                {s.tricksPracticed.length > 2
                  ? ` +${s.tricksPracticed.length - 2}`
                  : ""}
              </div>
            </div>
            <span className="when">{when}</span>
          </div>
        );
      })}
    </div>
  );
}

function tryRelative(date: string): string {
  try {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      return formatDistanceToNowStrict(d, { addSuffix: true }).toUpperCase();
    }
    return format(d, "MMM d").toUpperCase();
  } catch {
    return "";
  }
}
