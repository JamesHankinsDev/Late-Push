"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import { getTrickById } from "@/lib/curriculum";
import CoachResponse from "@/components/sessions/CoachResponse";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";
import { format } from "date-fns";

const BODY_FEEL_TONE = {
  fine: "mint",
  sore: "yellow",
  injured: "coral",
} as const;

const BODY_FEEL_LABEL = {
  fine: "FELT FINE",
  sore: "SORE",
  injured: "INJURED",
};

export default function SessionsPage() {
  const { sessions, sessionsLoading } = useAuthContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalHours = (
    sessions.reduce((acc, s) => acc + s.duration, 0) / 60
  ).toFixed(1);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>SESSION LOG</Eyebrow>
          <h1 className="hed hed-l" style={{ marginTop: 10 }}>
            Every push, in the books.
          </h1>
          <p className="dim" style={{ marginTop: 8 }}>
            {sessions.length} session{sessions.length === 1 ? "" : "s"} ·{" "}
            {totalHours} hour{totalHours === "1.0" ? "" : "s"} total
          </p>
        </div>
        <Link href="/sessions/new">
          <Button variant="primary">+ Log session</Button>
        </Link>
      </div>

      {sessionsLoading && sessions.length === 0 ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 88 }}
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 40, textAlign: "center" }}
        >
          <Eyebrow>EMPTY LOG</Eyebrow>
          <p
            style={{
              color: "var(--paper-dim)",
              margin: "12px 0 20px",
              fontSize: 14,
            }}
          >
            No sessions yet. Your first log takes 30 seconds — the coach writes
            back after.
          </p>
          <Link href="/sessions/new">
            <Button variant="primary">Log your first session →</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sessions.map((session) => {
            const isExpanded = expandedId === session.id;
            const trickNames = session.tricksPracticed
              .slice(0, 3)
              .map((id) => getTrickById(id)?.name ?? id)
              .join(", ");
            const more = session.tricksPracticed.length - 3;
            const dateLabel = (() => {
              try {
                return format(new Date(session.date), "MMM d").toUpperCase();
              } catch {
                return session.date.slice(5, 10).toUpperCase();
              }
            })();
            return (
              <div
                key={session.id}
                className="card-dark"
                style={{ padding: 0, overflow: "hidden" }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : session.id)
                  }
                  className="session-row"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: 0,
                    color: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      color: "var(--hazard)",
                      fontSize: 12,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {dateLabel}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--display)",
                        fontSize: 16,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {(trickNames || "SESSION").toUpperCase()}
                      {more > 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                            color: "var(--paper-dim)",
                          }}
                        >
                          +{more}
                        </span>
                      )}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--paper-dim)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {session.location
                        ? session.location.toUpperCase() + " · "
                        : ""}
                      {session.duration}M
                    </div>
                  </div>
                  <Tag tone={BODY_FEEL_TONE[session.bodyFeel]}>
                    {BODY_FEEL_LABEL[session.bodyFeel]}
                  </Tag>
                  <span style={{ color: "var(--paper-dim)" }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px dashed var(--ink-3)",
                      padding: "16px 20px",
                      display: "grid",
                      gap: 14,
                    }}
                  >
                    {session.whatClicked && (
                      <DetailRow label="Clicked" body={session.whatClicked} />
                    )}
                    {session.whatDidnt && (
                      <DetailRow
                        label="Didn't click"
                        body={session.whatDidnt}
                      />
                    )}
                    {session.injuryNotes && (
                      <DetailRow
                        label="Injury notes"
                        body={session.injuryNotes}
                        tone="coral"
                      />
                    )}
                    {session.surfaceQuality && (
                      <DetailRow
                        label="Surface"
                        body={session.surfaceQuality}
                      />
                    )}
                    {session.coachResponse && (
                      <CoachResponse response={session.coachResponse} />
                    )}
                    {!session.whatClicked &&
                      !session.whatDidnt &&
                      !session.injuryNotes &&
                      !session.coachResponse && (
                        <p className="dim small" style={{ margin: 0 }}>
                          No extra notes on this one.
                        </p>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone?: "coral";
}) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: tone === "coral" ? "var(--coral)" : "var(--paper-dim)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          color: "var(--paper-2)",
          lineHeight: 1.5,
        }}
      >
        {body}
      </p>
    </div>
  );
}
