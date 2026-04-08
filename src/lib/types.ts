export type TrickStatus = "locked" | "in_progress" | "landed";
export type InjuryRisk = "low" | "medium" | "high";
export type BodyFeel = "fine" | "sore" | "injured";
export type SurfaceQuality = "smooth" | "rough" | "cracked" | "mixed";

export interface Trick {
  id: string;
  name: string;
  stage: number;
  description: string;
  difficulty: number; // 1-10
  prerequisites: string[]; // trick IDs
  injuryRisk: InjuryRisk;
  searchQuery: string; // YouTube search query
  tips: string[];
}

export interface TrickProgress {
  trickId: string;
  status: TrickStatus;
  landedDate?: string;
  attempts: number;
  notes: string;
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
  currentStage: number;
  trickProgress: Record<string, TrickProgress>;
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
