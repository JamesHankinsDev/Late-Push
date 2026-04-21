/**
 * Shared moderation patterns.
 *
 * We run these synchronously on the client (and ultimately server-side when
 * we move moderation into a Cloud Function). Keep the lists conservative —
 * skate-coordination is the primary use case, we don't want to flag
 * "tennis courts in Medford" or "behind the CVS on Main."
 */

// -----------------------------------------------------------------------
// Hate speech / harassment — HARD BLOCK on posts and DMs alike.
// -----------------------------------------------------------------------

/**
 * Representative slurs/abuse patterns. This is deliberately SMALL and boring
 * for review purposes — the real list lives server-side behind a feature
 * flag, and Layer 2 (LLM) catches most edge cases. Any of these hitting
 * means we refuse the message and surface a clear explanation.
 */
const HATE_PATTERNS: RegExp[] = [
  // Common slur shapes, case-insensitive, word-bounded to avoid false
  // positives on embedded substrings.
  /\b(n[i1]g{1,2}er(s|z)?|f[a@]g(s|got(s|z)?)?|tr[a@]nny|r[e3]t[a@]rd)\b/i,
  // Kill-yourself style harassment.
  /\b(kill\s*y(ourself|ou)|kys|go\s*die)\b/i,
];

export function detectHateSpeech(text: string): boolean {
  return HATE_PATTERNS.some((p) => p.test(text));
}

// -----------------------------------------------------------------------
// PII — used as a warning on public posts; hard-block on DMs with strangers.
// -----------------------------------------------------------------------

const ADDRESS_PATTERN =
  /\b\d{1,5}\s+[A-Za-z0-9.'\- ]{2,40}\s+(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Way|Dr|Drive|Ct|Court|Pl|Place|Ter|Terrace|Pkwy|Parkway|Hwy|Highway)\b/;

const PHONE_PATTERN =
  /(\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;

const EMAIL_PATTERN =
  /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/;

const AGE_PATTERN = /\b(i'?m|i\s*am|im)\s+(1[0-9]|[2-9]\d)\b/i;

const PLATFORM_PATTERN =
  /\b(snap(chat)?|ig|insta(gram)?|whatsapp|telegram|discord|tiktok|facebook|messenger|signal)\b.*?[@:\s].{2,}/i;

const IDENTITY_PATTERN =
  /\b(my\s+(real\s+)?(name|last\s*name|address|school|workplace|employer|job)|i\s+live\s+at|where\s+i\s+live)\b/i;

export type PiiHit =
  | "address"
  | "phone"
  | "email"
  | "age"
  | "platform"
  | "identity";

export function detectPii(text: string): PiiHit[] {
  const hits: PiiHit[] = [];
  if (ADDRESS_PATTERN.test(text)) hits.push("address");
  if (PHONE_PATTERN.test(text)) hits.push("phone");
  if (EMAIL_PATTERN.test(text)) hits.push("email");
  if (AGE_PATTERN.test(text)) hits.push("age");
  if (PLATFORM_PATTERN.test(text)) hits.push("platform");
  if (IDENTITY_PATTERN.test(text)) hits.push("identity");
  return hits;
}

export const PII_LABELS: Record<PiiHit, string> = {
  address: "a street address",
  phone: "a phone number",
  email: "an email address",
  age: "your age",
  platform: "an off-platform social handle",
  identity: "personal-identity details",
};
