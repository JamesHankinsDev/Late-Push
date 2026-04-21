import { PrivacySettings, PublicProfile, UserProfile } from "@/lib/types";
import { TRICKS } from "@/lib/curriculum";
import { daysSince } from "@/lib/stats";
import { mergePrivacy } from "./privacy";

/**
 * Compute the public-facing view of a user. This is what other users will
 * see via the publicProfiles/{uid} doc. Never includes displayName, email,
 * bio, or anything else that could leak real-world identity.
 *
 * The result's `privacy` field is a sub-projection containing only the
 * flags relevant to other users' queries (e.g. "can I DM this person?").
 */
export function computePublicProfile(profile: UserProfile): PublicProfile {
  const privacy: PrivacySettings = mergePrivacy(profile.privacy);

  const workingOn = TRICKS
    .filter((t) => profile.trickProgress?.[t.id]?.status === "practicing")
    .map((t) => t.name);

  const landedCount = Object.values(profile.trickProgress ?? {}).filter((p) =>
    ["landed_once", "consistent", "mastered"].includes(p.status)
  ).length;

  const earnedBadges = (profile.badges ?? []).map((b) => b.badgeId);

  return {
    uid: profile.uid,
    alias: profile.alias ?? "",
    aliasLower: profile.aliasLower ?? "",
    aliasColor: profile.aliasColor ?? "#f5d400",
    currentTier: profile.currentTier ?? 0,
    daysAsMember: daysSince(profile.createdAt),
    landedCount,
    workingOn,
    earnedBadges,
    homeSpotId: privacy.shareHomeSpot ? profile.homeSpotId : undefined,
    homeSpotName: privacy.shareHomeSpot ? profile.homeSpotName : undefined,
    homeSpotLat: privacy.shareHomeSpot ? profile.homeSpotLat : undefined,
    homeSpotLng: privacy.shareHomeSpot ? profile.homeSpotLng : undefined,
    goals: privacy.socialEnabled ? profile.goals : undefined,
    vibe: privacy.socialEnabled ? profile.vibe : undefined,
    privacy: {
      socialEnabled: privacy.socialEnabled,
      discoverableInNearby: privacy.discoverableInNearby,
      discoverableInLeaderboard: privacy.discoverableInLeaderboard,
      profileLookupByHandle: privacy.profileLookupByHandle,
      dmsFrom: privacy.dmsFrom,
      friendRequestsFrom: privacy.friendRequestsFrom,
      crewInvitesFrom: privacy.crewInvitesFrom,
    },
    updatedAt: new Date().toISOString(),
  };
}
