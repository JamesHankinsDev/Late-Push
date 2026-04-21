import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import { PublicProfile, UserProfile } from "../types";
import { computePublicProfile } from "../social/publicProfile";
import { blockedUidsFor } from "./blocks";

function pubCol() {
  return collection(getFirebaseDb(), "publicProfiles");
}

/**
 * Write the current public view of `profile` to publicProfiles/{uid}.
 * If the user has socialEnabled = false, delete the doc instead so that
 * privacy-rules-scoped reads return nothing.
 */
export async function syncPublicProfile(
  profile: UserProfile
): Promise<void> {
  const ref = doc(pubCol(), profile.uid);
  const pub = computePublicProfile(profile);

  if (!pub.privacy.socialEnabled || !pub.alias) {
    // Idempotent: deleteDoc is a no-op if the doc doesn't exist.
    // Don't pre-read — the read rule uses resource.data which is null
    // for non-existent docs and would require an extra owner-only branch.
    await deleteDoc(ref).catch(() => {
      /* swallow — doc may not exist, which is the expected state */
    });
    return;
  }

  await setDoc(ref, stripUndefined(pub as unknown as Record<string, unknown>));
}

export async function getPublicProfile(
  uid: string
): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(pubCol(), uid));
  if (!snap.exists()) return null;
  return snap.data() as PublicProfile;
}

/**
 * Resolve an alias (case-insensitive) to a public profile. Respects the
 * target's `profileLookupByHandle` privacy flag — returns null if they've
 * opted out of alias search even if the alias exists. Also returns null
 * when the viewer has blocked (or been blocked by) the target.
 */
export async function findPublicProfileByAlias(
  alias: string,
  viewerUid: string
): Promise<PublicProfile | null> {
  const { getUidForAlias } = await import("./aliases");
  const uid = await getUidForAlias(alias);
  if (!uid) return null;
  if (uid === viewerUid) return null;

  const [pub, blocked] = await Promise.all([
    getPublicProfile(uid),
    blockedUidsFor(viewerUid),
  ]);
  if (!pub) return null;
  if (!pub.privacy.socialEnabled) return null;
  if (!pub.privacy.profileLookupByHandle) return null;
  if (blocked.has(uid)) return null;

  return pub;
}

/**
 * Fetch Nearby candidates: other users whose home spot is within `radiusMi`
 * of the viewer's home spot, who are discoverable, and who haven't been
 * blocked either direction. Excludes self.
 *
 * Distance uses homeSpotLat/homeSpotLng stored on each public profile —
 * resolved at the moment the user picked their home spot, so it works for
 * both seed and OSM spots without a runtime lookup table.
 *
 * In-memory filter over publicProfiles is fine for MVP scale. Switch to
 * geohashing when the user base grows past a few thousand.
 */
export async function fetchNearby(options: {
  viewerUid: string;
  viewerLat: number | undefined;
  viewerLng: number | undefined;
  radiusMi: number;
}): Promise<(PublicProfile & { homeSpotDistanceMi: number })[]> {
  const { viewerUid, viewerLat, viewerLng, radiusMi } = options;
  if (viewerLat === undefined || viewerLng === undefined) return [];

  const q = query(
    pubCol(),
    where("privacy.socialEnabled", "==", true),
    where("privacy.discoverableInNearby", "==", true)
  );
  const snap = await getDocs(q);
  const candidates = snap.docs
    .map((d) => d.data() as PublicProfile)
    .filter((p) => p.uid !== viewerUid)
    .filter((p) => p.homeSpotLat !== undefined && p.homeSpotLng !== undefined);

  const blocked = await blockedUidsFor(viewerUid);

  return candidates
    .map((p) => {
      if (blocked.has(p.uid)) return null;
      const miles = haversineMiles(
        viewerLat,
        viewerLng,
        p.homeSpotLat!,
        p.homeSpotLng!
      );
      if (miles > radiusMi) return null;
      return {
        ...p,
        homeSpotDistanceMi: Math.round(miles * 10) / 10,
      };
    })
    .filter((x): x is PublicProfile & { homeSpotDistanceMi: number } => x !== null)
    .sort((a, b) => a.homeSpotDistanceMi - b.homeSpotDistanceMi);
}

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const toRad = (d: number) => (d * Math.PI) / 180;
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

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = stripUndefined(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

