"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { createCrew } from "@/lib/sources/crews";
import { mergePrivacy } from "@/lib/social/privacy";
import { CrewVisibility } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

const COLOR_PALETTE = [
  "#f5d400", // hazard
  "#ff5a3c", // coral
  "#78d19a", // mint
  "#b38cff", // violet
  "#7ec7ff", // sky
  "#c93a2a", // brick
];

export default function NewCrewPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const privacy = mergePrivacy(profile?.privacy);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CrewVisibility>("public");
  const [meetingCadence, setMeetingCadence] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!profile) return null;

  const socialReady = privacy.socialEnabled && profile.alias;

  if (!socialReady) {
    return (
      <div
        className="card-dark"
        style={{ padding: 32, textAlign: "center", maxWidth: 640, margin: "0 auto" }}
      >
        <Eyebrow tone="coral">SOCIAL OFF</Eyebrow>
        <h2 className="hed hed-m" style={{ marginTop: 12, marginBottom: 10 }}>
          Turn on social first.
        </h2>
        <p className="dim" style={{ fontSize: 14, marginBottom: 20 }}>
          Creating crews requires an alias and social enabled. Head to privacy
          settings to get set up.
        </p>
        <Link href="/settings/privacy">
          <Button variant="primary">Privacy settings →</Button>
        </Link>
      </div>
    );
  }

  const validTag = /^[A-Z0-9]{2,5}$/.test(tag.toUpperCase());
  const validName = name.trim().length >= 3 && name.trim().length <= 40;
  const validDesc = description.trim().length <= 240;
  const canSubmit = validName && validTag && validDesc && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !canSubmit) return;
    setError("");
    setSaving(true);
    try {
      const crew = await createCrew(
        {
          name: name.trim(),
          tag: tag.trim().toUpperCase(),
          color,
          description: description.trim(),
          visibility,
          meetingCadence: meetingCadence.trim() || undefined,
        },
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? color,
        }
      );
      await refreshProfile();
      router.push(`/crews/${crew.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the crew.");
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>NEW CREW</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Start a crew.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          Crews are groups you skate with — same tier, same neighborhood, same
          vibe. You&apos;ll be the owner. Invite people after creation.
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

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <div className="card-dark" style={{ padding: 18, display: "grid", gap: 14 }}>
          <Field label="Name" hint="3–40 chars">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Push Club"
              maxLength={40}
              style={inputStyle}
            />
          </Field>
          <div className="form-row-2">
            <Field label="Tag" hint="2–5 CHARS · A–Z, 0–9">
              <input
                type="text"
                value={tag}
                onChange={(e) =>
                  setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                placeholder="PUSH"
                maxLength={5}
                style={inputStyle}
              />
            </Field>
            <Field label="Meetings" hint="OPTIONAL">
              <input
                type="text"
                value={meetingCadence}
                onChange={(e) => setMeetingCadence(e.target.value)}
                placeholder="Sat 9am"
                maxLength={30}
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="Description" hint="UP TO 240 CHARS">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={240}
              placeholder="Over-30 adult beginners. No egos. Slow progression, lots of snacks."
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
            />
          </Field>
        </div>

        {/* Color */}
        <div className="card-dark" style={{ padding: 18 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper-dim)",
              marginBottom: 10,
            }}
          >
            Crew color
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLOR_PALETTE.map((c) => {
              const active = c === color;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: c,
                    border: active
                      ? "3px solid var(--paper)"
                      : "2px solid var(--ink-3)",
                    cursor: "pointer",
                  }}
                  aria-label={`Pick ${c}`}
                />
              );
            })}
          </div>
        </div>

        {/* Visibility */}
        <div className="card-dark" style={{ padding: 18 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper-dim)",
              marginBottom: 10,
            }}
          >
            Visibility
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <VisibilityCard
              value="public"
              label="Public"
              sub="Anyone can see + join. Good for welcoming crews."
              active={visibility === "public"}
              onClick={() => setVisibility("public")}
            />
            <VisibilityCard
              value="invite-only"
              label="Invite only"
              sub="Visible in listings but joinable only with an owner invite. Good for tight groups."
              active={visibility === "invite-only"}
              onClick={() => setVisibility("invite-only")}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="card-dark" style={{ padding: 18 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper-dim)",
              marginBottom: 10,
            }}
          >
            Preview
          </div>
          <div className="crew-card" style={{ maxWidth: 320 }}>
            <div className="crew-banner" style={{ background: color }}>
              <div className="mark">{tag || "TAG"}</div>
            </div>
            <div className="crew-body">
              <h4>{name.trim() || "Crew name"}</h4>
              <p>
                {description.trim() ||
                  "Your crew's vibe in a sentence or two."}
              </p>
              <div className="crew-meta">
                <span>
                  1 · {visibility === "public" ? "OPEN" : "INVITE ONLY"}
                  {meetingCadence ? ` · ${meetingCadence}` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <Link href="/social">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            {saving ? "Creating…" : "Create crew →"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function VisibilityCard({
  label,
  sub,
  active,
  onClick,
}: {
  value: CrewVisibility;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? "rgba(245,212,0,0.08)" : "var(--ink)",
        border: `2px solid ${active ? "var(--hazard)" : "var(--ink-3)"}`,
        borderRadius: "var(--r-s)",
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        color: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        {active && <Tag tone="yellow">SELECTED</Tag>}
      </div>
      <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>
        {sub}
      </div>
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
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
        {hint && <span className="label">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--ink)",
  border: "1px solid var(--ink-3)",
  borderRadius: "var(--r-s)",
  padding: "10px 12px",
  color: "var(--paper)",
  fontFamily: "var(--body)",
  fontSize: 14,
  outline: "none",
};
