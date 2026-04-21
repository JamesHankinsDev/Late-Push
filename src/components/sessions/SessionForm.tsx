"use client";

import { useState } from "react";
import { TRICKS, TIERS } from "@/lib/curriculum";
import { BodyFeel, SurfaceQuality, Session } from "@/lib/types";
import { format } from "date-fns";
import { Button, Tag } from "@/components/ui/primitives";

interface SessionFormProps {
  onSubmit: (
    session: Omit<Session, "id" | "userId" | "createdAt" | "coachResponse">
  ) => void;
  loading: boolean;
  initialTricks?: string[];
  initialWhatClicked?: string;
  initialWhatDidnt?: string;
  initialBodyFeel?: BodyFeel;
}

const BODY_FEEL_OPTIONS: {
  value: BodyFeel;
  label: string;
  tone: "mint" | "coral" | "brick";
}[] = [
  { value: "fine", label: "Feeling Good", tone: "mint" },
  { value: "sore", label: "Sore", tone: "coral" },
  { value: "injured", label: "Injured", tone: "brick" },
];

const TONE_COLOR = {
  mint: "var(--mint)",
  coral: "var(--coral)",
  brick: "var(--brick)",
};

const SURFACE_OPTIONS: SurfaceQuality[] = [
  "smooth",
  "rough",
  "cracked",
  "mixed",
];

export default function SessionForm({
  onSubmit,
  loading,
  initialTricks = [],
  initialWhatClicked = "",
  initialWhatDidnt = "",
  initialBodyFeel = "fine",
}: SessionFormProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("");
  const [tricksPracticed, setTricksPracticed] =
    useState<string[]>(initialTricks);
  const [whatClicked, setWhatClicked] = useState(initialWhatClicked);
  const [whatDidnt, setWhatDidnt] = useState(initialWhatDidnt);
  const [bodyFeel, setBodyFeel] = useState<BodyFeel>(initialBodyFeel);
  const [injuryNotes, setInjuryNotes] = useState("");
  const [surfaceQuality, setSurfaceQuality] =
    useState<SurfaceQuality | "">("");
  const [showTrickPicker, setShowTrickPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      duration,
      location: location || undefined,
      tricksPracticed,
      whatClicked,
      whatDidnt,
      bodyFeel,
      injuryNotes: injuryNotes || undefined,
      surfaceQuality: (surfaceQuality as SurfaceQuality) || undefined,
    });
  };

  const toggleTrick = (id: string) => {
    setTricksPracticed((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
      {/* Date + Duration */}
      <div
        className="card-dark"
        style={{ padding: 18, display: "grid", gap: 14 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Duration (min)">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min={5}
              max={480}
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="Location" hint="OPTIONAL">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Grover Park, the lot on 5th"
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Tricks */}
      <div className="card-dark" style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
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
            Tricks Practiced
          </span>
          <span className="label">OPTIONAL · ADD ANY YOU WORKED ON</span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 10,
            minHeight: 28,
          }}
        >
          {tricksPracticed.length === 0 && (
            <span className="dim small">No tricks selected yet.</span>
          )}
          {tricksPracticed.map((id) => {
            const trick = TRICKS.find((t) => t.id === id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleTrick(id)}
                style={{
                  background: "none",
                  padding: 0,
                  border: 0,
                  cursor: "pointer",
                }}
                aria-label={`Remove ${trick?.name ?? id}`}
              >
                <Tag tone="yellow">{(trick?.name ?? id) + "  ✕"}</Tag>
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTrickPicker(!showTrickPicker)}
        >
          {showTrickPicker ? "Hide trick picker" : "+ Add tricks"}
        </Button>
        {showTrickPicker && (
          <div
            style={{
              marginTop: 12,
              maxHeight: 240,
              overflowY: "auto",
              background: "var(--ink)",
              border: "1px solid var(--ink-3)",
              borderRadius: "var(--r-s)",
              padding: 10,
            }}
          >
            {TIERS.map((tier) => {
              const tierTricks = TRICKS.filter((t) => t.tier === tier.number);
              if (tierTricks.length === 0) return null;
              return (
                <div key={tier.number} style={{ marginBottom: 8 }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--paper-dim)",
                      padding: "4px 6px",
                    }}
                  >
                    TIER 0{tier.number} · {tier.name}
                  </div>
                  {tierTricks.map((trick) => {
                    const selected = tricksPracticed.includes(trick.id);
                    return (
                      <button
                        key={trick.id}
                        type="button"
                        onClick={() => toggleTrick(trick.id)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 8px",
                          background: selected
                            ? "rgba(245,212,0,0.1)"
                            : "transparent",
                          border: "none",
                          borderRadius: 4,
                          color: selected
                            ? "var(--hazard)"
                            : "var(--paper-2)",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        {selected ? "✓ " : ""}
                        {trick.name}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What clicked / didn't */}
      <div
        className="card-dark"
        style={{ padding: 18, display: "grid", gap: 14 }}
      >
        <Field label="What clicked?" hint="WHAT FELT RIGHT">
          <textarea
            value={whatClicked}
            onChange={(e) => setWhatClicked(e.target.value)}
            placeholder="Finally got the front-foot slide on ollies…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
          />
        </Field>
        <Field label="What didn't click?" hint="WHAT TO WORK ON">
          <textarea
            value={whatDidnt}
            onChange={(e) => setWhatDidnt(e.target.value)}
            placeholder="Kept landing with my weight too far back…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
          />
        </Field>
      </div>

      {/* Body feel + Surface */}
      <div
        className="card-dark"
        style={{ padding: 18, display: "grid", gap: 14 }}
      >
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper-dim)",
              marginBottom: 8,
            }}
          >
            How does your body feel?
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {BODY_FEEL_OPTIONS.map((opt) => {
              const active = bodyFeel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBodyFeel(opt.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--r-s)",
                    background: active
                      ? `${TONE_COLOR[opt.tone]}20`
                      : "var(--ink)",
                    border: `1px solid ${
                      active ? TONE_COLOR[opt.tone] : "var(--ink-3)"
                    }`,
                    color: active ? TONE_COLOR[opt.tone] : "var(--paper-dim)",
                    fontFamily: "var(--display)",
                    fontSize: 13,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                  }}
                >
                  {opt.label.toUpperCase()}
                </button>
              );
            })}
          </div>
          {(bodyFeel === "sore" || bodyFeel === "injured") && (
            <textarea
              value={injuryNotes}
              onChange={(e) => setInjuryNotes(e.target.value)}
              placeholder={
                bodyFeel === "injured"
                  ? "What's injured? Be specific so we can track it…"
                  : "What's sore? Any specific areas?"
              }
              rows={2}
              style={{
                ...inputStyle,
                marginTop: 10,
                resize: "vertical",
                minHeight: 60,
                borderColor:
                  bodyFeel === "injured" ? "var(--brick)" : "var(--coral)",
              }}
            />
          )}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
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
              Surface Quality
            </span>
            <span className="label">OPTIONAL</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SURFACE_OPTIONS.map((sq) => {
              const active = surfaceQuality === sq;
              return (
                <button
                  key={sq}
                  type="button"
                  onClick={() =>
                    setSurfaceQuality(surfaceQuality === sq ? "" : sq)
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: "var(--r-s)",
                    background: active ? "rgba(126,199,255,0.1)" : "var(--ink)",
                    border: `1px solid ${
                      active ? "var(--sky)" : "var(--ink-3)"
                    }`,
                    color: active ? "var(--sky)" : "var(--paper-dim)",
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  {sq}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Button
          type="submit"
          variant="primary"
          disabled={loading || duration <= 0}
        >
          {loading ? "Saving & asking the coach…" : "Log session →"}
        </Button>
      </div>
    </form>
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
