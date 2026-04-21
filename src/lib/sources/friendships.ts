import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import { Friendship, PublicProfile } from "../types";
import { pairId, sortedPair } from "../social/friendship";
import { getPublicProfile } from "./publicProfiles";

function col() {
  return collection(getFirebaseDb(), "friendships");
}

function refFor(id: string) {
  return doc(col(), id);
}

/**
 * Send a friend request. Creates a pending friendship doc keyed on the
 * sorted pair ID. Denormalizes the sender + target aliases at creation
 * time so listings render without extra reads.
 */
export async function sendFriendRequest(
  fromUid: string,
  toUid: string,
  fromProfile: Pick<PublicProfile, "alias" | "aliasColor">,
  toProfile: Pick<PublicProfile, "alias" | "aliasColor">
): Promise<Friendship> {
  if (fromUid === toUid) throw new Error("Can't friend yourself.");
  const id = pairId(fromUid, toUid);
  const [userA, userB] = sortedPair(fromUid, toUid);
  const db = getFirebaseDb();
  const ref = refFor(id);

  const friendship = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      const data = snap.data() as Friendship;
      if (data.status === "accepted")
        throw new Error("You're already friends.");
      if (data.status === "pending")
        throw new Error("A request is already pending between you two.");
    }
    const aliasA = userA === fromUid ? fromProfile.alias : toProfile.alias;
    const aliasB = userB === fromUid ? fromProfile.alias : toProfile.alias;
    const aliasColorA =
      userA === fromUid ? fromProfile.aliasColor : toProfile.aliasColor;
    const aliasColorB =
      userB === fromUid ? fromProfile.aliasColor : toProfile.aliasColor;
    const payload: Friendship = {
      id,
      userA,
      userB,
      aliasA,
      aliasB,
      aliasColorA,
      aliasColorB,
      status: "pending",
      initiatedBy: fromUid,
      createdAt: new Date().toISOString(),
    };
    tx.set(ref, payload);
    return payload;
  });

  return friendship;
}

export async function acceptFriendRequest(id: string): Promise<void> {
  const ref = refFor(id);
  await updateDoc(ref, {
    status: "accepted",
    acceptedAt: new Date().toISOString(),
  });
}

export async function declineFriendRequest(id: string): Promise<void> {
  const ref = refFor(id);
  await deleteDoc(ref);
}

export async function removeFriend(id: string): Promise<void> {
  const ref = refFor(id);
  await deleteDoc(ref);
}

export async function getFriendship(
  a: string,
  b: string
): Promise<Friendship | null> {
  const snap = await getDoc(refFor(pairId(a, b)));
  if (!snap.exists()) return null;
  return snap.data() as Friendship;
}

async function queryFor(uid: string): Promise<Friendship[]> {
  // Firestore doesn't support OR across fields, so we fan out.
  const [a, b] = await Promise.all([
    getDocs(query(col(), where("userA", "==", uid))),
    getDocs(query(col(), where("userB", "==", uid))),
  ]);
  const all = [...a.docs, ...b.docs].map((d) => d.data() as Friendship);
  // Dedup by id in case of weird race where both queries see the same doc
  const seen = new Set<string>();
  return all.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

export async function listFriends(uid: string): Promise<Friendship[]> {
  const all = await queryFor(uid);
  return all.filter((f) => f.status === "accepted");
}

export async function listIncomingRequests(
  uid: string
): Promise<Friendship[]> {
  const all = await queryFor(uid);
  return all.filter((f) => f.status === "pending" && f.initiatedBy !== uid);
}

export async function listOutgoingRequests(
  uid: string
): Promise<Friendship[]> {
  const all = await queryFor(uid);
  return all.filter((f) => f.status === "pending" && f.initiatedBy === uid);
}

/** Fetch + partition in a single trip — used by the Friends tab. */
export async function listAllFriendships(uid: string): Promise<{
  friends: Friendship[];
  incoming: Friendship[];
  outgoing: Friendship[];
}> {
  const all = await queryFor(uid);
  return {
    friends: all.filter((f) => f.status === "accepted"),
    incoming: all.filter((f) => f.status === "pending" && f.initiatedBy !== uid),
    outgoing: all.filter((f) => f.status === "pending" && f.initiatedBy === uid),
  };
}

/** Helper: resolve the public profile of the other party for display. */
export async function publicProfileOfOther(
  f: Friendship,
  viewerUid: string
): Promise<PublicProfile | null> {
  const other = f.userA === viewerUid ? f.userB : f.userA;
  return getPublicProfile(other);
}
