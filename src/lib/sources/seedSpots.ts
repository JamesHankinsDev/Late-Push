import { SkateSpot } from "../types";

// Curated list of well-known skateparks so the map isn't empty for first-time
// users in cities where OpenStreetMap coverage is spotty. Boston metro gets
// heavy representation since that's the primary test region.
//
// Each seed spot is tagged `source: "seed"` so the UI can distinguish curated
// from OSM results. Coordinates are best-effort approximations — accurate
// enough for "there's a park near you" but not surveyor-grade.

export const SEED_SPOTS: SkateSpot[] = [
  // ============ Boston metro ============
  {
    id: "seed-lynch-cambridge",
    name: "Lynch Family Skatepark",
    lat: 42.3681,
    lng: -71.0758,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "flow", "bowl", "street", "free"],
    source: "seed",
  },
  {
    id: "seed-roxbury-boston",
    name: "Melnea Cass Skatepark",
    lat: 42.3367,
    lng: -71.0759,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "street", "free", "boston"],
    source: "seed",
  },
  {
    id: "seed-waltham-ma",
    name: "Waltham Skatepark",
    lat: 42.3760,
    lng: -71.2357,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "street", "free"],
    source: "seed",
  },
  {
    id: "seed-peabody-ma",
    name: "Peabody Skatepark",
    lat: 42.5279,
    lng: -70.9286,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "street", "free"],
    source: "seed",
  },
  {
    id: "seed-newton-ma",
    name: "Newton Skatepark (Albemarle)",
    lat: 42.3486,
    lng: -71.2148,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "beginner", "mellow", "free"],
    source: "seed",
  },
  {
    id: "seed-northampton-ma",
    name: "Northampton Skatepark",
    lat: 42.3300,
    lng: -72.6344,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "flow", "free"],
    source: "seed",
  },
  {
    id: "seed-rye-nh",
    name: "Rye Airfield Skatepark",
    lat: 42.9964,
    lng: -70.8144,
    type: "skatepark",
    surface: "wood",
    beginnerFriendly: true,
    tags: ["indoor", "transition", "ramps", "lessons", "fee"],
    source: "seed",
  },
  {
    id: "seed-providence-ri",
    name: "Providence Skatepark",
    lat: 41.8014,
    lng: -71.4110,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "street", "flow", "free"],
    source: "seed",
  },

  // ============ Northeast ============
  {
    id: "seed-les-coleman-nyc",
    name: "LES Coleman Oval",
    lat: 40.7111,
    lng: -73.9909,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: false,
    tags: ["concrete", "bowl", "street", "iconic", "free"],
    source: "seed",
  },
  {
    id: "seed-pier62-nyc",
    name: "Pier 62 Skatepark",
    lat: 40.7486,
    lng: -74.0087,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "flow", "hudson-river", "free"],
    source: "seed",
  },
  {
    id: "seed-fdr-philly",
    name: "FDR Skatepark",
    lat: 39.9003,
    lng: -75.1844,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: false,
    tags: ["concrete", "diy", "bowl", "iconic", "free"],
    source: "seed",
  },
  {
    id: "seed-paines-philly",
    name: "Paine's Park",
    lat: 39.9661,
    lng: -75.1833,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "plaza", "street", "free"],
    source: "seed",
  },

  // ============ Midwest + South ============
  {
    id: "seed-louisville-ky",
    name: "Louisville Extreme Park",
    lat: 38.2563,
    lng: -85.7504,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "full-pipe", "24-hour", "free"],
    source: "seed",
  },
  {
    id: "seed-spot-tampa",
    name: "Skatepark of Tampa (SPoT)",
    lat: 27.9517,
    lng: -82.4588,
    type: "skatepark",
    surface: "wood",
    beginnerFriendly: true,
    tags: ["indoor", "street", "contests", "lessons", "fee"],
    source: "seed",
  },
  {
    id: "seed-kona-jax",
    name: "Kona Skatepark",
    lat: 30.3208,
    lng: -81.7237,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "snake-run", "historic", "fee"],
    source: "seed",
  },

  // ============ West Coast ============
  {
    id: "seed-venice-ca",
    name: "Venice Beach Skatepark",
    lat: 33.9876,
    lng: -118.4745,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: false,
    tags: ["concrete", "bowl", "snake-run", "ocean-view", "free", "iconic"],
    source: "seed",
  },
  {
    id: "seed-stoner-la",
    name: "Stoner Skate Plaza",
    lat: 34.0403,
    lng: -118.4539,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "plaza", "street", "free"],
    source: "seed",
  },
  {
    id: "seed-lake-cunningham-sj",
    name: "Lake Cunningham Skate Park",
    lat: 37.3337,
    lng: -121.7855,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "vert", "free", "largest-in-us"],
    source: "seed",
  },
  {
    id: "seed-linda-vista-sd",
    name: "Linda Vista Skate Park",
    lat: 32.7766,
    lng: -117.1563,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "street", "free"],
    source: "seed",
  },
  {
    id: "seed-burnside-pdx",
    name: "Burnside Skatepark",
    lat: 45.5260,
    lng: -122.6658,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: false,
    tags: ["concrete", "diy", "bowl", "transition", "iconic", "free"],
    source: "seed",
  },
  {
    id: "seed-lincoln-city-or",
    name: "Lincoln City Skatepark",
    lat: 44.9595,
    lng: -124.0177,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "bowl", "snake-run", "free"],
    source: "seed",
  },

  // ============ Mountain ============
  {
    id: "seed-denver-co",
    name: "Denver Skate Park",
    lat: 39.7588,
    lng: -105.0094,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "street", "bowl", "free"],
    source: "seed",
  },

  // ============ International ============
  {
    id: "seed-southbank-london",
    name: "Southbank Undercroft",
    lat: 51.5070,
    lng: -0.1156,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: false,
    tags: ["concrete", "street", "diy", "iconic", "free"],
    source: "seed",
  },
  {
    id: "seed-macba-barcelona",
    name: "MACBA (Plaça dels Àngels)",
    lat: 41.3833,
    lng: 2.1674,
    type: "plaza",
    surface: "marble",
    beginnerFriendly: false,
    tags: ["plaza", "street", "marble", "iconic", "free"],
    source: "seed",
  },
  {
    id: "seed-shanghai-smp",
    name: "SMP Skatepark",
    lat: 31.2464,
    lng: 121.4914,
    type: "skatepark",
    surface: "concrete",
    beginnerFriendly: true,
    tags: ["concrete", "largest-in-world", "contests", "fee"],
    source: "seed",
  },
];

/**
 * Filter seed spots to those within `radiusMeters` of (lat, lng), sorted
 * by distance ascending. Returns spots with a computed `distance` (in miles).
 */
export function findSeedSpotsNear(
  lat: number,
  lng: number,
  radiusMeters: number
): SkateSpot[] {
  const radiusMi = radiusMeters / 1609.344;
  return SEED_SPOTS.map((s) => ({
    ...s,
    distance:
      Math.round(haversineMiles(lat, lng, s.lat, s.lng) * 10) / 10,
  }))
    .filter((s) => (s.distance ?? Infinity) <= radiusMi)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
