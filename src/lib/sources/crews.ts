import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import {
  Crew,
  CrewInvite,
  CrewMembership,
  CrewRole,
  CrewVisibility,
  PublicProfile,
} from "../types";
import { getPublicProfile } from "./publicProfiles";

function crewCol() {
  return collection(getFirebaseDb(), "crews");
}
function membershipCol() {
  return collection(getFirebaseDb(), "crewMemberships");
}
function inviteCol() {
  return collection(getFirebaseDb(), "crewInvites");
}

function membershipId(crewId: string, uid: string) {
  return `${crewId}__${uid}`;
}

function inviteId(crewId: string, inviteeUid: string) {
  return `${crewId}__${inviteeUid}`;
}

// Small normalized id from the crew name so URLs read nicely.
// Collisions are possible — we append a short random suffix.
function generateCrewId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${slug || "crew"}-${rand}`;
}

// =========================================================================
// CRUD
// =========================================================================

export interface NewCrewInput {
  name: string;
  tag: string;
  color: string;
  description: string;
  visibility: CrewVisibility;
  meetingCadence?: string;
  levelRange?: string;
}

/** Create a crew and the owner's membership atomically. */
export async function createCrew(
  input: NewCrewInput,
  owner: { uid: string; alias: string; aliasColor: string }
): Promise<Crew> {
  const id = generateCrewId(input.name);
  const db = getFirebaseDb();
  const crewRef = doc(crewCol(), id);
  const memRef = doc(membershipCol(), membershipId(id, owner.uid));

  const crew: Crew = {
    id,
    name: input.name.trim(),
    tag: input.tag.trim().toUpperCase(),
    color: input.color,
    description: input.description.trim(),
    createdBy: owner.uid,
    createdAt: new Date().toISOString(),
    visibility: input.visibility,
    meetingCadence: input.meetingCadence?.trim() || undefined,
    levelRange: input.levelRange?.trim() || undefined,
    memberCount: 1,
  };

  const ownerMembership: CrewMembership = {
    id: membershipId(id, owner.uid),
    crewId: id,
    uid: owner.uid,
    alias: owner.alias,
    aliasColor: owner.aliasColor,
    role: "owner",
    joinedAt: new Date().toISOString(),
  };

  await runTransaction(db, async (tx) => {
    tx.set(crewRef, stripUndefined(crew as unknown as Record<string, unknown>));
    tx.set(memRef, stripUndefined(ownerMembership as unknown as Record<string, unknown>));
  });

  return crew;
}

export async function getCrew(id: string): Promise<Crew | null> {
  const snap = await getDoc(doc(crewCol(), id));
  if (!snap.exists()) return null;
  return snap.data() as Crew;
}

/**
 * List public crews ordered by most recent. Client-side filterable by name.
 * Invite-only crews are excluded from public discovery.
 */
export async function listPublicCrews(max: number = 30): Promise<Crew[]> {
  const q = query(
    crewCol(),
    where("visibility", "==", "public"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Crew);
}

export async function listUserCrews(uid: string): Promise<Crew[]> {
  const q = query(membershipCol(), where("uid", "==", uid));
  const snap = await getDocs(q);
  const memberships = snap.docs.map((d) => d.data() as CrewMembership);
  const crews = await Promise.all(
    memberships.map((m) => getCrew(m.crewId))
  );
  return crews.filter((c): c is Crew => c !== null);
}

export async function listCrewMembers(
  crewId: string
): Promise<CrewMembership[]> {
  const q = query(membershipCol(), where("crewId", "==", crewId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CrewMembership);
}

export async function getMembership(
  crewId: string,
  uid: string
): Promise<CrewMembership | null> {
  const snap = await getDoc(doc(membershipCol(), membershipId(crewId, uid)));
  if (!snap.exists()) return null;
  return snap.data() as CrewMembership;
}

// =========================================================================
// Joining / leaving
// =========================================================================

/**
 * Join a crew. For public crews, creates a membership directly. For
 * invite-only crews, requires an existing invite — rule + transaction
 * enforce. On success, any pending invite for this user is deleted.
 */
export async function joinCrew(
  crewId: string,
  member: { uid: string; alias: string; aliasColor: string },
  invitedBy?: string
): Promise<void> {
  const db = getFirebaseDb();
  const memRef = doc(membershipCol(), membershipId(crewId, member.uid));
  const crewRef = doc(crewCol(), crewId);
  const invRef = doc(inviteCol(), inviteId(crewId, member.uid));

  await runTransaction(db, async (tx) => {
    // Reads
    const crewSnap = await tx.get(crewRef);
    if (!crewSnap.exists()) throw new Error("That crew doesn't exist.");
    const crew = crewSnap.data() as Crew;
    const existingMembership = await tx.get(memRef);
    if (existingMembership.exists())
      throw new Error("You're already in this crew.");
    const invSnap = await tx.get(invRef);

    if (crew.visibility === "invite-only" && !invSnap.exists()) {
      throw new Error("This crew is invite-only. You need an invite first.");
    }

    // Writes
    const membership: CrewMembership = {
      id: membershipId(crewId, member.uid),
      crewId,
      uid: member.uid,
      alias: member.alias,
      aliasColor: member.aliasColor,
      role: "member",
      joinedAt: new Date().toISOString(),
      invitedBy,
    };
    tx.set(memRef, stripUndefined(membership as unknown as Record<string, unknown>));
    tx.update(crewRef, { memberCount: increment(1) });
    if (invSnap.exists()) tx.delete(invRef);
  });
}

export async function leaveCrew(
  crewId: string,
  uid: string
): Promise<void> {
  const db = getFirebaseDb();
  const memRef = doc(membershipCol(), membershipId(crewId, uid));
  const crewRef = doc(crewCol(), crewId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(memRef);
    if (!snap.exists()) return; // idempotent
    const mem = snap.data() as CrewMembership;
    if (mem.role === "owner") {
      throw new Error(
        "Owners can't leave their own crew — transfer or delete it."
      );
    }
    tx.delete(memRef);
    tx.update(crewRef, { memberCount: increment(-1) });
  });
}

export async function deleteCrew(
  crewId: string,
  uid: string
): Promise<void> {
  const db = getFirebaseDb();
  const crewRef = doc(crewCol(), crewId);
  const crew = await getCrew(crewId);
  if (!crew) return;
  if (crew.createdBy !== uid)
    throw new Error("Only the owner can delete this crew.");

  // Collect memberships + invites to clean up
  const memQ = query(membershipCol(), where("crewId", "==", crewId));
  const invQ = query(inviteCol(), where("crewId", "==", crewId));
  const [memSnap, invSnap] = await Promise.all([
    getDocs(memQ),
    getDocs(invQ),
  ]);

  // Delete in batches-of-one (simplest; at MVP scale, not a hot path)
  await Promise.all([
    ...memSnap.docs.map((d) => deleteDoc(d.ref)),
    ...invSnap.docs.map((d) => deleteDoc(d.ref)),
    // Crew doc last so rules don't need special sequencing
  ]);
  await runTransaction(db, async (tx) => {
    tx.delete(crewRef);
  });
}

// =========================================================================
// Invites
// =========================================================================

export async function inviteToCrew(
  crewId: string,
  inviter: { uid: string; alias: string },
  invitee: { uid: string; alias: string }
): Promise<void> {
  const crew = await getCrew(crewId);
  if (!crew) throw new Error("Crew not found.");
  if (crew.createdBy !== inviter.uid)
    throw new Error("Only the crew owner can send invites.");

  const memSnap = await getMembership(crewId, invitee.uid);
  if (memSnap) throw new Error("That user is already in the crew.");

  const ref = doc(inviteCol(), inviteId(crewId, invitee.uid));
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error("Invite already pending.");

  const payload: CrewInvite = {
    id: inviteId(crewId, invitee.uid),
    crewId,
    inviteeUid: invitee.uid,
    inviteeAlias: invitee.alias,
    invitedBy: inviter.uid,
    inviterAlias: inviter.alias,
    crewName: crew.name,
    crewTag: crew.tag,
    crewColor: crew.color,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, stripUndefined(payload as unknown as Record<string, unknown>));
}

export async function declineCrewInvite(
  crewId: string,
  uid: string
): Promise<void> {
  await deleteDoc(doc(inviteCol(), inviteId(crewId, uid)));
}

export async function listCrewInvitesForUser(
  uid: string
): Promise<CrewInvite[]> {
  const q = query(inviteCol(), where("inviteeUid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CrewInvite);
}

export async function listCrewInvitesByCrew(
  crewId: string
): Promise<CrewInvite[]> {
  const q = query(inviteCol(), where("crewId", "==", crewId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CrewInvite);
}

// =========================================================================
// Helpers
// =========================================================================

/** Utility role check for UI gating. */
export function isOwner(membership: CrewMembership | null, uid: string): boolean {
  return !!membership && membership.uid === uid && membership.role === "owner";
}

export async function resolveMembersWithProfiles(
  memberships: CrewMembership[]
): Promise<Array<CrewMembership & { profile: PublicProfile | null }>> {
  return Promise.all(
    memberships.map(async (m) => ({
      ...m,
      profile: await getPublicProfile(m.uid).catch(() => null),
    }))
  );
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export type { CrewRole };
