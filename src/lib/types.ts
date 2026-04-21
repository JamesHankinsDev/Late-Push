export type TrickStatus =
  | "locked"
  | "not_started"
  | "practicing"
  | "landed_once"
  | "consistent"
  | "mastered";

export type InjuryRisk = "low" | "medium" | "high";
export type BodyFeel = "fine" | "sore" | "injured";
export type SurfaceQuality = "smooth" | "rough" | "cracked" | "mixed";

export interface DrillItem {
  t: string; // task line
  s: string; // subtitle / context
}

export interface StepItem {
  t: string; // phase title (e.g. "Stance")
  p: string; // detail paragraph
}

export interface Trick {
  id: string;
  name: string;
  tier: number; // 0-4
  description: string;
  difficulty: number; // 1-10
  prerequisites: string[]; // trick IDs
  injuryRisk: InjuryRisk;
  searchQuery: string; // YouTube search query
  tips: string[];
  estimatedAdultLearningTime?: string; // e.g. "2-4 weeks", "1-3 sessions"
  drill?: DrillItem[]; // per-trick drill steps shown on the Lesson page
  steps?: StepItem[]; // mechanical phases — only authored for physical tricks
}

export interface TrickProgress {
  trickId: string;
  status: TrickStatus;
  firstLandedDate?: string;
  consistentDate?: string;
  masteredDate?: string;
  attempts: number;
  notes: string;
}

export interface Badge {
  id: string;
  name: string;
  tier: number;
  description: string;
  icon: string; // emoji or symbol
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  date: string;
  duration: number; // minutes
  location?: string;
  lat?: number;
  lng?: number;
  tricksPracticed: string[]; // trick IDs
  whatClicked: string;
  whatDidnt: string;
  bodyFeel: BodyFeel;
  injuryNotes?: string;
  surfaceQuality?: SurfaceQuality;
  weather?: WeatherData;
  coachResponse?: string;
  createdAt: string;
}

export interface WeatherData {
  temperature: number; // Fahrenheit
  precipitation: number; // mm
  windSpeed: number; // mph
  humidity: number; // percentage
  description: string;
  skateScore: number; // 0-100
}

export type Stance = "regular" | "goofy" | "switch" | "unsure";

// =============================================================
// Social / privacy
// =============================================================

export type ContactGroup = "none" | "friends" | "everyone";

export interface PrivacySettings {
  // Master switch — off means you don't exist to other users anywhere.
  socialEnabled: boolean;

  // Discovery surfaces — where you show up
  discoverableInNearby: boolean;
  discoverableInLeaderboard: boolean;
  profileLookupByHandle: boolean;

  // Location — never precise GPS, always home-spot anchored
  shareHomeSpot: boolean; // if false, Nearby matching is disabled entirely

  // Contact permissions
  dmsFrom: ContactGroup;
  friendRequestsFrom: ContactGroup | "tier-matches";
  crewInvitesFrom: ContactGroup;
}

export interface PublicProfile {
  uid: string;
  alias: string; // display-cased
  aliasLower: string; // lowercase for lookup/uniqueness
  aliasColor: string; // hex
  currentTier: number;
  daysAsMember: number;
  landedCount: number;
  workingOn: string[]; // trick names with status === "practicing"
  earnedBadges: string[]; // badge ids
  homeSpotId?: string;
  homeSpotName?: string;
  homeSpotLat?: number;
  homeSpotLng?: number;
  goals?: string[];
  vibe?: string[];
  privacy: Pick<
    PrivacySettings,
    | "socialEnabled"
    | "discoverableInNearby"
    | "discoverableInLeaderboard"
    | "profileLookupByHandle"
    | "dmsFrom"
    | "friendRequestsFrom"
    | "crewInvitesFrom"
  >;
  updatedAt: string;
}

export interface AliasDoc {
  uid: string;
  claimedAt: string;
}

export interface Block {
  id?: string;
  blockerUid: string;
  blockedUid: string;
  createdAt: string;
}

export type FriendshipStatus = "pending" | "accepted";
export type TrustLevel = "stranger" | "friend" | "trusted";

export interface Friendship {
  id: string; // composite: `${minUid}__${maxUid}`
  userA: string; // lexicographically smaller uid
  userB: string; // lexicographically larger uid
  aliasA?: string; // denormalized at request time for listing
  aliasB?: string;
  aliasColorA?: string;
  aliasColorB?: string;
  status: FriendshipStatus;
  initiatedBy: string; // uid that sent the original request
  createdAt: string;
  acceptedAt?: string;
  messageCount?: number; // updated by DMs (phase 7F)
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  currentTier: number;
  trickProgress: Record<string, TrickProgress>;
  badges?: UserBadge[];

  // Onboarding fields — populated by the /onboarding flow, grandfathered
  // in for legacy profiles with existing trick progress.
  onboardedAt?: string;
  stance?: Stance;
  goals?: string[];
  vibe?: string[];
  bio?: string;

  // Social — opt-in surfaces. Defaults applied on read if absent.
  alias?: string; // display-cased
  aliasLower?: string; // canonical lookup key
  aliasColor?: string;
  aliasChangedAt?: string;
  homeSpotId?: string;
  homeSpotName?: string; // denormalized for display + publicProfile sync
  homeSpotLat?: number;
  homeSpotLng?: number;
  nearbyRadiusMi?: number; // default 5
  privacy?: PrivacySettings;
}

export type SpotSource = "osm" | "seed" | "user";

export interface SkateSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance?: number;
  type: string;
  surface?: string;
  beginnerFriendly: boolean;
  tags: string[];
  source?: SpotSource;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export interface YouTubeCache {
  query: string;
  videos: YouTubeVideo[];
  cachedAt: string;
}

// Status helpers — used for ranking and comparison
export const STATUS_RANK: Record<TrickStatus, number> = {
  locked: 0,
  not_started: 1,
  practicing: 2,
  landed_once: 3,
  consistent: 4,
  mastered: 5,
};

export const STATUS_LABELS: Record<TrickStatus, string> = {
  locked: "Locked",
  not_started: "Not Started",
  practicing: "Practicing",
  landed_once: "Landed Once",
  consistent: "Consistent",
  mastered: "Mastered",
};
