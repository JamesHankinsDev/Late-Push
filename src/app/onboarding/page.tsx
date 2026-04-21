"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { updateUserProfile } from "@/lib/sources/firestore";
import { TIERS, TRICKS } from "@/lib/curriculum";
import { Stance } from "@/lib/types";
import {
  STANCE_OPTIONS,
  TIER_OPTIONS,
  GOAL_OPTIONS,
  VIBE_OPTIONS,
} from "@/lib/profile/options";
import { Bar, Button } from "@/components/ui/primitives";

const STEPS = ["WELCOME", "STANCE", "EXPERIENCE", "GOALS", "VIBE", "READY"] as const;

interface OnbData {
  stance?: Stance;
  tier?: number;
  goals?: string[];
  vibe?: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnbData>({});
  const [saving, setSaving] = useState(false);

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  async function finish(options?: { skipped?: boolean }) {
    if (!profile || saving) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        onboardedAt: new Date().toISOString(),
        ...(options?.skipped
          ? {}
          : {
              stance: data.stance,
              currentTier: data.tier ?? profile.currentTier ?? 0,
              goals: data.goals,
              vibe: data.vibe,
            }),
      });
      await refreshProfile();
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  const pickedTier = TIERS[data.tier ?? 0];
  const nextTrick = TRICKS.find((t) => t.tier === (data.tier ?? 0));

  const toggleMulti = (key: "goals" | "vibe", value: string) => {
    setData((d) => {
      const existing = d[key] ?? [];
      const contains = existing.includes(value);
      return {
        ...d,
        [key]: contains
          ? existing.filter((x) => x !== value)
          : [...existing, value],
      };
    });
  };

  return (
    <div className="onb-wrap">
      <div className="onb-card">
        <div className="onb-step-row">
          {STEPS.map((_, i) => (
            <div key={i} className={`pip ${i <= step ? "on" : ""}`} />
          ))}
        </div>

        <div className="label" style={{ marginBottom: 10 }}>
          STEP 0{step + 1} / 0{STEPS.length} · {STEPS[step]}
        </div>

        {step === 0 && (
          <>
            <h2>
              Welcome to <span className="hi">Late Push.</span>
            </h2>
            <p className="sub">
              Whoever you are, whenever you&apos;re starting — welcome. We
              don&apos;t gatekeep. We&apos;ll set you up in about two
              minutes: stance, where you&apos;re at, what you want, and
              you&apos;re rolling.
            </p>
            <div
              className="card-dark"
              style={{
                marginTop: 20,
                padding: 20,
                borderColor: "var(--hazard)",
              }}
            >
              <div className="hed hed-s" style={{ marginBottom: 8 }}>
                THE DEAL
              </div>
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--paper-2)",
                }}
              >
                <div>
                  ▸ A curriculum of 30+ tricks, in the order your body wants to learn them.
                </div>
                <div>
                  ▸ Daily drills that take 20–40 minutes, not two hours.
                </div>
                <div>
                  ▸ An AI coach that reviews every session you log.
                </div>
                <div>
                  ▸ Zero &quot;you can&apos;t do this&quot; energy. Everybody started where you are.
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>
              Regular, <span className="hi">or goofy?</span>
            </h2>
            <p className="sub">
              Which foot lives at the front of the board? If you don&apos;t know, pick &quot;help me figure it out&quot; and we&apos;ll walk you through a quick test.
            </p>
            <div className="choice-grid">
              {STANCE_OPTIONS.map((o) => (
                <div
                  key={o.id}
                  className={`choice-card ${data.stance === o.id ? "sel" : ""}`}
                  onClick={() => setData((d) => ({ ...d, stance: o.id }))}
                >
                  <div className="hdr">{o.hdr}</div>
                  <div className="dsc">{o.dsc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>
              Where <span className="hi">are you at?</span>
            </h2>
            <p className="sub">
              No judgment. We&apos;ll slot you into the right tier. You can always change it later if we got it wrong.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {TIER_OPTIONS.map((o) => (
                <div
                  key={o.id}
                  className={`goal-option ${data.tier === o.id ? "sel" : ""}`}
                  onClick={() => setData((d) => ({ ...d, tier: o.id }))}
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
          </>
        )}

        {step === 3 && (
          <>
            <h2>
              What do you want to <span className="hi">land?</span>
            </h2>
            <p className="sub">Pick one or a few. We&apos;ll tune the path toward them.</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {GOAL_OPTIONS.map((g) => {
                const sel = (data.goals ?? []).includes(g);
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
          </>
        )}

        {step === 4 && (
          <>
            <h2>
              Your <span className="hi">skate vibe.</span>
            </h2>
            <p className="sub">
              We&apos;ll match you with skaters who vibe similarly. Multi-select.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {VIBE_OPTIONS.map((v) => {
                const sel = (data.vibe ?? []).includes(v);
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
          </>
        )}

        {step === 5 && (
          <>
            <h2>
              You&apos;re <span className="hi">rolling.</span>
            </h2>
            <p className="sub">
              {pickedTier
                ? `Based on your answers we've placed you at Tier 0${pickedTier.number}, focused on ${pickedTier.name}.`
                : "We'll start you at Tier 0 — foundations first."}{" "}
              Your first drill is cued up on the dashboard.
            </p>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <div className="card-dark" style={{ padding: 18 }}>
                <div className="label" style={{ marginBottom: 8 }}>
                  YOUR TIER
                </div>
                <div className="hed hed-m">
                  TIER 0{pickedTier?.number ?? 0} ·{" "}
                  {(pickedTier?.name ?? "Pre-Board").toUpperCase()}
                </div>
                <Bar
                  value={
                    pickedTier
                      ? ((pickedTier.number + 1) / TIERS.length) * 100
                      : 20
                  }
                  tall
                />
              </div>
              {nextTrick && (
                <div className="card-dark" style={{ padding: 18 }}>
                  <div className="label" style={{ marginBottom: 8 }}>
                    NEXT SESSION
                  </div>
                  <div className="hed hed-s" style={{ marginBottom: 4 }}>
                    {nextTrick.name}
                  </div>
                  <div className="dim small">
                    {nextTrick.estimatedAdultLearningTime
                      ? `${nextTrick.estimatedAdultLearningTime} · `
                      : ""}
                    {nextTrick.description.split(".")[0]}.
                  </div>
                </div>
              )}
              {(data.goals?.length ?? 0) > 0 && (
                <div className="card-dark" style={{ padding: 18 }}>
                  <div className="label" style={{ marginBottom: 8 }}>
                    YOUR GOALS
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {(data.goals ?? []).map((g) => (
                      <span
                        key={g}
                        className="chip"
                        style={{ background: "var(--ink-3)" }}
                      >
                        {g.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="onb-nav">
          <Button
            variant="ghost"
            onClick={back}
            style={{ visibility: step === 0 ? "hidden" : "visible" }}
          >
            ← Back
          </Button>
          <div style={{ display: "flex", gap: 10 }}>
            {step < STEPS.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => finish({ skipped: true })}
                disabled={saving}
              >
                Skip for now
              </Button>
            )}
            <Button variant="primary" onClick={next} disabled={saving}>
              {saving
                ? "Saving..."
                : step === STEPS.length - 1
                ? "Let's push →"
                : "Next →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
