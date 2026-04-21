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

export type CrewVisibility = "public" | "invite-only";
export type CrewRole = "owner" | "member";

export interface Crew {
  id: string;
  name: string;
  tag: string; // 2–5 char short code
  color: string; // hex; user-picked from brand palette
  description: string;
  createdBy: string;
  createdAt: string;
  visibility: CrewVisibility;
  meetingCadence?: string; // e.g. "Sat 9am"
  levelRange?: string; // e.g. "T1-T3"
  memberCount: number; // denormalized; updated on join/leave
}

export interface CrewMembership {
  id: string; // `${crewId}__${uid}`
  crewId: string;
  uid: string;
  alias?: string;
  aliasColor?: string;
  role: CrewRole;
  joinedAt: string;
  invitedBy?: string;
}

export interface CrewInvite {
  id: string; // `${crewId}__${inviteeUid}`
  crewId: string;
  inviteeUid: string;
  inviteeAlias?: string;
  invitedBy: string; // uid
  inviterAlias?: string;
  crewName?: string; // denormalized for listing
  crewTag?: string;
  crewColor?: string;
  createdAt: string;
}

export type MeetupVisibility = "public" | "crew-only";
export type RsvpStatus = "going" | "maybe" | "not-going";

export interface Meetup {
  id: string;
  title: string;
  focus: string; // what the session is about
  hostUid: string;
  hostAlias: string; // denormalized
  hostAliasColor?: string;
  crewId?: string; // optional crew scope
  crewName?: string; // denormalized if crew-scoped
  crewTag?: string;
  crewColor?: string;
  spotId: string;
  spotName: string;
  spotLat: number;
  spotLng: number;
  date: string; // ISO "YYYY-MM-DD"
  time?: string; // free-text like "6:30 PM"
  visibility: MeetupVisibility;
  goingCount: number; // denormalized from RSVPs
  createdAt: string;
}

export interface MeetupRsvp {
  id: string; // `${meetupId}__${uid}`
  meetupId: string;
  uid: string;
  alias?: string;
  aliasColor?: string;
  status: RsvpStatus;
  createdAt: string;
}

export type PostVisibility = "public" | "friends" | "only-me";
export type PostStamp = "LANDED" | "PROGRESS" | "BAILED" | "FIRST";
export type ReactionType = "push" | "same" | "fire";

export interface Post {
  id: string;
  authorUid: string;
  authorAlias: string;
  authorAliasColor?: string;
  body: string;
  sessionRef?: string; // optional session.id this post was shared from
  trickRef?: string; // optional trick.id highlighted
  trickName?: string; // denormalized
  stamp?: PostStamp;
  visibility: PostVisibility;
  reactionCounts: {
    push: number;
    same: number;
    fire: number;
  };
  commentCount: number;
  createdAt: string;
}

export interface PostReaction {
  id: string; // `${postId}__${uid}`
  postId: string;
  uid: string;
  alias?: string;
  type: ReactionType;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorUid: string;
  authorAlias: string;
  authorAliasColor?: string;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string; // pairId(userA, userB) — sorted
  userA: string;
  userB: string;
  aliasA: string;
  aliasB: string;
  aliasColorA?: string;
  aliasColorB?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageBy?: string;
  messageCount: number;
  createdAt: string;
}

export type MessageFlag =
  | "safe"
  | "pii_ask"
  | "platform_move"
  | "pressure"
  | "harassment"
  | "hate_speech"
  | "explicit";

export interface DmMessage {
  id: string;
  conversationId: string;
  authorUid: string;
  authorAlias: string;
  authorAliasColor?: string;
  body: string;
  sentAt: string;
  flag?: MessageFlag; // set by Layer 2 classifier if non-safe
  flagReason?: string; // optional human-readable reason
}

export interface LivePresence {
  uid: string;
  alias: string;
  aliasColor?: string;
  spotId?: string;
  spotName?: string;
  startedAt: string;
  expiresAt: string; // ISO; client clears when user stops
}

export interface ModerationReport {
  id?: string;
  reporterUid: string;
  targetUid?: string;
  messageId?: string;
  conversationId?: string;
  postId?: string;
  commentId?: string;
  kind: "dm" | "post" | "comment" | "profile";
  reason: string;
  classification?: MessageFlag;
  createdAt: string;
}

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
