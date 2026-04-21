// Aliases a user may not claim. Includes obvious system/admin terms,
// potential impersonation risks, and slurs (we keep the slur list
// deliberately out of source — Firestore rule can reject them later too).

export const RESERVED_ALIASES: ReadonlySet<string> = new Set([
  // System
  "admin",
  "administrator",
  "mod",
  "moderator",
  "support",
  "help",
  "staff",
  "team",
  "system",
  "bot",
  "api",
  "root",
  "null",
  "undefined",
  // Brand
  "latepush",
  "late_push",
  "late-push",
  "latepushofficial",
  "official",
  // Generic identity collisions
  "you",
  "me",
  "user",
  "anonymous",
  "anon",
  "guest",
  "test",
  "testing",
  "demo",
  "example",
  // Routes
  "dashboard",
  "profile",
  "settings",
  "social",
  "tricks",
  "spots",
  "sessions",
  "onboarding",
  "login",
  "signup",
  "home",
  "about",
  "terms",
  "privacy",
]);

export function isReservedAlias(alias: string): boolean {
  return RESERVED_ALIASES.has(alias.toLowerCase());
}
