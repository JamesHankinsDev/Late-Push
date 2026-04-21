import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import { LivePresence } from "../types";

const DEFAULT_DURATION_MIN = 120; // 2h auto-expire

function col() {
  return collection(getFirebaseDb(), "livePresence");
}

export interface StartLiveOptions {
  uid: string;
  alias: string;
  aliasColor?: string;
  spotId?: string;
  spotName?: string;
  durationMin?: number;
}

/**
 * Write livePresence/{uid} so other users can see this person as live.
 * No GPS — only a spot reference (user-picked). Client is expected to
 * clear via stopLive() when they're done; we also stamp an expiresAt for
 * automatic staleness.
 */
export async function startLive(opts: StartLiveOptions): Promise<LivePresence> {
  const duration = opts.durationMin ?? DEFAULT_DURATION_MIN;
  const now = new Date();
  const expires = new Date(now.getTime() + duration * 60 * 1000);

  const payload: LivePresence = {
    uid: opts.uid,
    alias: opts.alias,
    aliasColor: opts.aliasColor,
    spotId: opts.spotId,
    spotName: opts.spotName,
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  await setDoc(doc(col(), opts.uid), stripUndefined(payload as unknown as Record<string, unknown>));
  return payload;
}

export async function stopLive(uid: string): Promise<void> {
  await deleteDoc(doc(col(), uid)).catch(() => {
    /* idempotent */
  });
}

export async function getMyPresence(uid: string): Promise<LivePresence | null> {
  const snap = await getDoc(doc(col(), uid));
  if (!snap.exists()) return null;
  const data = snap.data() as LivePresence;
  if (new Date(data.expiresAt).getTime() < Date.now()) {
    // Silent cleanup of expired doc on next access
    await stopLive(uid).catch(() => {});
    return null;
  }
  return data;
}

/**
 * List everyone currently live. Filters expired docs client-side; the
 * server-side index stays simple.
 */
export async function listLiveNow(): Promise<LivePresence[]> {
  const snap = await getDocs(col());
  const now = Date.now();
  return snap.docs
    .map((d) => d.data() as LivePresence)
    .filter((p) => new Date(p.expiresAt).getTime() > now)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Same as listLiveNow but excludes the viewer + anyone they've blocked. */
export async function listLiveNowVisibleTo(
  viewerUid: string,
  blockedUids: Set<string>
): Promise<LivePresence[]> {
  const all = await listLiveNow();
  return all.filter(
    (p) => p.uid !== viewerUid && !blockedUids.has(p.uid)
  );
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

