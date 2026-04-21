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

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  currentTier: number;
  trickProgress: Record<string, TrickProgress>;
  badges?: UserBadge[];
}

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
