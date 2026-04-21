"use client";

import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";
import { mergePrivacy } from "@/lib/social/privacy";

export default function SettingsHub() {
  const { profile } = useAuthContext();
  const privacy = mergePrivacy(profile?.privacy);
  const alias = profile?.alias;
  const homeSpot = profile?.homeSpotName;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>SETTINGS</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Your controls.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          Privacy, identity, and who can reach you. Everything is off by
          default — social features only turn on when you say so.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <Link href="/settings/privacy">
          <SettingsRow
            label="Privacy & social"
            right={
              privacy.socialEnabled ? (
                <Tag tone="mint">ON</Tag>
              ) : (
                <Tag tone="outline">OFF</Tag>
              )
            }
            sub={
              privacy.socialEnabled
                ? `Alias: ${alias ?? "none"} · ${
                    homeSpot ? `home: ${homeSpot}` : "no home spot"
                  }`
                : "Turn on social and set your alias"
            }
          />
        </Link>

        <Link href="/settings/blocks">
          <SettingsRow
            label="Blocked users"
            right={<Tag tone="outline">MANAGE</Tag>}
            sub="People you've blocked stay hidden from every discovery surface."
          />
        </Link>

        <Link href="/profile/edit">
          <SettingsRow
            label="Profile details"
            right={<Tag tone="outline">EDIT</Tag>}
            sub="Stance, bio, goals, vibe (these stay private to you and your coach)."
          />
        </Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <Link href="/profile">
          <Button variant="ghost">← Back to profile</Button>
        </Link>
      </div>
    </div>
  );
}

function SettingsRow({
  label,
  sub,
  right,
}: {
  label: string;
  sub: string;
  right: React.ReactNode;
}) {
  return (
    <div
      className="card-dark"
      style={{
        padding: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 18,
            letterSpacing: "0.04em",
            color: "var(--paper)",
            marginBottom: 4,
          }}
        >
          {label.toUpperCase()}
        </div>
        <div className="dim" style={{ fontSize: 13 }}>
          {sub}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {right}
        <span style={{ color: "var(--paper-dim)" }}>→</span>
      </div>
    </div>
  );
}
