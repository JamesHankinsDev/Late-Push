"use client";

import Link from "next/link";
import { Trick } from "@/lib/types";
import { Button } from "@/components/ui/primitives";
import { format } from "date-fns";

interface MissionCardProps {
  trick?: Trick;
  sessionNumber: number;
  drillEstimate?: string;
}

export default function MissionCard({
  trick,
  sessionNumber,
  drillEstimate,
}: MissionCardProps) {
  const today = new Date();
  const dateLabel = format(today, "MMM d · EEE").toUpperCase();

  if (!trick) {
    return (
      <div className="mission">
        <div className="mission-head">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="eyebrow">TODAY&apos;S MISSION</span>
            <span className="label">NOTHING QUEUED</span>
          </div>
          <span className="mono" style={{ color: "var(--hazard)", fontSize: 11 }}>
            {dateLabel}
          </span>
        </div>
        <div className="mission-body">
          <div>
            <h3 className="hed hed-m" style={{ marginBottom: 8 }}>
              You&apos;re between missions.
            </h3>
            <p
              style={{
                color: "var(--paper-2)",
                fontSize: 14,
                margin: "0 0 14px",
                maxWidth: "46ch",
              }}
            >
              Every unlocked trick is landed or locked. Head to the Path to pick
              what&apos;s next — or level up your current tier by nailing the
              unmastered ones.
            </p>
            <Link href="/tricks">
              <Button variant="primary">See the path →</Button>
            </Link>
          </div>
          <div className="mission-illus">
            <span className="glyph">NEXT</span>
          </div>
        </div>
      </div>
    );
  }

  const glyph = trick.name
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(" ")[0]
    .toUpperCase();

  return (
    <div className="mission">
      <div className="mission-head">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="eyebrow">TODAY&apos;S MISSION</span>
          <span className="label">
            SESSION #{sessionNumber}
            {drillEstimate ? ` · ${drillEstimate.toUpperCase()}` : ""}
          </span>
        </div>
        <span className="mono" style={{ color: "var(--hazard)", fontSize: 11 }}>
          {dateLabel}
        </span>
      </div>
      <div className="mission-body">
        <div>
          <h3 className="hed hed-m" style={{ marginBottom: 8 }}>
            {trick.name}
          </h3>
          <p
            style={{
              color: "var(--paper-2)",
              fontSize: 14,
              margin: "0 0 14px",
              maxWidth: "46ch",
            }}
          >
            {trick.description.split(".").slice(0, 2).join(".").trim() + "."}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href={`/tricks/${trick.id}`}>
              <Button variant="primary">Start session →</Button>
            </Link>
            <Link href="/tricks">
              <Button variant="ghost" size="sm">
                See the path
              </Button>
            </Link>
          </div>
        </div>
        <div className="mission-illus">
          <span className="glyph">{glyph}</span>
        </div>
      </div>
    </div>
  );
}
