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
  await setDoc(docRef, profile);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const docRef = doc(getFirebaseDb(), "users", uid);
  await updateDoc(docRef, updates);
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
  const docRef = await addDoc(colRef, {
    ...session,
    createdAt: new Date().toISOString(),
  });
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
  await updateDoc(docRef, updates);
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
