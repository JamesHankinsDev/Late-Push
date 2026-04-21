import { TrustLevel } from "@/lib/types";
import {
  detectHateSpeech,
  detectPii,
  PiiHit,
  PII_LABELS,
} from "./patterns";
import { SEED_SPOTS } from "@/lib/sources/seedSpots";

// -----------------------------------------------------------------------
// Spot-name allowlist
// -----------------------------------------------------------------------

/**
 * If the message includes a known spot name, assume any street-ish tokens
 * are part of the spot reference and skip the address block. Users
 * coordinating meetups at known places is the whole point of DMs.
 *
 * Sources:
 * - SEED_SPOTS (curated list, always loaded client-side)
 * - The author's home spot (passed in)
 * - The recipient's home spot (passed in)
 *
 * OSM-sourced spots aren't in the list at classification time; the worst
 * case is a false positive that soft-blocks a legitimate coordination
 * message. The L2 classifier will typically recover.
 */
export function mentionsKnownSpot(
  text: string,
  extraSpotNames: string[] = []
): boolean {
  const lower = text.toLowerCase();
  const seedNames = SEED_SPOTS.map((s) => s.name.toLowerCase());
  const all = [...seedNames, ...extraSpotNames.map((n) => n.toLowerCase())];
  return all.some((n) => n.length >= 3 && lower.includes(n));
}

// -----------------------------------------------------------------------
// Trust-aware pre-send classification (Layer 1)
// -----------------------------------------------------------------------

export type DmL1Decision =
  | { action: "send" } // go straight through
  | { action: "warn"; reason: string } // client asks "send anyway?"
  | { action: "block"; reason: string }; // hard-stopped before send

export interface DmContext {
  trust: TrustLevel;
  extraSpotNames?: string[]; // recipient's/host's spots etc.
}

export function classifyDmLocally(
  text: string,
  ctx: DmContext
): DmL1Decision {
  const trimmed = text.trim();
  if (!trimmed)
    return { action: "block", reason: "Empty message." };
  if (trimmed.length > 2000)
    return {
      action: "block",
      reason: "Keep it under 2000 characters.",
    };

  if (detectHateSpeech(trimmed)) {
    return {
      action: "block",
      reason:
        "That message contains language we can't allow. Late Push is for everyone.",
    };
  }

  const piiHits = detectPii(trimmed);
  if (piiHits.length > 0) {
    // If the message references a known spot AND the only PII match is an
    // address pattern, give it the benefit of the doubt. "Meet at 123 Main
    // St near Lynch" is legit coordination; the raw regex would flag the
    // street number, but the LLM will catch it in Layer 2 if it's wrong.
    if (piiHits.length === 1 && piiHits[0] === "address") {
      if (mentionsKnownSpot(trimmed, ctx.extraSpotNames)) {
        return { action: "send" };
      }
    }

    const labels = piiHits
      .map((h: PiiHit) => PII_LABELS[h])
      .join(", ");
    const piiReason = `Looks like this contains ${labels}. Late Push keeps things alias-only for safety.`;

    if (ctx.trust === "stranger") {
      return { action: "block", reason: piiReason };
    }
    if (ctx.trust === "friend") {
      return {
        action: "warn",
        reason: `${piiReason} Send anyway?`,
      };
    }
    // Trusted friend: allow through silently, L2 still classifies.
    return { action: "send" };
  }

  return { action: "send" };
}
