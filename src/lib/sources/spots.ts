import { SkateSpot } from "../types";

export async function findSkateSpots(
  lat: number,
  lng: number,
  radiusMeters: number = 10000
): Promise<SkateSpot[]> {
  const query = `
    [out:json][timeout:25];
    (
      nwr["leisure"="skatepark"](around:${radiusMeters},${lat},${lng});
      nwr["sport"="skateboard"](around:${radiusMeters},${lat},${lng});
      nwr["leisure"="pitch"]["sport"="skateboard"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status}`);
  }

  const data = await res.json();

  return data.elements
    .map((el: Record<string, unknown>) => {
      const elLat = (el.lat as number) ?? (el.center as { lat: number })?.lat;
      const elLng = (el.lon as number) ?? (el.center as { lon: number })?.lon;
      if (!elLat || !elLng) return null;

      const tags = (el.tags ?? {}) as Record<string, string>;
      const baseName = tags.name
        || tags["name:en"]
        || tags.description
        || (tags["addr:street"] ? `Spot on ${tags["addr:street"]}` : null)
        || (tags.leisure === "skatepark" ? "Skatepark" : "Skate Spot");
      const name = tags["addr:city"] && !baseName.includes(tags["addr:city"])
        ? `${baseName} — ${tags["addr:city"]}`
        : baseName;
      const surface = tags.surface || undefined;

      const distance = haversineDistance(lat, lng, elLat, elLng);

      const beginnerFriendly = isBeginnerFriendly(tags);

      return {
        id: `osm-${el.id}`,
        name,
        lat: elLat,
        lng: elLng,
        distance: Math.round(distance * 10) / 10,
        type: tags.leisure || "skatepark",
        surface,
        beginnerFriendly,
        tags: Object.entries(tags)
          .filter(([k]) => ["surface", "lit", "access", "wheelchair", "opening_hours", "fee", "operator", "website"].includes(k))
          .map(([k, v]) => `${k}: ${v}`),
      } as SkateSpot;
    })
    .filter((s: SkateSpot | null): s is SkateSpot => s !== null)
    .sort((a: SkateSpot, b: SkateSpot) => (a.distance ?? 999) - (b.distance ?? 999));
}

function isBeginnerFriendly(tags: Record<string, string>): boolean {
  const name = (tags.name || "").toLowerCase();
  const desc = (tags.description || "").toLowerCase();
  const combined = `${name} ${desc}`;

  if (combined.includes("beginner") || combined.includes("mini") || combined.includes("mellow")) {
    return true;
  }
  // Dedicated skateparks are generally more beginner-friendly than street spots
  if (tags.leisure === "skatepark" || tags.leisure === "pitch") {
    return true;
  }
  return false;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
