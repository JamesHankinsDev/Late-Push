import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeVideos } from "@/lib/sources/youtube";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const videos = await searchYouTubeVideos(query, 5);
    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
