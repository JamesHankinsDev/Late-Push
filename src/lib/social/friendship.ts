import { Friendship, PublicProfile, TrustLevel } from "@/lib/types";

/**
 * Stable, composite doc ID for a pair of users. Sorting ensures both
 * sides compute the same key, so a friendship is a single doc — not two.
 */
export function pairId(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

/** Returns [userA, userB] sorted. */
export function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** The "other" uid in a friendship, relative to the viewer. */
export function otherUid(f: Friendship, viewerUid: string): string {
  return f.userA === viewerUid ? f.userB : f.userA;
}

export function otherAlias(f: Friendship, viewerUid: string): string {
  return f.userA === viewerUid ? (f.aliasB ?? "") : (f.aliasA ?? "");
}

export function otherAliasColor(
  f: Friendship,
  viewerUid: string
): string | undefined {
  return f.userA === viewerUid ? f.aliasColorB : f.aliasColorA;
}

/**
 * Trust tier — relaxes DM moderation as the friendship matures.
 *
 * - stranger: not friends, or pending
 * - friend:   accepted < 14 days
 * - trusted:  accepted >= 14 days AND messageCount >= 10
 *
 * Message count will arrive when DMs ship in phase 7F; until then,
 * every accepted friendship tops out at "friend" regardless of age.
 */
const TRUSTED_MIN_DAYS = 14;
const TRUSTED_MIN_MESSAGES = 10;

export function computeTrustLevel(
  f: Friendship | null | undefined,
  opts?: { requireMessages?: boolean }
): TrustLevel {
  if (!f || f.status !== "accepted") return "stranger";
  const acceptedAt = f.acceptedAt ? new Date(f.acceptedAt).getTime() : Date.now();
  const days = Math.floor((Date.now() - acceptedAt) / (1000 * 60 * 60 * 24));
  if (days < TRUSTED_MIN_DAYS) return "friend";
  // When we don't yet track message counts, stay at "friend" — we only
  // promote to trusted once both conditions are provably met.
  if (opts?.requireMessages === false) return "friend";
  if ((f.messageCount ?? 0) < TRUSTED_MIN_MESSAGES) return "friend";
  return "trusted";
}

export type RequestEligibility =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Decide whether `viewer` can send a friend request to `target`. Respects
 * the target's `friendRequestsFrom` privacy setting.
 */
export function canSendFriendRequest(
  viewer: { currentTier: number },
  target: Pick<PublicProfile, "privacy" | "currentTier">,
  existing?: Friendship | null
): RequestEligibility {
  if (existing) {
    if (existing.status === "accepted")
      return { ok: false, reason: "You're already friends." };
    return { ok: false, reason: "A request is already pending." };
  }
  const from = target.privacy.friendRequestsFrom;
  if (from === "none")
    return {
      ok: false,
      reason: "Not accepting friend requests.",
    };
  if (from === "tier-matches" && viewer.currentTier !== target.currentTier)
    return {
      ok: false,
      reason: "Only accepting requests from same-tier skaters.",
    };
  // "friends" on friendRequestsFrom is nonsensical (you're not friends yet),
  // so we treat it the same as "everyone" for request eligibility.
  return { ok: true };
}
