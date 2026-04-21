"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { createMeetup } from "@/lib/sources/meetups";
import { listUserCrews } from "@/lib/sources/crews";
import { mergePrivacy } from "@/lib/social/privacy";
import { Crew, MeetupVisibility, SkateSpot } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";
import { format } from "date-fns";

export default function NewMeetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuthContext();
  const privacy = mergePrivacy(profile?.privacy);
  const preselectedCrewId = searchParams.get("crew");

  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("");
  const [myCrews, setMyCrews] = useState<Crew[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<MeetupVisibility>("public");
  const [spot, setSpot] = useState<SkateSpot | null>(null);
  const [spotQuery, setSpotQuery] = useState("");
  const [spotResults, setSpotResults] = useState<SkateSpot[]>([]);
  const [spotLoading, setSpotLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load user crews + preselect if ?crew= param present.
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const crews = await listUserCrews(profile.uid);
      setMyCrews(crews);
      if (preselectedCrewId) {
        const match = crews.find((c) => c.id === preselectedCrewId);
        if (match) {
          setSelectedCrewId(match.id);
          setVisibility("crew-only");
        }
      }
    })();
  }, [profile, preselectedCrewId]);

  // Seed the spot from the user's home spot as a default
  useEffect(() => {
    if (!profile || spot) return;
    if (profile.homeSpotId && profile.homeSpotName && profile.homeSpotLat !== undefined && profile.homeSpotLng !== undefined) {
      setSpot({
        id: profile.homeSpotId,
        name: profile.homeSpotName,
        lat: profile.homeSpotLat,
        lng: profile.homeSpotLng,
        type: "skatepark",
        beginnerFriendly: true,
        tags: [],
      });
    }
  }, [profile, spot]);

  // Debounced spot search
  useEffect(() => {
    const term = spotQuery.trim();
    if (term.length < 2) {
      setSpotResults([]);
      return;
    }
    if (!profile?.homeSpotLat || !profile?.homeSpotLng) {
      setSpotResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSpotLoading(true);
      try {
        const res = await fetch(
          `/api/spots?lat=${profile.homeSpotLat}&lng=${profile.homeSpotLng}&radius=40000`
        );
        const data = await res.json();
        const all: SkateSpot[] = data.spots ?? [];
        const lower = term.toLowerCase();
        setSpotResults(
          all.filter((s) => s.name.toLowerCase().includes(lower)).slice(0, 8)
        );
      } finally {
        setSpotLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [spotQuery, profile]);

  if (!profile) return null;
  if (!privacy.socialEnabled || !profile.alias) {
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
          Meetups require an alias and social enabled.
        </p>
        <Link href="/settings/privacy">
          <Button variant="primary">Privacy settings →</Button>
        </Link>
      </div>
    );
  }

  const selectedCrew = selectedCrewId
    ? myCrews.find((c) => c.id === selectedCrewId) ?? null
    : null;

  const validTitle = title.trim().length >= 3 && title.trim().length <= 60;
  const validFocus = focus.trim().length <= 240;
  const validDate = date >= new Date().toISOString().slice(0, 10);
  const visibilityOk =
    visibility === "public" || (visibility === "crew-only" && !!selectedCrew);
  const canSubmit =
    validTitle && validFocus && validDate && visibilityOk && !!spot && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !canSubmit || !spot) return;
    setError("");
    setSaving(true);
    try {
      const meetup = await createMeetup(
        {
          title: title.trim(),
          focus: focus.trim(),
          spot,
          date,
          time: time.trim() || undefined,
          crew: selectedCrew
            ? {
                id: selectedCrew.id,
                name: selectedCrew.name,
                tag: selectedCrew.tag,
                color: selectedCrew.color,
              }
            : undefined,
          visibility,
        },
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        }
      );
      router.push(`/meetups/${meetup.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the meetup.");
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>NEW MEETUP</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Plan a session.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          Pick a spot, pick a date, tell people what you&apos;re working on.
          Public meetups show up in everyone&apos;s list; crew-only meetups
          stay inside the crew.
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
        {/* Title + focus */}
        <div className="card-dark" style={{ padding: 18, display: "grid", gap: 14 }}>
          <Field label="Title" hint="3–60 chars">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Saturday morning push"
              maxLength={60}
              style={inputStyle}
            />
          </Field>
          <Field label="Focus" hint="UP TO 240 CHARS">
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              rows={3}
              maxLength={240}
              placeholder="Pushing + cruising. Slow pace. Chill vibes."
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
            />
          </Field>
        </div>

        {/* When */}
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
            When
          </div>
          <div className="form-row-2">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                style={inputStyle}
              />
            </Field>
            <Field label="Time" hint="OPTIONAL">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="6:30 PM"
                maxLength={20}
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        {/* Spot */}
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
            Spot
          </div>
          {spot ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "rgba(120,209,154,0.08)",
                border: "1px solid var(--mint)",
                borderRadius: "var(--r-s)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 16,
                    letterSpacing: "0.04em",
                  }}
                >
                  {spot.name}
                </div>
                <div className="dim small" style={{ marginTop: 2 }}>
                  {spot.source === "seed" ? "Curated" : "OpenStreetMap"}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSpot(null);
                  setSpotQuery("");
                }}
              >
                Change
              </Button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={spotQuery}
                onChange={(e) => setSpotQuery(e.target.value)}
                placeholder={
                  profile.homeSpotLat
                    ? "Search by name…"
                    : "Set a home spot in settings to enable spot search"
                }
                style={inputStyle}
                disabled={!profile.homeSpotLat}
              />
              {spotLoading && (
                <p className="dim small" style={{ marginTop: 8 }}>
                  Searching…
                </p>
              )}
              {spotResults.length > 0 && (
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  {spotResults.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSpot(s);
                        setSpotResults([]);
                        setSpotQuery("");
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: "var(--ink)",
                        border: "1px solid var(--ink-3)",
                        borderRadius: "var(--r-s)",
                        cursor: "pointer",
                        color: "inherit",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--display)",
                          fontSize: 14,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {s.name}
                      </span>
                      {s.distance != null && (
                        <span className="label">{s.distance} MI</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Crew + visibility */}
        <div className="card-dark" style={{ padding: 18, display: "grid", gap: 14 }}>
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
              Crew (optional)
            </div>
            {myCrews.length === 0 ? (
              <p className="dim small" style={{ margin: 0 }}>
                You&apos;re not in any crews yet. This meetup will be public.
              </p>
            ) : (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCrewId(null);
                    setVisibility("public");
                  }}
                  style={pillStyle(!selectedCrewId)}
                >
                  NONE
                </button>
                {myCrews.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCrewId(c.id);
                    }}
                    style={pillStyle(selectedCrewId === c.id)}
                  >
                    {c.tag}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              Visibility
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <VisChoice
                label="Public"
                sub="Anyone on Late Push can see + RSVP."
                active={visibility === "public"}
                onClick={() => setVisibility("public")}
              />
              <VisChoice
                label="Crew only"
                sub={
                  selectedCrew
                    ? `Only members of ${selectedCrew.name} can see + RSVP.`
                    : "Pick a crew above first."
                }
                active={visibility === "crew-only"}
                disabled={!selectedCrew}
                onClick={() => selectedCrew && setVisibility("crew-only")}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Link href="/social">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            {saving ? "Creating…" : "Create meetup →"}
          </Button>
        </div>
      </form>

      {!canSubmit && !saving && (
        <p className="dim small" style={{ marginTop: 10, textAlign: "right" }}>
          {!spot
            ? "Pick a spot to continue."
            : !validTitle
            ? "Title needs to be 3–60 chars."
            : !validDate
            ? "Date must be today or later."
            : !visibilityOk
            ? "Crew-only requires a crew selected."
            : ""}
        </p>
      )}
    </div>
  );
}

function VisChoice({
  label,
  sub,
  active,
  disabled,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: active ? "rgba(245,212,0,0.08)" : "var(--ink)",
        border: `2px solid ${active ? "var(--hazard)" : "var(--ink-3)"}`,
        borderRadius: "var(--r-s)",
        padding: "12px 14px",
        textAlign: "left",
        color: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span
          style={{
            fontFamily: "var(--display)",
            fontSize: 15,
            letterSpacing: "0.04em",
          }}
        >
          {label.toUpperCase()}
        </span>
        {active && <Tag tone="yellow">SELECTED</Tag>}
      </div>
      <div className="dim small" style={{ marginTop: 4 }}>
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

function pillStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "var(--hazard)" : "var(--ink)",
    color: active ? "var(--ink)" : "var(--paper-dim)",
    border: `1px solid ${active ? "var(--ink)" : "var(--ink-3)"}`,
    padding: "6px 12px",
    borderRadius: "var(--r-s)",
    fontFamily: "var(--mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontWeight: active ? 700 : 400,
  };
}
