"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { updateUserProfile } from "@/lib/sources/firestore";
import { Stance } from "@/lib/types";
import {
  STANCE_OPTIONS,
  TIER_OPTIONS,
  GOAL_OPTIONS,
  VIBE_OPTIONS,
} from "@/lib/profile/options";
import { Button, Eyebrow } from "@/components/ui/primitives";

interface FormState {
  displayName: string;
  bio: string;
  stance: Stance | undefined;
  currentTier: number;
  goals: string[];
  vibe: string[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Seed the form once the profile is loaded.
  useEffect(() => {
    if (!profile || form) return;
    setForm({
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      stance: profile.stance,
      currentTier: profile.currentTier ?? 0,
      goals: profile.goals ?? [],
      vibe: profile.vibe ?? [],
    });
  }, [profile, form]);

  const dirty = useMemo(() => {
    if (!profile || !form) return false;
    return (
      form.displayName !== (profile.displayName ?? "") ||
      form.bio !== (profile.bio ?? "") ||
      form.stance !== profile.stance ||
      form.currentTier !== (profile.currentTier ?? 0) ||
      !arraysEqual(form.goals, profile.goals ?? []) ||
      !arraysEqual(form.vibe, profile.vibe ?? [])
    );
  }, [form, profile]);

  if (!profile) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NOT SIGNED IN</Eyebrow>
        <p className="dim" style={{ marginTop: 10 }}>
          Sign in to edit your profile.
        </p>
      </div>
    );
  }

  if (!form) {
    return (
      <div
        className="card-dark animate-pulse"
        style={{ height: 300 }}
      />
    );
  }

  const toggleMulti = (key: "goals" | "vibe", value: string) => {
    setForm((f) => {
      if (!f) return f;
      const existing = f[key];
      const contains = existing.includes(value);
      return {
        ...f,
        [key]: contains
          ? existing.filter((x) => x !== value)
          : [...existing, value],
      };
    });
  };

  async function save() {
    if (!profile || !form || saving) return;
    setError("");
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        displayName: form.displayName.trim() || profile.displayName,
        bio: form.bio.trim() || undefined,
        stance: form.stance,
        currentTier: form.currentTier,
        goals: form.goals,
        vibe: form.vibe,
      });
      await refreshProfile();
      router.push("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Eyebrow>EDIT PROFILE</Eyebrow>
          <h2 className="hed hed-l" style={{ marginTop: 10 }}>
            Update your bio.
          </h2>
          <p className="dim" style={{ maxWidth: "52ch", marginTop: 8 }}>
            Tune how you show up — stance, vibe, the tricks you&apos;re
            chasing. We&apos;ll use these to match you up once social is live.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/profile">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            variant="primary"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      {/* Identity block */}
      <div className="card-dark" style={{ padding: 22, marginBottom: 18 }}>
        <div className="sec-head" style={{ marginTop: 0 }}>
          <h3>Identity</h3>
          <span className="label">NAME · BIO</span>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="Display name">
            <input
              type="text"
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              style={inputStyle}
              placeholder="How other skaters see you"
              maxLength={60}
            />
          </Field>
          <Field label="Bio" hint="~200 characters">
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              maxLength={220}
              style={{ ...inputStyle, resize: "vertical", minHeight: 90 }}
              placeholder="Why you started, what you're chasing, your thing."
            />
          </Field>
        </div>
      </div>

      {/* Stance */}
      <div className="card-dark" style={{ padding: 22, marginBottom: 18 }}>
        <div className="sec-head" style={{ marginTop: 0 }}>
          <h3>Stance</h3>
          <span className="label">PICK ONE</span>
        </div>
        <div
          className="choice-grid"
          style={{ marginBottom: 0, marginTop: 4 }}
        >
          {STANCE_OPTIONS.map((o) => (
            <div
              key={o.id}
              className={`choice-card ${form.stance === o.id ? "sel" : ""}`}
              onClick={() => setForm({ ...form, stance: o.id })}
            >
              <div className="hdr">{o.hdr}</div>
              <div className="dsc">{o.dsc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current tier */}
      <div className="card-dark" style={{ padding: 22, marginBottom: 18 }}>
        <div className="sec-head" style={{ marginTop: 0 }}>
          <h3>Current tier</h3>
          <span className="label">SELF-REPORTED · CHANGE ANYTIME</span>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {TIER_OPTIONS.map((o) => (
            <div
              key={o.id}
              className={`goal-option ${form.currentTier === o.id ? "sel" : ""}`}
              onClick={() => setForm({ ...form, currentTier: o.id })}
            >
              <div className="emo">{o.emo}</div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 16,
                    letterSpacing: "0.05em",
                  }}
                >
                  T{o.id} · {o.hdr}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{o.dsc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="card-dark" style={{ padding: 22, marginBottom: 18 }}>
        <div className="sec-head" style={{ marginTop: 0 }}>
          <h3>Goals</h3>
          <span className="label">MULTI-SELECT · WHAT YOU WANT TO LAND</span>
        </div>
        <div className="multi-select-grid">
          {GOAL_OPTIONS.map((g) => {
            const sel = form.goals.includes(g);
            return (
              <div
                key={g}
                className={`choice-card ${sel ? "sel" : ""}`}
                style={{ padding: "14px 16px" }}
                onClick={() => toggleMulti("goals", g)}
              >
                <div className="hdr" style={{ fontSize: 16 }}>
                  {g.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vibe */}
      <div className="card-dark" style={{ padding: 22, marginBottom: 28 }}>
        <div className="sec-head" style={{ marginTop: 0 }}>
          <h3>Vibe</h3>
          <span className="label">MULTI-SELECT · HOW YOU LIKE TO SKATE</span>
        </div>
        <div className="multi-select-grid">
          {VIBE_OPTIONS.map((v) => {
            const sel = form.vibe.includes(v);
            return (
              <div
                key={v}
                className={`choice-card ${sel ? "sel" : ""}`}
                style={{ padding: "12px 14px" }}
                onClick={() => toggleMulti("vibe", v)}
              >
                <div className="hdr" style={{ fontSize: 14 }}>
                  {v.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <Link href="/profile">
          <Button variant="ghost">Cancel</Button>
        </Link>
        <Button variant="primary" onClick={save} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
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

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
