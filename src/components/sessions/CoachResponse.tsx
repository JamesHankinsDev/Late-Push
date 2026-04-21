"use client";

import { Eyebrow } from "@/components/ui/primitives";

interface CoachResponseProps {
  response: string;
  loading?: boolean;
}

export default function CoachResponse({ response, loading }: CoachResponseProps) {
  if (!loading && !response) return null;

  return (
    <div
      className="card-dark"
      style={{
        padding: 20,
        borderColor: "var(--violet)",
        background: "rgba(179,140,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(179,140,255,0.2)",
            border: "1px solid var(--violet)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--hammer)",
            color: "var(--violet)",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          AI
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>YOUR SKATE COACH</Eyebrow>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "var(--paper-dim)",
              marginTop: 4,
            }}
          >
            POWERED BY CLAUDE
          </div>
        </div>
      </div>
      {loading ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[100, 85, 65, 95, 50].map((w, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 12,
                background: "var(--ink-3)",
                borderRadius: 6,
                width: `${w}%`,
              }}
            />
          ))}
        </div>
      ) : (
        <p
          style={{
            fontSize: 14,
            color: "var(--paper-2)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {response}
        </p>
      )}
    </div>
  );
}
