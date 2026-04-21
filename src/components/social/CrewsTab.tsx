"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  declineCrewInvite,
  joinCrew,
  listCrewInvitesForUser,
  listPublicCrews,
  listUserCrews,
} from "@/lib/sources/crews";
import { Crew, CrewInvite } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

const AVATAR_COLORS = [
  "#f5d400",
  "#ff5a3c",
  "#78d19a",
  "#b38cff",
  "#7ec7ff",
  "#c93a2a",
];

export default function CrewsTab() {
  const { profile } = useAuthContext();
  const [myCrews, setMyCrews] = useState<Crew[]>([]);
  const [publicCrews, setPublicCrews] = useState<Crew[]>([]);
  const [invites, setInvites] = useState<CrewInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [mine, publics, invs] = await Promise.all([
        listUserCrews(profile.uid),
        listPublicCrews(30),
        listCrewInvitesForUser(profile.uid),
      ]);
      setMyCrews(mine);
      setPublicCrews(publics);
      setInvites(invs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load crews.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAcceptInvite(inv: CrewInvite) {
    if (!profile || busy) return;
    setBusy(inv.id);
    setError("");
    try {
      await joinCrew(
        inv.crewId,
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? inv.crewColor ?? "#f5d400",
        },
        inv.invitedBy
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't accept.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDeclineInvite(inv: CrewInvite) {
    if (!profile || busy) return;
    setBusy(inv.id);
    setError("");
    try {
      await declineCrewInvite(inv.crewId, profile.uid);
      setInvites((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decline.");
    } finally {
      setBusy(null);
    }
  }

  const myCrewIds = new Set(myCrews.map((c) => c.id));
  const discoverable = publicCrews.filter((c) => !myCrewIds.has(c.id));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span className="label">
          {myCrews.length} YOUR CREW{myCrews.length === 1 ? "" : "S"} ·{" "}
          {publicCrews.length} PUBLIC · {invites.length} PENDING INVITE
          {invites.length === 1 ? "" : "S"}
        </span>
        <Link href="/crews/new">
          <Button size="sm" variant="primary">
            + Start a crew
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 18,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      {/* Pending invites */}
      {invites.length > 0 && (
        <>
          <div className="sec-head">
            <h3>Pending invites</h3>
            <span className="label">{invites.length}</span>
          </div>
          <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="card-dark"
                style={{
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: inv.crewColor ?? "var(--hazard)",
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--hammer)",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {inv.crewTag ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 16,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {inv.crewName ?? inv.crewId}
                  </div>
                  <div className="dim small" style={{ marginTop: 2 }}>
                    @{inv.inviterAlias ?? "someone"} invited you
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAcceptInvite(inv)}
                    disabled={busy === inv.id}
                  >
                    {busy === inv.id ? "…" : "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeclineInvite(inv)}
                    disabled={busy === inv.id}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* My crews */}
      <div className="sec-head">
        <h3>Your crews</h3>
        <span className="label">{myCrews.length}</span>
      </div>
      {loading && myCrews.length === 0 ? (
        <CrewsSkel />
      ) : myCrews.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 20, textAlign: "center", marginBottom: 24 }}
        >
          <p className="dim small" style={{ margin: 0 }}>
            Not in any crews yet. Browse public crews below, or start your own.
          </p>
        </div>
      ) : (
        <div className="crews-grid" style={{ marginBottom: 24 }}>
          {myCrews.map((c) => (
            <CrewCard key={c.id} crew={c} mine />
          ))}
        </div>
      )}

      {/* Public discovery */}
      <div className="sec-head">
        <h3>Public crews</h3>
        <span className="label">{discoverable.length}</span>
      </div>
      {loading && discoverable.length === 0 ? (
        <CrewsSkel />
      ) : discoverable.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 20, textAlign: "center" }}
        >
          <Eyebrow>QUIET</Eyebrow>
          <p
            className="dim"
            style={{ fontSize: 13, marginTop: 10 }}
          >
            No public crews yet. Start the first one — invite-only crews
            won&apos;t show up here.
          </p>
        </div>
      ) : (
        <div className="crews-grid">
          {discoverable.map((c) => (
            <CrewCard key={c.id} crew={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CrewCard({ crew, mine }: { crew: Crew; mine?: boolean }) {
  return (
    <div className="crew-card">
      <div className="crew-banner" style={{ background: crew.color }}>
        <div className="mark">{crew.tag}</div>
      </div>
      <div className="crew-body">
        <h4>{crew.name}</h4>
        <p>{crew.description}</p>
        <div className="crew-meta">
          <div className="crew-avatars">
            {[...Array(Math.min(5, crew.memberCount))].map((_, i) => (
              <div
                key={i}
                className="ava"
                style={{
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                }}
              >
                —
              </div>
            ))}
          </div>
          <span>
            {crew.memberCount}
            {crew.levelRange ? ` · ${crew.levelRange}` : ""}
            {crew.meetingCadence ? ` · ${crew.meetingCadence}` : ""}
            {crew.visibility === "invite-only" ? " · INVITE ONLY" : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Link href={`/crews/${crew.id}`} style={{ flex: 1 }}>
            <Button
              size="sm"
              variant={mine ? "primary" : "ghost"}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {mine ? "Open →" : "Peek in →"}
            </Button>
          </Link>
          {mine && <Tag tone="mint">MEMBER</Tag>}
        </div>
      </div>
    </div>
  );
}

function CrewsSkel() {
  return (
    <div className="crews-grid" style={{ marginBottom: 24 }}>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="card-dark animate-pulse"
          style={{ height: 240 }}
        />
      ))}
    </div>
  );
}
