"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  deleteCrew,
  declineCrewInvite,
  getCrew,
  getMembership,
  inviteToCrew,
  joinCrew,
  leaveCrew,
  listCrewInvitesByCrew,
  listCrewMembers,
} from "@/lib/sources/crews";
import { listFriends } from "@/lib/sources/friendships";
import { otherUid, otherAlias, otherAliasColor } from "@/lib/social/friendship";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import {
  Crew,
  CrewInvite,
  CrewMembership,
  Friendship,
} from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

export default function CrewDetailPage({ params }: { params: { id: string } }) {
  const { profile } = useAuthContext();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [members, setMembers] = useState<CrewMembership[]>([]);
  const [invites, setInvites] = useState<CrewInvite[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [myMembership, setMyMembership] = useState<CrewMembership | null>(null);
  const [myPendingInvite, setMyPendingInvite] = useState<CrewInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const c = await getCrew(params.id);
      setCrew(c);
      if (!c) {
        setLoading(false);
        return;
      }
      const [mem, inv, mine, myFriends] = await Promise.all([
        listCrewMembers(params.id),
        // Only fetch invites if you're the owner (rules enforce this too).
        c.createdBy === profile.uid
          ? listCrewInvitesByCrew(params.id)
          : Promise.resolve([] as CrewInvite[]),
        getMembership(params.id, profile.uid),
        listFriends(profile.uid),
      ]);
      setMembers(mem);
      setInvites(inv);
      setMyMembership(mine);
      setFriends(myFriends);

      // Did the viewer have a pending invite?
      if (!mine) {
        const myInv = await fetchMyInvite(params.id, profile.uid);
        setMyPendingInvite(myInv);
      } else {
        setMyPendingInvite(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't load the crew."
      );
    } finally {
      setLoading(false);
    }
  }, [profile, params.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleJoin() {
    if (!profile || !crew || busy) return;
    setBusy(true);
    setError("");
    try {
      await joinCrew(
        crew.id,
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? crew.color,
        },
        myPendingInvite?.invitedBy
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    if (!profile || !crew || busy) return;
    setBusy(true);
    setError("");
    try {
      await leaveCrew(crew.id, profile.uid);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't leave.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!profile || !crew || busy) return;
    if (
      !confirm(
        `Delete "${crew.name}"? This removes all memberships and invites. Can't be undone.`
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await deleteCrew(crew.id, profile.uid);
      window.location.href = "/social";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
      setBusy(false);
    }
  }

  async function handleDecline() {
    if (!profile || !crew || !myPendingInvite || busy) return;
    setBusy(true);
    setError("");
    try {
      await declineCrewInvite(crew.id, profile.uid);
      setMyPendingInvite(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decline.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !crew) {
    return (
      <div className="card-dark animate-pulse" style={{ height: 260 }} />
    );
  }

  if (!crew) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NOT FOUND</Eyebrow>
        <h2 className="hed hed-m" style={{ marginTop: 12 }}>
          No such crew
        </h2>
        <p className="dim">
          This crew doesn&apos;t exist, or the owner deleted it.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/social">
            <Button variant="ghost">← Back to Social</Button>
          </Link>
        </div>
      </div>
    );
  }

  const owner = members.find((m) => m.role === "owner");
  const isOwner = myMembership?.role === "owner";
  const isMember = !!myMembership;
  const friendsNotInCrew = friends.filter((f) => {
    const otherUidVal = otherUid(f, profile!.uid);
    return !members.some((m) => m.uid === otherUidVal);
  });

  return (
    <div>
      {/* Banner */}
      <div
        className="card-dark"
        style={{
          padding: 0,
          marginBottom: 22,
          overflow: "hidden",
        }}
      >
        <div
          className="crew-banner"
          style={{ background: crew.color, height: 140 }}
        >
          <div className="mark" style={{ fontSize: 96 }}>
            {crew.tag}
          </div>
        </div>
        <div style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "baseline",
              marginBottom: 8,
            }}
          >
            <Eyebrow>CREW · {crew.visibility === "public" ? "OPEN" : "INVITE ONLY"}</Eyebrow>
            <span className="label">
              {crew.memberCount} MEMBER{crew.memberCount === 1 ? "" : "S"}
              {crew.meetingCadence ? ` · ${crew.meetingCadence.toUpperCase()}` : ""}
            </span>
          </div>
          <h1 className="hed hed-l" style={{ margin: "4px 0 10px" }}>
            {crew.name}
          </h1>
          <p
            className="dim"
            style={{ fontSize: 14, marginBottom: 18, maxWidth: "56ch" }}
          >
            {crew.description}
          </p>

          {error && (
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--coral)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <CrewActions
            crew={crew}
            isMember={isMember}
            isOwner={isOwner}
            myPendingInvite={myPendingInvite}
            busy={busy}
            onJoin={handleJoin}
            onLeave={handleLeave}
            onDelete={handleDelete}
            onDecline={handleDecline}
          />
        </div>
      </div>

      {/* Members */}
      <div className="sec-head">
        <h3>Members</h3>
        <span className="label">{members.length}</span>
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {owner && <MemberRow m={owner} label="OWNER" />}
        {members
          .filter((m) => m.role !== "owner")
          .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
          .map((m) => (
            <MemberRow key={m.id} m={m} />
          ))}
      </div>

      {/* Owner-only: invite friends */}
      {isOwner && (
        <>
          <div className="sec-head">
            <h3>Invite from friends</h3>
            <span className="label">
              {friendsNotInCrew.length} AVAILABLE
            </span>
          </div>
          {friendsNotInCrew.length === 0 ? (
            <div className="card-dark" style={{ padding: 18, marginBottom: 28 }}>
              <p className="dim small" style={{ margin: 0 }}>
                No friends to invite right now. Find skaters on Nearby and
                send friend requests — they become invite candidates once
                you&apos;re friends.
              </p>
            </div>
          ) : (
            <InviteFriendsSection
              crew={crew}
              friends={friendsNotInCrew}
              viewerUid={profile!.uid}
              viewerAlias={profile!.alias ?? ""}
              pendingInvites={invites}
              onInvited={refresh}
            />
          )}

          <div className="sec-head">
            <h3>Pending invites</h3>
            <span className="label">{invites.length}</span>
          </div>
          {invites.length === 0 ? (
            <div className="card-dark" style={{ padding: 18 }}>
              <p className="dim small" style={{ margin: 0 }}>
                No invites outstanding.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="card-dark"
                  style={{
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--display)",
                        fontSize: 16,
                        letterSpacing: "0.04em",
                      }}
                    >
                      @{inv.inviteeAlias ?? "unknown"}
                    </div>
                    <div className="dim small" style={{ marginTop: 2 }}>
                      Invited {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Tag tone="outline">PENDING</Tag>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/social">
          <Button variant="ghost">← Back to Social</Button>
        </Link>
      </div>
    </div>
  );
}

function CrewActions({
  crew,
  isMember,
  isOwner,
  myPendingInvite,
  busy,
  onJoin,
  onLeave,
  onDelete,
  onDecline,
}: {
  crew: Crew;
  isMember: boolean;
  isOwner: boolean;
  myPendingInvite: CrewInvite | null;
  busy: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  onDecline: () => void;
}) {
  if (isOwner) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Tag tone="mint">YOU OWN THIS CREW</Tag>
        <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy}>
          {busy ? "…" : "Delete crew"}
        </Button>
      </div>
    );
  }
  if (isMember) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Tag tone="yellow">MEMBER</Tag>
        <Button variant="ghost" size="sm" onClick={onLeave} disabled={busy}>
          {busy ? "…" : "Leave crew"}
        </Button>
      </div>
    );
  }
  if (myPendingInvite) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Tag tone="yellow">INVITED</Tag>
        <Button variant="primary" onClick={onJoin} disabled={busy}>
          {busy ? "Joining…" : "Accept invite →"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDecline} disabled={busy}>
          Decline
        </Button>
      </div>
    );
  }
  if (crew.visibility === "public") {
    return (
      <Button variant="primary" onClick={onJoin} disabled={busy}>
        {busy ? "Joining…" : "Join crew →"}
      </Button>
    );
  }
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Tag tone="outline">INVITE ONLY</Tag>
      <span className="dim small" style={{ alignSelf: "center" }}>
        Ask the owner to send you an invite.
      </span>
    </div>
  );
}

function MemberRow({ m, label }: { m: CrewMembership; label?: string }) {
  const color = m.aliasColor ?? aliasColor(m.alias?.toLowerCase() ?? "?");
  return (
    <div
      className="card-dark"
      style={{
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: color,
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--hammer)",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {aliasInitials(m.alias ?? "?")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 16,
            letterSpacing: "0.04em",
          }}
        >
          @{m.alias ?? "unknown"}
        </div>
        <div className="dim small" style={{ marginTop: 2 }}>
          Joined {new Date(m.joinedAt).toLocaleDateString()}
        </div>
      </div>
      {label && <Tag tone="mint">{label}</Tag>}
    </div>
  );
}

function InviteFriendsSection({
  crew,
  friends,
  viewerUid,
  viewerAlias,
  pendingInvites,
  onInvited,
}: {
  crew: Crew;
  friends: Friendship[];
  viewerUid: string;
  viewerAlias: string;
  pendingInvites: CrewInvite[];
  onInvited: () => void;
}) {
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const invitedUids = new Set(pendingInvites.map((i) => i.inviteeUid));

  async function handleInvite(f: Friendship) {
    const otherUidVal = otherUid(f, viewerUid);
    setBusyUid(otherUidVal);
    try {
      await inviteToCrew(
        crew.id,
        { uid: viewerUid, alias: viewerAlias },
        { uid: otherUidVal, alias: otherAlias(f, viewerUid) }
      );
      onInvited();
    } catch {
      // surface via parent on next refresh
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
      {friends.map((f) => {
        const otherUidVal = otherUid(f, viewerUid);
        const aliasVal = otherAlias(f, viewerUid);
        const colorVal = otherAliasColor(f, viewerUid);
        const already = invitedUids.has(otherUidVal);
        return (
          <div
            key={f.id}
            className="card-dark"
            style={{
              padding: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: colorVal ?? aliasColor(aliasVal.toLowerCase()),
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--hammer)",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {aliasInitials(aliasVal)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 15,
                  letterSpacing: "0.04em",
                }}
              >
                @{aliasVal}
              </div>
            </div>
            <Button
              size="sm"
              variant={already ? "ghost" : "primary"}
              onClick={() => !already && handleInvite(f)}
              disabled={already || busyUid === otherUidVal}
            >
              {already
                ? "Invited"
                : busyUid === otherUidVal
                ? "…"
                : "Invite"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

async function fetchMyInvite(
  crewId: string,
  uid: string
): Promise<CrewInvite | null> {
  // Reads crewInvites/{id} via rules — viewer must be inviteeUid
  try {
    const { listCrewInvitesForUser } = await import("@/lib/sources/crews");
    const invites = await listCrewInvitesForUser(uid);
    return invites.find((i) => i.crewId === crewId) ?? null;
  } catch {
    return null;
  }
}

