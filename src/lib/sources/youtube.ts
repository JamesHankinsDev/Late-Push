import { YouTubeVideo, YouTubeCache } from "../types";

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory cache (persisted per server instance; Firestore cache in API route for durability)
const memoryCache = new Map<string, YouTubeCache>();

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  // Check memory cache
  const cached = memoryCache.get(query);
  if (cached && Date.now() - new Date(cached.cachedAt).getTime() < CACHE_DURATION_MS) {
    return cached.videos;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY not set, returning empty results");
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: maxResults.toString(),
    key: apiKey,
    videoDuration: "medium",
    relevanceLanguage: "en",
    safeSearch: "moderate",
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );

  if (!res.ok) {
    console.error("YouTube API error:", res.status, await res.text());
    return cached?.videos ?? [];
  }

  const data = await res.json();

  const videos: YouTubeVideo[] = (data.items ?? []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: { medium: { url: string } };
        channelTitle: string;
      };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    })
  );

  const cacheEntry: YouTubeCache = {
    query,
    videos,
    cachedAt: new Date().toISOString(),
  };
  memoryCache.set(query, cacheEntry);

  return videos;
}
