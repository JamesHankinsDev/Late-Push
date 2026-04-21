"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import {
  aliasColor,
  aliasInitials,
  normalizeAlias,
  validateAlias,
} from "@/lib/social/aliases";
import {
  changeAlias,
  isAliasAvailable,
} from "@/lib/sources/aliases";
import { updateUserProfile } from "@/lib/sources/firestore";
import { Button, Eyebrow } from "@/components/ui/primitives";

type CheckState =
  | { kind: "idle" }
  | { kind: "invalid"; hint: string }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken" }
  | { kind: "current" };

export default function AliasPage() {
  const { profile, refreshProfile } = useAuthContext();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [check, setCheck] = useState<CheckState>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentAlias = profile?.alias;

  // Debounced availability check
  useEffect(() => {
    const alias = input.trim();
    if (!alias) {
      setCheck({ kind: "idle" });
      return;
    }
    const v = validateAlias(alias);
    if (!v.ok) {
      setCheck({ kind: "invalid", hint: v.hint ?? "Invalid" });
      return;
    }
    if (
      currentAlias &&
      normalizeAlias(alias) === normalizeAlias(currentAlias)
    ) {
      setCheck({ kind: "current" });
      return;
    }
    setCheck({ kind: "checking" });
    const handle = setTimeout(async () => {
      try {
        const avail = await isAliasAvailable(alias);
        setCheck({ kind: avail ? "available" : "taken" });
      } catch {
        setCheck({ kind: "idle" });
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [input, currentAlias]);

  async function handleSave() {
    if (!profile || saving) return;
    const alias = input.trim();
    const v = validateAlias(alias);
    if (!v.ok) {
      setError(v.hint ?? "Invalid alias");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await changeAlias(profile.uid, profile.alias, alias);
      await updateUserProfile(profile.uid, {
        alias,
        aliasLower: normalizeAlias(alias),
        aliasColor: aliasColor(normalizeAlias(alias)),
        aliasChangedAt: new Date().toISOString(),
      });
      await refreshProfile();
      router.push("/settings/privacy");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't save that alias."
      );
    } finally {
      setSaving(false);
    }
  }

  const displayAlias = input.trim() || currentAlias || "";
  const previewLower = displayAlias ? normalizeAlias(displayAlias) : "";
  const previewColor = previewLower
    ? aliasColor(previewLower)
    : "var(--paper-dim)";
  const previewInitials = displayAlias
    ? aliasInitials(displayAlias)
    : "?";

  const canSave =
    check.kind === "available" && input.trim().length > 0 && !saving;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>ALIAS</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          {currentAlias ? "Change your alias" : "Pick your alias"}
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          This is the only name other skaters will ever see. Never your real
          name, never your email. Pick something you&apos;re comfortable
          showing up as — you can change it later, but aliases are logged to
          prevent evasion.
        </p>
      </div>

      <div
        className="card-dark"
        style={{
          padding: 22,
          display: "flex",
          gap: 18,
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: previewColor,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--hammer)",
            fontSize: 28,
            flexShrink: 0,
          }}
        >
          {previewInitials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="label" style={{ marginBottom: 4 }}>
            PREVIEW
          </div>
          <div
            style={{
              fontFamily: "var(--hammer)",
              fontSize: 24,
              letterSpacing: "0.02em",
              color: "var(--paper)",
            }}
          >
            @{displayAlias || "your_alias"}
          </div>
        </div>
      </div>

      <label style={{ display: "block", marginBottom: 14 }}>
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
            Alias
          </span>
          <span className="label">3–20 · LETTERS, NUMBERS, _</span>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentAlias ?? "e.g. grover_glider"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: "100%",
            background: "var(--ink)",
            border: "1px solid var(--ink-3)",
            borderRadius: "var(--r-s)",
            padding: "10px 12px",
            color: "var(--paper)",
            fontFamily: "var(--body)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <CheckLine state={check} />
      </label>

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

      <div style={{ display: "flex", gap: 10 }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          {saving
            ? "Saving…"
            : currentAlias
            ? "Save alias"
            : "Claim alias →"}
        </Button>
        <Link href="/settings/privacy">
          <Button variant="ghost">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}

function CheckLine({ state }: { state: CheckState }) {
  const baseStyle = {
    fontFamily: "var(--mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginTop: 8,
  };
  switch (state.kind) {
    case "idle":
      return null;
    case "invalid":
      return (
        <div style={{ ...baseStyle, color: "var(--coral)" }}>✕ {state.hint}</div>
      );
    case "checking":
      return (
        <div style={{ ...baseStyle, color: "var(--paper-dim)" }}>
          Checking…
        </div>
      );
    case "available":
      return (
        <div style={{ ...baseStyle, color: "var(--mint)" }}>
          ✓ Available
        </div>
      );
    case "taken":
      return (
        <div style={{ ...baseStyle, color: "var(--coral)" }}>
          ✕ Already taken
        </div>
      );
    case "current":
      return (
        <div style={{ ...baseStyle, color: "var(--paper-dim)" }}>
          This is already your alias.
        </div>
      );
  }
}
