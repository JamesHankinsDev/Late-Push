"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import {
  acceptFriendRequest,
  declineFriendRequest,
  listAllFriendships,
  removeFriend,
} from "@/lib/sources/friendships";
import {
  openConversation,
  getPublicProfile,
} from "@/lib/sources/conversations";
import {
  computeTrustLevel,
  otherAlias,
  otherAliasColor,
  otherUid,
} from "@/lib/social/friendship";
import { Friendship, TrustLevel } from "@/lib/types";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { Button, Tag } from "@/components/ui/primitives";

interface State {
  friends: Friendship[];
  incoming: Friendship[];
  outgoing: Friendship[];
}

const TRUST_LABEL: Record<TrustLevel, string> = {
  stranger: "STRANGER",
  friend: "FRIEND",
  trusted: "TRUSTED",
};

const TRUST_TONE: Record<TrustLevel, "outline" | "yellow" | "mint"> = {
  stranger: "outline",
  friend: "yellow",
  trusted: "mint",
};

export default function FriendsTab() {
  const { profile } = useAuthContext();
  const router = useRouter();
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const all = await listAllFriendships(profile.uid);
      setState(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load friends.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onAccept(f: Friendship) {
    if (!profile || busy) return;
    setBusy(f.id);
    try {
      await acceptFriendRequest(f.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't accept.");
    } finally {
      setBusy(null);
    }
  }

  async function onDecline(f: Friendship) {
    if (!profile || busy) return;
    setBusy(f.id);
    try {
      await declineFriendRequest(f.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decline.");
    } finally {
      setBusy(null);
    }
  }

  async function onMessage(f: Friendship) {
    if (!profile || busy) return;
    setBusy(f.id);
    try {
      const targetUid = otherUid(f, profile.uid);
      const target = await getPublicProfile(targetUid);
      if (!target) {
        setError("Couldn't reach that profile.");
        return;
      }
      const conv = await openConversation(
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        },
        target
      );
      router.push(`/dms/${conv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open DM.");
    } finally {
      setBusy(null);
    }
  }

  async function onRemove(f: Friendship) {
    if (!profile || busy) return;
    setBusy(f.id);
    try {
      await removeFriend(f.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove.");
    } finally {
      setBusy(null);
    }
  }

  if (!profile) return null;
  const me = profile.uid;

  return (
    <div>
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

      {/* Incoming */}
      <SectionHead
        title="Incoming requests"
        count={state?.incoming.length ?? 0}
      />
      {loading ? (
        <Skel />
      ) : !state?.incoming.length ? (
        <EmptyRow text="No pending requests." />
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          {state.incoming.map((f) => (
            <FriendRow
              key={f.id}
              alias={otherAlias(f, me)}
              color={otherAliasColor(f, me)}
              rightLabel={
                <span className="label">
                  {relativeTime(f.createdAt)}
                </span>
              }
              actions={
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onAccept(f)}
                    disabled={busy === f.id}
                  >
                    {busy === f.id ? "…" : "Accept"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDecline(f)}
                    disabled={busy === f.id}
                  >
                    Decline
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Friends */}
      <SectionHead title="Friends" count={state?.friends.length ?? 0} />
      {loading ? (
        <Skel />
      ) : !state?.friends.length ? (
        <EmptyRow text="No friends yet. Find someone on Nearby and send a request." />
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          {state.friends.map((f) => {
            const trust = computeTrustLevel(f);
            return (
              <FriendRow
                key={f.id}
                alias={otherAlias(f, me)}
                color={otherAliasColor(f, me)}
                rightLabel={
                  <Tag tone={TRUST_TONE[trust]}>{TRUST_LABEL[trust]}</Tag>
                }
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onMessage(f)}
                      disabled={busy === f.id}
                    >
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(f)}
                      disabled={busy === f.id}
                    >
                      Remove
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}

      {/* Outgoing */}
      <SectionHead title="Sent requests" count={state?.outgoing.length ?? 0} />
      {loading ? (
        <Skel />
      ) : !state?.outgoing.length ? (
        <EmptyRow text="No pending requests you've sent." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {state.outgoing.map((f) => (
            <FriendRow
              key={f.id}
              alias={otherAlias(f, me)}
              color={otherAliasColor(f, me)}
              rightLabel={
                <span className="label">
                  PENDING · {relativeTime(f.createdAt)}
                </span>
              }
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDecline(f)}
                  disabled={busy === f.id}
                >
                  {busy === f.id ? "…" : "Cancel"}
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="sec-head">
      <h3>{title}</h3>
      <span className="label">{count}</span>
    </div>
  );
}

function FriendRow({
  alias,
  color,
  rightLabel,
  actions,
}: {
  alias: string;
  color?: string;
  rightLabel?: React.ReactNode;
  actions: React.ReactNode;
}) {
  const displayColor = color ?? aliasColor(alias.toLowerCase());
  return (
    <div
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
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: displayColor,
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--hammer)",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {aliasInitials(alias || "?")}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 16,
            letterSpacing: "0.04em",
            color: "var(--paper)",
          }}
        >
          @{alias || "unknown"}
        </div>
        <div style={{ marginTop: 4 }}>{rightLabel}</div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {actions}
      </div>
    </div>
  );
}

function Skel() {
  return (
    <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="card-dark animate-pulse"
          style={{ height: 68 }}
        />
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      className="card-dark"
      style={{ padding: 18, marginBottom: 24, textAlign: "center" }}
    >
      <p className="dim" style={{ fontSize: 13, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}D AGO`;
  return "LONG AGO";
}
