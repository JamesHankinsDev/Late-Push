import { isReservedAlias } from "./reservedAliases";

export const ALIAS_MIN = 3;
export const ALIAS_MAX = 20;
const ALIAS_PATTERN = /^[a-zA-Z0-9_]+$/;

export type AliasValidationError =
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_CHARS"
  | "RESERVED"
  | "LEADING_NUMBER"
  | "ALL_UNDERSCORES";

export interface AliasValidationResult {
  ok: boolean;
  error?: AliasValidationError;
  hint?: string;
}

/** Pure validation — does NOT check Firestore for uniqueness. */
export function validateAlias(raw: string): AliasValidationResult {
  const alias = raw.trim();
  if (alias.length < ALIAS_MIN)
    return {
      ok: false,
      error: "TOO_SHORT",
      hint: `${ALIAS_MIN}-${ALIAS_MAX} characters.`,
    };
  if (alias.length > ALIAS_MAX)
    return {
      ok: false,
      error: "TOO_LONG",
      hint: `${ALIAS_MIN}-${ALIAS_MAX} characters.`,
    };
  if (!ALIAS_PATTERN.test(alias))
    return {
      ok: false,
      error: "INVALID_CHARS",
      hint: "Letters, numbers, and underscores only.",
    };
  if (/^\d/.test(alias))
    return {
      ok: false,
      error: "LEADING_NUMBER",
      hint: "Start with a letter.",
    };
  if (/^_+$/.test(alias))
    return {
      ok: false,
      error: "ALL_UNDERSCORES",
      hint: "Use at least one letter or number.",
    };
  if (isReservedAlias(alias))
    return {
      ok: false,
      error: "RESERVED",
      hint: "That alias is reserved — pick another.",
    };
  return { ok: true };
}

export function normalizeAlias(alias: string): string {
  return alias.trim().toLowerCase();
}

// Stable palette aligned with the design system accents — avoids blues/purples
// that clash with the hazard-yellow brand background and favors readable
// mid-saturation shades. Picked deterministically from the alias so an alias
// keeps the same color across sessions.
const ALIAS_COLORS = [
  "#f5d400", // hazard
  "#ff5a3c", // coral
  "#78d19a", // mint
  "#b38cff", // violet
  "#7ec7ff", // sky
  "#e4dccb", // paper-2
  "#c9bfa8", // paper-3
  "#c93a2a", // brick
];

export function aliasColor(aliasLower: string): string {
  let hash = 0;
  for (let i = 0; i < aliasLower.length; i++) {
    hash = (hash * 31 + aliasLower.charCodeAt(i)) | 0;
  }
  return ALIAS_COLORS[Math.abs(hash) % ALIAS_COLORS.length];
}

export function aliasInitials(alias: string): string {
  const trimmed = alias.replace(/_+/g, " ").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}
