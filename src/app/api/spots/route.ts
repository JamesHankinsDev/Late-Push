import { NextRequest, NextResponse } from "next/server";
import { findSkateSpots } from "@/lib/sources/spots";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  const radius = req.nextUrl.searchParams.get("radius") ?? "10000";

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat/lng parameters" },
      { status: 400 }
    );
  }

  try {
    const spots = await findSkateSpots(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius)
    );
    return NextResponse.json({ spots });
  } catch (error) {
    console.error("Spots API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spots" },
      { status: 500 }
    );
  }
}
