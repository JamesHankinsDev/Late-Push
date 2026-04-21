import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,

} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import { UserProfile, Session, TrickProgress, TrickStatus } from "../types";

/**
 * Firestore rejects `undefined` field values at write time with a runtime
 * error ("Function addDoc() called with invalid data"). Strip them so
 * callers can pass optional fields as `undefined` freely.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

// Migration helper: maps legacy 3-state status to new 5-state status, and
// fills in currentTier from currentStage if needed.
function migrateProfile(raw: Record<string, unknown>): UserProfile {
  const data = { ...raw } as Record<string, unknown>;

  // currentStage → currentTier
  if (data.currentTier == null && data.currentStage != null) {
    data.currentTier = data.currentStage;
  }
  if (data.currentTier == null) data.currentTier = 0;

  // trickProgress status migration
  const trickProgress = (data.trickProgress ?? {}) as Record<
    string,
    Partial<TrickProgress> & { status: string; landedDate?: string }
  >;
  const migratedProgress: Record<string, TrickProgress> = {};
  for (const [trickId, entry] of Object.entries(trickProgress)) {
    let status = entry.status as TrickStatus;
    if ((status as string) === "in_progress") status = "practicing";
    else if ((status as string) === "landed") status = "consistent";

    migratedProgress[trickId] = {
      trickId: entry.trickId ?? trickId,
      status,
      attempts: entry.attempts ?? 0,
      notes: entry.notes ?? "",
      firstLandedDate: entry.firstLandedDate ?? entry.landedDate,
      consistentDate: entry.consistentDate,
      masteredDate: entry.masteredDate,
    };
  }
  data.trickProgress = migratedProgress;

  // Grandfather onboardedAt for legacy profiles that already have real
  // progress — no reason to force them through the new onboarding flow.
  if (
    data.onboardedAt == null &&
    Object.keys(migratedProgress).length > 0
  ) {
    data.onboardedAt = (data.createdAt as string) ?? new Date().toISOString();
  }

  return data as unknown as UserProfile;
}

// ==================== Users ====================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(getFirebaseDb(), "users", uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return migrateProfile(snap.data());
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(getFirebaseDb(), "users", profile.uid);
  await setDoc(docRef, stripUndefined(profile as unknown as Record<string, unknown>));
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const docRef = doc(getFirebaseDb(), "users", uid);
  await updateDoc(docRef, stripUndefined(updates as Record<string, unknown>));
}

export async function updateTrickProgress(
  uid: string,
  trickId: string,
  progress: TrickProgress
): Promise<void> {
  const docRef = doc(getFirebaseDb(), "users", uid);
  await updateDoc(docRef, {
    [`trickProgress.${trickId}`]: progress,
  });
}

// ==================== Sessions ====================

export async function createSession(session: Omit<Session, "id">): Promise<string> {
  const colRef = collection(getFirebaseDb(), "sessions");
  const payload = stripUndefined({
    ...session,
    createdAt: session.createdAt ?? new Date().toISOString(),
  });
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const docRef = doc(getFirebaseDb(), "sessions", sessionId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Session;
}

export async function getUserSessions(uid: string): Promise<Session[]> {
  const colRef = collection(getFirebaseDb(), "sessions");
  const q = query(colRef, where("userId", "==", uid), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Session));
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Promise<void> {
  const docRef = doc(getFirebaseDb(), "sessions", sessionId);
  await updateDoc(docRef, stripUndefined(updates as Record<string, unknown>));
}

// ==================== YouTube Cache ====================

export async function getCachedYouTubeVideos(
  queryStr: string
): Promise<{ videos: unknown[]; cachedAt: string } | null> {
  const docRef = doc(getFirebaseDb(), "youtubeCache", encodeURIComponent(queryStr));
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as { videos: unknown[]; cachedAt: string };
}

export async function cacheYouTubeVideos(
  queryStr: string,
  videos: unknown[]
): Promise<void> {
  const docRef = doc(getFirebaseDb(), "youtubeCache", encodeURIComponent(queryStr));
  await setDoc(docRef, {
    query: queryStr,
    videos,
    cachedAt: new Date().toISOString(),
  });
}
