import { Badge, TrickProgress, STATUS_RANK } from "./types";
import { TRICKS, TIERS } from "./curriculum";

export const BADGES: Badge[] = [
  {
    id: "geared-up",
    name: "Geared Up",
    tier: 0,
    description:
      "You know your board, your gear, and your stance. You're not winging it. Welcome.",
    icon: "🛹",
  },
  {
    id: "board-comfortable",
    name: "Board Comfortable",
    tier: 1,
    description:
      "You can push, ride, turn, and stop. You can handle real ground. The hard part is over.",
    icon: "🌱",
  },
  {
    id: "maneuverer",
    name: "Maneuverer",
    tier: 2,
    description:
      "Kickturns, manuals, fakie, pumping. You're not just rolling — you're skating.",
    icon: "🌀",
  },
  {
    id: "trick-learner",
    name: "Trick Learner",
    tier: 3,
    description:
      "You've got first tricks under your belt. Ollie. 180s. The fun stuff is just getting started.",
    icon: "✨",
  },
  {
    id: "intermediate-skater",
    name: "Intermediate Skater",
    tier: 4,
    description:
      "Flips. Grinds. Transition. You're a real skater. There's no debate.",
    icon: "🔥",
  },
];

const LANDED_ONCE_RANK = STATUS_RANK.landed_once;

export function isBadgeEarned(
  tier: number,
  trickProgress: Record<string, TrickProgress>
): boolean {
  const tierTricks = TRICKS.filter((t) => t.tier === tier);
  if (tierTricks.length === 0) return false;
  return tierTricks.every((trick) => {
    const status = trickProgress[trick.id]?.status;
    if (!status) return false;
    return STATUS_RANK[status] >= LANDED_ONCE_RANK;
  });
}

export function getEarnedBadges(
  trickProgress: Record<string, TrickProgress>
): Badge[] {
  return BADGES.filter((b) => isBadgeEarned(b.tier, trickProgress));
}

export function getNextBadge(
  trickProgress: Record<string, TrickProgress>
): { badge: Badge; tricksRemaining: number; totalTricks: number } | null {
  for (const badge of BADGES) {
    if (!isBadgeEarned(badge.tier, trickProgress)) {
      const tierTricks = TRICKS.filter((t) => t.tier === badge.tier);
      const earned = tierTricks.filter((t) => {
        const s = trickProgress[t.id]?.status;
        return s && STATUS_RANK[s] >= LANDED_ONCE_RANK;
      }).length;
      return {
        badge,
        tricksRemaining: tierTricks.length - earned,
        totalTricks: tierTricks.length,
      };
    }
  }
  return null;
}

export function getBadgeProgress(
  tier: number,
  trickProgress: Record<string, TrickProgress>
): { earned: number; total: number; pct: number } {
  const tierTricks = TRICKS.filter((t) => t.tier === tier);
  const total = tierTricks.length;
  const earned = tierTricks.filter((t) => {
    const s = trickProgress[t.id]?.status;
    return s && STATUS_RANK[s] >= LANDED_ONCE_RANK;
  }).length;
  return { earned, total, pct: total === 0 ? 0 : Math.round((earned / total) * 100) };
}

export function getTierByNumber(tier: number) {
  return TIERS.find((t) => t.number === tier);
}
