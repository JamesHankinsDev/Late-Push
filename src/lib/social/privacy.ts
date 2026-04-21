import { PrivacySettings } from "@/lib/types";

// Default state: invisible. A new user doesn't exist to anyone else until
// they explicitly turn on social and choose what to share.
export function defaultPrivacy(): PrivacySettings {
  return {
    socialEnabled: false,
    discoverableInNearby: false,
    discoverableInLeaderboard: false,
    profileLookupByHandle: false,
    shareHomeSpot: false,
    dmsFrom: "none",
    friendRequestsFrom: "none",
    crewInvitesFrom: "none",
  };
}

export function mergePrivacy(
  existing: PrivacySettings | undefined
): PrivacySettings {
  return { ...defaultPrivacy(), ...(existing ?? {}) };
}
