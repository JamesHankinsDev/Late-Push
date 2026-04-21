import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import { Block } from "../types";

function blocksCol() {
  return collection(getFirebaseDb(), "blocks");
}

function docIdFor(blockerUid: string, blockedUid: string) {
  return `${blockerUid}__${blockedUid}`;
}

/** Create a block (idempotent). */
export async function block(
  blockerUid: string,
  blockedUid: string
): Promise<void> {
  if (blockerUid === blockedUid) return;
  const id = docIdFor(blockerUid, blockedUid);
  const ref = doc(blocksCol(), id);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await addDoc(blocksCol(), {
    blockerUid,
    blockedUid,
    createdAt: new Date().toISOString(),
  } satisfies Omit<Block, "id">);
}

export async function unblock(
  blockerUid: string,
  blockedUid: string
): Promise<void> {
  const q = query(
    blocksCol(),
    where("blockerUid", "==", blockerUid),
    where("blockedUid", "==", blockedUid)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function listBlocks(blockerUid: string): Promise<Block[]> {
  const q = query(blocksCol(), where("blockerUid", "==", blockerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Block, "id">) }));
}

/** Returns uids blocked by `uid`, for filtering discovery surfaces. */
export async function blockedUidsFor(uid: string): Promise<Set<string>> {
  const blocks = await listBlocks(uid);
  return new Set(blocks.map((b) => b.blockedUid));
}

/**
 * Bidirectional check: returns true if A has blocked B OR B has blocked A.
 * Used to hide both parties from each other's discovery surfaces.
 */
export async function isMutuallyVisible(
  viewerUid: string,
  targetUid: string
): Promise<boolean> {
  const q1 = query(
    blocksCol(),
    where("blockerUid", "in", [viewerUid, targetUid]),
    where("blockedUid", "in", [viewerUid, targetUid])
  );
  const snap = await getDocs(q1);
  return snap.empty;
}
