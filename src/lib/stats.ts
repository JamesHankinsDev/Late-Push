import { Session, STATUS_RANK, Trick, TrickProgress, TrickStatus } from "./types";
import { TRICKS, isTrickUnlockable, getEffectiveStatus } from "./curriculum";

export function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let count = 0;
  let cursor = new Date();
  for (const s of sorted) {
    const d = new Date(s.date);
    const daysDiff = Math.floor(
      (cursor.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    // A session counts toward the streak if it's within a week of the last counted one.
    if (daysDiff <= 7) {
      count++;
      cursor = d;
    } else {
      break;
    }
  }
  return count;
}

export function daysSince(iso: string | undefined): number {
  if (!iso) return 0;
  const start = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

/**
 * Pick the most actionable trick for the user's current session.
 * Priority: practicing > unlockable not_started (current tier) > any unlockable.
 */
export function pickActiveTrick(
  trickProgress: Record<string, TrickProgress>,
  currentTier: number
): Trick | undefined {
  const statusOf = (id: string): TrickStatus =>
    getEffectiveStatus(id, trickProgress);

  const inTier = TRICKS.filter((t) => t.tier === currentTier);

  const practicing = inTier.find((t) => statusOf(t.id) === "practicing");
  if (practicing) return practicing;

  const unlockableOpen = inTier.find((t) => {
    const s = statusOf(t.id);
    return (s === "not_started" || s === undefined) && isTrickUnlockable(t.id, trickProgress);
  });
  if (unlockableOpen) return unlockableOpen;

  // Fallback: first unlockable not-yet-landed trick anywhere.
  return TRICKS.find((t) => {
    const s = statusOf(t.id);
    return STATUS_RANK[s] < STATUS_RANK.landed_once && isTrickUnlockable(t.id, trickProgress);
  });
}

export interface BodyTrend {
  label: string;
  tone: "mint" | "hazard" | "coral" | "brick";
  warning: boolean;
  note?: string;
}

export function computeBodyTrend(sessions: Session[]): BodyTrend {
  const recent = sessions.slice(0, 10);
  if (recent.length === 0) {
    return { label: "No data yet", tone: "mint", warning: false };
  }
  const sore = recent.filter((s) => s.bodyFeel === "sore").length;
  const injured = recent.filter((s) => s.bodyFeel === "injured").length;
  if (injured >= 2)
    return {
      label: "Take it easy",
      tone: "brick",
      warning: true,
      note: "Two injury-flagged sessions recently. Rest day.",
    };
  if (sore >= 3)
    return {
      label: "Getting beat up",
      tone: "coral",
      warning: true,
      note: "Three sore sessions out of ten. Ease off or skate shorter.",
    };
  if (sore >= 1)
    return { label: "Normal wear", tone: "hazard", warning: false };
  return { label: "Feeling good", tone: "mint", warning: false };
}
