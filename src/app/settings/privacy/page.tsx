"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { updateUserProfile } from "@/lib/sources/firestore";
import { mergePrivacy } from "@/lib/social/privacy";
import { PrivacySettings } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

type PrivacyKey = keyof PrivacySettings;

export default function PrivacySettingsPage() {
  const { profile, refreshProfile } = useAuthContext();
  const [saving, setSaving] = useState<PrivacyKey | null>(null);
  const [error, setError] = useState("");

  const privacy = useMemo(() => mergePrivacy(profile?.privacy), [profile]);
  const hasAlias = Boolean(profile?.alias);
  const hasHomeSpot = Boolean(profile?.homeSpotId);

  async function toggle(key: PrivacyKey, value: PrivacySettings[PrivacyKey]) {
    if (!profile || saving) return;
    setError("");
    setSaving(key);
    try {
      await updateUserProfile(profile.uid, {
        privacy: { ...privacy, [key]: value },
      });
      await refreshProfile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't update that setting."
      );
    } finally {
      setSaving(null);
    }
  }

  async function toggleSocial() {
    if (!hasAlias) {
      // Redirect to alias flow — master switch requires an alias.
      return;
    }
    await toggle("socialEnabled", !privacy.socialEnabled);
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>PRIVACY & SOCIAL</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Choose what you share.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          You appear nowhere until you turn social on. Your real name and
          email are never visible to anyone else — only your alias, tier, and
          the tricks you&apos;re working on.
        </p>
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 18,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      {/* Identity prerequisites */}
      <div className="sec-head">
        <h3>Identity</h3>
        <span className="label">ALIAS · HOME SPOT</span>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <Link href="/settings/privacy/alias">
          <InfoRow
            label="Alias"
            value={profile?.alias ?? "Not set"}
            tone={hasAlias ? "mint" : "coral"}
            sub={
              hasAlias
                ? "Your only public identifier. Other users never see your real name or email."
                : "Required before you can turn on social. Pick something that doesn't reveal who you are."
            }
            action={hasAlias ? "Change" : "Set alias →"}
          />
        </Link>
        <Link href="/settings/privacy/home-spot">
          <InfoRow
            label="Home spot"
            value={profile?.homeSpotName ?? "Not set"}
            tone={hasHomeSpot ? "mint" : "outline"}
            sub={
              hasHomeSpot
                ? `Nearby matching uses this as your anchor (${privacy.shareHomeSpot ? "sharing" : "not sharing"}).`
                : "Pick a park as your home base. Nearby will match skaters within 5 miles of it."
            }
            action={hasHomeSpot ? "Change" : "Set home spot →"}
          />
        </Link>
      </div>

      {/* Master social toggle */}
      <div className="sec-head">
        <h3>Social</h3>
        <span className="label">MASTER SWITCH</span>
      </div>

      <div
        className="card-dark"
        style={{
          padding: 18,
          marginBottom: 12,
          borderColor: privacy.socialEnabled ? "var(--mint)" : "var(--ink-3)",
          background: privacy.socialEnabled
            ? "rgba(120,209,154,0.05)"
            : undefined,
        }}
      >
        <Toggle
          label="Social features"
          sub={
            privacy.socialEnabled
              ? "You're visible to other users in the ways you've enabled below."
              : hasAlias
              ? "Off. Nothing about you is visible to other users."
              : "Set an alias first — social can't be turned on without one."
          }
          checked={privacy.socialEnabled}
          disabled={!hasAlias || saving === "socialEnabled"}
          onChange={toggleSocial}
        />
        {!hasAlias && (
          <div style={{ marginTop: 12 }}>
            <Link href="/settings/privacy/alias">
              <Button variant="primary" size="sm">
                Set your alias →
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Per-feature toggles (only meaningful when socialEnabled) */}
      <div style={{ opacity: privacy.socialEnabled ? 1 : 0.4, pointerEvents: privacy.socialEnabled ? "auto" : "none" }}>
        <div className="sec-head">
          <h3>Discovery</h3>
          <span className="label">WHERE YOU SHOW UP</span>
        </div>

        <div className="card-dark" style={{ padding: 18, display: "grid", gap: 14 }}>
          <Toggle
            label="Discoverable in Nearby"
            sub={
              hasHomeSpot
                ? "Other skaters within 5 miles of your home spot can see your alias, tier, and what you're working on."
                : "Set a home spot first — Nearby matches on proximity."
            }
            checked={privacy.discoverableInNearby && hasHomeSpot}
            disabled={!hasHomeSpot || saving === "discoverableInNearby"}
            onChange={(v) => toggle("discoverableInNearby", v)}
          />
          <Toggle
            label="Share home spot in profile"
            sub="When on, your home spot's name is shown alongside your alias — the location, not the precise address."
            checked={privacy.shareHomeSpot}
            disabled={!hasHomeSpot || saving === "shareHomeSpot"}
            onChange={(v) => toggle("shareHomeSpot", v)}
          />
          <Toggle
            label="Appear on weekly leaderboard"
            sub="Your alias and XP rank among users you follow."
            checked={privacy.discoverableInLeaderboard}
            disabled={saving === "discoverableInLeaderboard"}
            onChange={(v) => toggle("discoverableInLeaderboard", v)}
          />
          <Toggle
            label="Findable by alias search"
            sub="Other users can find you by typing @your_alias."
            checked={privacy.profileLookupByHandle}
            disabled={saving === "profileLookupByHandle"}
            onChange={(v) => toggle("profileLookupByHandle", v)}
          />
        </div>

        <div className="sec-head">
          <h3>Contact</h3>
          <span className="label">WHO CAN REACH YOU</span>
        </div>

        <div className="card-dark" style={{ padding: 18, display: "grid", gap: 18 }}>
          <GroupPicker
            label="DMs from"
            value={privacy.dmsFrom}
            onChange={(v) => toggle("dmsFrom", v)}
            sub="Everyone gets message moderation for PII, coercion, and harassment regardless of this setting."
          />
          <GroupPicker
            label="Friend requests from"
            value={privacy.friendRequestsFrom as "none" | "friends" | "everyone"}
            onChange={(v) => toggle("friendRequestsFrom", v)}
            sub="Control who can send you friend requests."
            extra="tier-matches"
          />
          <GroupPicker
            label="Crew invites from"
            value={privacy.crewInvitesFrom}
            onChange={(v) => toggle("crewInvitesFrom", v)}
            sub="Only friends by default — changes once you've found your scene."
          />
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Link href="/settings">
          <Button variant="ghost">← Settings</Button>
        </Link>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  sub,
  tone,
  action,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "mint" | "coral" | "outline";
  action: string;
}) {
  return (
    <div
      className="card-dark"
      style={{
        padding: 16,
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
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper-dim)",
            }}
          >
            {label}
          </span>
          <Tag tone={tone}>{value}</Tag>
        </div>
        <div className="dim" style={{ fontSize: 12 }}>
          {sub}
        </div>
      </div>
      <span className="label" style={{ color: "var(--hazard)", whiteSpace: "nowrap" }}>
        {action}
      </span>
    </div>
  );
}

function Toggle({
  label,
  sub,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !checked ? 0.6 : 1,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 16,
            letterSpacing: "0.04em",
            color: "var(--paper)",
            marginBottom: 4,
          }}
        >
          {label.toUpperCase()}
        </div>
        <div className="dim" style={{ fontSize: 12 }}>
          {sub}
        </div>
      </div>
      <SwitchControl checked={checked} disabled={disabled} onChange={onChange} />
    </label>
  );
}

function SwitchControl({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 48,
        height: 26,
        borderRadius: 999,
        border: `2px solid ${checked ? "var(--hazard)" : "var(--ink-3)"}`,
        background: checked ? "var(--hazard)" : "var(--ink)",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 24 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: checked ? "var(--ink)" : "var(--paper-dim)",
          transition: "all 0.15s",
        }}
      />
    </button>
  );
}

function GroupPicker<T extends string>({
  label,
  value,
  onChange,
  sub,
  extra,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  sub: string;
  extra?: string;
}) {
  const options: string[] = ["none", "friends"];
  if (extra) options.push(extra);
  options.push("everyone");
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--display)",
            fontSize: 16,
            letterSpacing: "0.04em",
            color: "var(--paper)",
          }}
        >
          {label.toUpperCase()}
        </span>
      </div>
      <div className="dim" style={{ fontSize: 12, marginBottom: 10 }}>
        {sub}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt as T)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--r-s)",
                background: active ? "var(--hazard)" : "var(--ink)",
                color: active ? "var(--ink)" : "var(--paper-dim)",
                border: `1px solid ${active ? "var(--ink)" : "var(--ink-3)"}`,
                fontFamily: "var(--mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                fontWeight: active ? 700 : 400,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
