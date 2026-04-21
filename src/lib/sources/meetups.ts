import {
  doc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  runTransaction,
  increment,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import {
  Crew,
  Meetup,
  MeetupRsvp,
  MeetupVisibility,
  RsvpStatus,
  SkateSpot,
} from "../types";

function meetupCol() {
  return collection(getFirebaseDb(), "meetups");
}
function rsvpCol() {
  return collection(getFirebaseDb(), "meetupRsvps");
}

function rsvpId(meetupId: string, uid: string) {
  return `${meetupId}__${uid}`;
}

function generateMeetupId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${slug || "meetup"}-${rand}`;
}

// =========================================================================
// CRUD
// =========================================================================

export interface NewMeetupInput {
  title: string;
  focus: string;
  spot: Pick<SkateSpot, "id" | "name" | "lat" | "lng">;
  date: string;
  time?: string;
  crew?: Pick<Crew, "id" | "name" | "tag" | "color">;
  visibility: MeetupVisibility;
}

/**
 * Create a meetup. The host is implicitly "going" — we write their RSVP
 * in the same transaction so goingCount starts at 1.
 */
export async function createMeetup(
  input: NewMeetupInput,
  host: { uid: string; alias: string; aliasColor: string }
): Promise<Meetup> {
  const id = generateMeetupId(input.title);
  const db = getFirebaseDb();
  const meetupRef = doc(meetupCol(), id);
  const hostRsvpRef = doc(rsvpCol(), rsvpId(id, host.uid));

  const meetup: Meetup = {
    id,
    title: input.title.trim(),
    focus: input.focus.trim(),
    hostUid: host.uid,
    hostAlias: host.alias,
    hostAliasColor: host.aliasColor,
    crewId: input.crew?.id,
    crewName: input.crew?.name,
    crewTag: input.crew?.tag,
    crewColor: input.crew?.color,
    spotId: input.spot.id,
    spotName: input.spot.name,
    spotLat: input.spot.lat,
    spotLng: input.spot.lng,
    date: input.date,
    time: input.time?.trim() || undefined,
    visibility: input.visibility,
    goingCount: 1,
    createdAt: new Date().toISOString(),
  };

  const hostRsvp: MeetupRsvp = {
    id: rsvpId(id, host.uid),
    meetupId: id,
    uid: host.uid,
    alias: host.alias,
    aliasColor: host.aliasColor,
    status: "going",
    createdAt: new Date().toISOString(),
  };

  await runTransaction(db, async (tx) => {
    tx.set(meetupRef, stripUndefined(meetup as unknown as Record<string, unknown>));
    tx.set(hostRsvpRef, stripUndefined(hostRsvp as unknown as Record<string, unknown>));
  });

  return meetup;
}

export async function getMeetup(id: string): Promise<Meetup | null> {
  const snap = await getDoc(doc(meetupCol(), id));
  if (!snap.exists()) return null;
  return snap.data() as Meetup;
}

export async function deleteMeetup(id: string): Promise<void> {
  const db = getFirebaseDb();
  // Gather RSVPs to clean up first
  const rsvpQ = query(rsvpCol(), where("meetupId", "==", id));
  const rsvpSnap = await getDocs(rsvpQ);
  await Promise.all(rsvpSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(meetupCol(), id));
  // db intentionally unused after deletes — kept for future atomicity
  void db;
}

// =========================================================================
// Listing — today + forward
// =========================================================================

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listPublicUpcoming(max: number = 30): Promise<Meetup[]> {
  const q = query(
    meetupCol(),
    where("visibility", "==", "public"),
    where("date", ">=", todayIso()),
    orderBy("date", "asc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Meetup);
}

export async function listCrewUpcoming(
  crewId: string,
  max: number = 30
): Promise<Meetup[]> {
  const q = query(
    meetupCol(),
    where("crewId", "==", crewId),
    where("date", ">=", todayIso()),
    orderBy("date", "asc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Meetup);
}

export async function listHostedMeetups(uid: string): Promise<Meetup[]> {
  const q = query(
    meetupCol(),
    where("hostUid", "==", uid),
    where("date", ">=", todayIso()),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Meetup);
}

// =========================================================================
// RSVPs
// =========================================================================

export async function setRsvp(
  meetup: Pick<Meetup, "id">,
  user: { uid: string; alias: string; aliasColor: string },
  status: RsvpStatus
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(rsvpCol(), rsvpId(meetup.id, user.uid));
  const meetupRef = doc(meetupCol(), meetup.id);

  await runTransaction(db, async (tx) => {
    const [existing, meetupSnap] = await Promise.all([
      tx.get(ref),
      tx.get(meetupRef),
    ]);
    if (!meetupSnap.exists()) throw new Error("That meetup doesn't exist.");

    const prev = existing.exists()
      ? (existing.data() as MeetupRsvp).status
      : null;
    if (prev === status) return; // idempotent

    const payload: MeetupRsvp = {
      id: rsvpId(meetup.id, user.uid),
      meetupId: meetup.id,
      uid: user.uid,
      alias: user.alias,
      aliasColor: user.aliasColor,
      status,
      createdAt: existing.exists()
        ? (existing.data() as MeetupRsvp).createdAt
        : new Date().toISOString(),
    };
    tx.set(ref, stripUndefined(payload as unknown as Record<string, unknown>));

    // Adjust the denormalized goingCount
    const wasGoing = prev === "going";
    const willGo = status === "going";
    if (!wasGoing && willGo) {
      tx.update(meetupRef, { goingCount: increment(1) });
    } else if (wasGoing && !willGo) {
      tx.update(meetupRef, { goingCount: increment(-1) });
    }
  });
}

export async function clearRsvp(
  meetupId: string,
  uid: string
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(rsvpCol(), rsvpId(meetupId, uid));
  const meetupRef = doc(meetupCol(), meetupId);
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (!existing.exists()) return;
    const data = existing.data() as MeetupRsvp;
    tx.delete(ref);
    if (data.status === "going") {
      tx.update(meetupRef, { goingCount: increment(-1) });
    }
  });
}

export async function getMyRsvp(
  meetupId: string,
  uid: string
): Promise<MeetupRsvp | null> {
  const snap = await getDoc(doc(rsvpCol(), rsvpId(meetupId, uid)));
  if (!snap.exists()) return null;
  return snap.data() as MeetupRsvp;
}

export async function listRsvpsFor(
  meetupId: string
): Promise<MeetupRsvp[]> {
  const q = query(rsvpCol(), where("meetupId", "==", meetupId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as MeetupRsvp);
}

/** Meetups the user has RSVP'd to (upcoming only). */
export async function listUpcomingForUser(
  uid: string
): Promise<Meetup[]> {
  const q = query(
    rsvpCol(),
    where("uid", "==", uid),
    where("status", "==", "going")
  );
  const snap = await getDocs(q);
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const d of snap.docs) {
    const r = d.data() as MeetupRsvp;
    if (!seen.has(r.meetupId)) {
      seen.add(r.meetupId);
      ids.push(r.meetupId);
    }
  }
  const today = todayIso();
  const meetups = await Promise.all(ids.map((id) => getMeetup(id)));
  return meetups
    .filter((m): m is Meetup => m !== null && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}
