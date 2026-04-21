"use client";

import Link from "next/link";
import { Button, Eyebrow } from "@/components/ui/primitives";

export default function SocialOff({
  hasAlias,
}: {
  hasAlias: boolean;
}) {
  return (
    <div>
      <div
        className="card-dark"
        style={{
          padding: 36,
          textAlign: "center",
          borderColor: "var(--hazard)",
          background: "rgba(245,212,0,0.04)",
        }}
      >
        <Eyebrow>SOCIAL · OFF</Eyebrow>
        <h2
          className="hed hed-m"
          style={{ marginTop: 14, marginBottom: 10 }}
        >
          Nothing about you is shared.
        </h2>
        <p
          className="dim"
          style={{
            fontSize: 14,
            maxWidth: "52ch",
            margin: "0 auto 22px",
            lineHeight: 1.6,
          }}
        >
          Social features are off by default. When you&apos;re ready, turn
          them on in settings. You&apos;ll pick an alias (we never share your
          real name or email), a home spot for Nearby matching, and choose
          who can reach you. Everything is opt-in. You can turn it off any
          time.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/settings/privacy">
            <Button variant="primary">
              {hasAlias ? "Turn on social →" : "Set up social →"}
            </Button>
          </Link>
          <Link href="/settings/privacy">
            <Button variant="ghost" size="sm">
              Review privacy settings
            </Button>
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <Principle
          title="Alias-only identity"
          body="Your Gmail name, email, and bio stay with you. Other skaters only ever see your alias."
        />
        <Principle
          title="5-mile Nearby radius"
          body="Matched from a spot you pick — never raw GPS. Others see distance rounded to a mile."
        />
        <Principle
          title="Moderation on by default"
          body="DMs are filtered for PII sharing, pressure tactics, and harassment. Friends unlock softer rules over time."
        />
        <Principle
          title="One-tap block + report"
          body="Blocking hides you from them across every surface. Reports go to a moderation queue."
        />
      </div>
    </div>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="card-dark" style={{ padding: 16 }}>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--hazard)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--paper-2)",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}
