import {
  doc,
  getDoc,
  deleteDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import { AliasDoc } from "../types";
import { normalizeAlias, validateAlias } from "../social/aliases";

export class AliasError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AliasError";
  }
}

export async function isAliasAvailable(alias: string): Promise<boolean> {
  const lower = normalizeAlias(alias);
  const ref = doc(getFirebaseDb(), "aliases", lower);
  const snap = await getDoc(ref);
  return !snap.exists();
}

/**
 * Atomically claim an alias for uid. Creates an aliases/{lower} doc only
 * if it doesn't already exist. Throws AliasError on conflict or invalid.
 *
 * This does NOT release the user's previous alias — callers should use
 * `changeAlias` for transitions. Use this for first-time claims only.
 */
export async function claimAlias(uid: string, alias: string): Promise<void> {
  const v = validateAlias(alias);
  if (!v.ok) throw new AliasError(v.error ?? "INVALID", v.hint ?? "Invalid alias");

  const lower = normalizeAlias(alias);
  const db = getFirebaseDb();
  const aliasRef = doc(db, "aliases", lower);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(aliasRef);
    if (existing.exists()) {
      const data = existing.data() as AliasDoc;
      if (data.uid !== uid) throw new AliasError("TAKEN", "That alias is taken.");
      return; // already mine — idempotent
    }
    tx.set(aliasRef, {
      uid,
      claimedAt: new Date().toISOString(),
    } satisfies AliasDoc);
  });
}

export async function releaseAlias(
  uid: string,
  alias: string
): Promise<void> {
  const lower = normalizeAlias(alias);
  const ref = doc(getFirebaseDb(), "aliases", lower);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as AliasDoc;
  if (data.uid !== uid)
    throw new AliasError("NOT_OWNER", "Not yours to release.");
  await deleteDoc(ref);
}

/**
 * Atomic alias change: claim the new alias and release the old one in a
 * single transaction. Firestore requires ALL reads to happen before ANY
 * writes inside a transaction, so we buffer the decisions and only touch
 * the writes at the end.
 */
export async function changeAlias(
  uid: string,
  oldAlias: string | undefined,
  newAlias: string
): Promise<void> {
  const v = validateAlias(newAlias);
  if (!v.ok) throw new AliasError(v.error ?? "INVALID", v.hint ?? "Invalid alias");

  const newLower = normalizeAlias(newAlias);
  const oldLower = oldAlias ? normalizeAlias(oldAlias) : null;

  // No-op if unchanged
  if (oldLower === newLower) return;

  const db = getFirebaseDb();
  const newRef = doc(db, "aliases", newLower);
  const oldRef = oldLower ? doc(db, "aliases", oldLower) : null;

  await runTransaction(db, async (tx) => {
    // ---- All reads first ----
    const newSnap = await tx.get(newRef);
    const oldSnap = oldRef ? await tx.get(oldRef) : null;

    // ---- Validate ----
    let shouldCreateNew = true;
    if (newSnap.exists()) {
      const data = newSnap.data() as AliasDoc;
      if (data.uid !== uid) {
        throw new AliasError("TAKEN", "That alias is taken.");
      }
      // Already ours — no need to rewrite.
      shouldCreateNew = false;
    }

    let shouldDeleteOld = false;
    if (oldRef && oldSnap?.exists()) {
      const data = oldSnap.data() as AliasDoc;
      if (data.uid === uid) shouldDeleteOld = true;
    }

    // ---- Then all writes ----
    if (shouldCreateNew) {
      tx.set(newRef, {
        uid,
        claimedAt: new Date().toISOString(),
      } satisfies AliasDoc);
    }
    if (shouldDeleteOld && oldRef) {
      tx.delete(oldRef);
    }
  });
}

export async function getUidForAlias(alias: string): Promise<string | null> {
  const lower = normalizeAlias(alias);
  const ref = doc(getFirebaseDb(), "aliases", lower);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data() as AliasDoc).uid;
}

/** Handy for profile lookups by typed handle — respects profileLookupByHandle. */
export async function findAliasOwners(alias: string): Promise<string[]> {
  const lower = normalizeAlias(alias);
  const q = query(
    collection(getFirebaseDb(), "aliases"),
    where("__name__", "==", lower),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => (d.data() as AliasDoc).uid);
}
