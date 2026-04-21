"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import {
  findPublicProfileByAlias,
} from "@/lib/sources/publicProfiles";
import {
  getFriendship,
  sendFriendRequest,
} from "@/lib/sources/friendships";
import { openConversation } from "@/lib/sources/conversations";
import {
  canSendFriendRequest,
} from "@/lib/social/friendship";
import { validateAlias } from "@/lib/social/aliases";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { Friendship, PublicProfile } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

type Result =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "invalid"; hint: string }
  | { status: "not-found" }
  | {
      status: "found";
      profile: PublicProfile;
      friendship: Friendship | null;
    };

export default function FriendSearch({
  onAfterAction,
}: {
  onAfterAction?: () => void;
}) {
  const { profile } = useAuthContext();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result>({ status: "idle" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const raw = query.trim().replace(/^@/, "");
    if (!raw) return;

    const v = validateAlias(raw);
    if (!v.ok) {
      setResult({ status: "invalid", hint: v.hint ?? "Invalid alias" });
      return;
    }

    setResult({ status: "searching" });
    setError("");
    try {
      const pub = await findPublicProfileByAlias(raw, profile.uid);
      if (!pub) {
        setResult({ status: "not-found" });
        return;
      }
      const friendship = await getFriendship(profile.uid, pub.uid);
      setResult({ status: "found", profile: pub, friendship });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setResult({ status: "idle" });
    }
  }

  async function handleFriendRequest(target: PublicProfile) {
    if (!profile || busy) return;
    setBusy(true);
    setError("");
    try {
      const sent = await sendFriendRequest(
        profile.uid,
        target.uid,
        {
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        },
        { alias: target.alias, aliasColor: target.aliasColor }
      );
      setResult({ status: "found", profile: target, friendship: sent });
      onAfterAction?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't send the request."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDm(target: PublicProfile) {
    if (!profile || busy) return;
    setBusy(true);
    try {
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
      setError(err instanceof Error ? err.message : "Couldn't start a DM.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="card-dark"
      style={{ padding: 16, marginBottom: 18 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Eyebrow>FIND A SKATER</Eyebrow>
        <span className="label">
          SEARCH BY ALIAS · EXACT MATCH
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "var(--ink)",
            border: "1px solid var(--ink-3)",
            borderRadius: "var(--r-s)",
            padding: "0 12px",
          }}
        >
          <span
            className="mono"
            style={{
              color: "var(--paper-dim)",
              fontSize: 14,
              paddingRight: 6,
            }}
          >
            @
          </span>
          <input
            type="text"
            value={query.replace(/^@/, "")}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="their_alias"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              padding: "10px 0",
              color: "var(--paper)",
              fontFamily: "var(--body)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
        <Button type="submit" variant="primary" size="sm" disabled={!query.trim()}>
          Find
        </Button>
      </form>

      {error && (
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--coral)",
            marginTop: 10,
          }}
        >
          {error}
        </div>
      )}

      <ResultBlock
        result={result}
        viewerTier={profile?.currentTier ?? 0}
        busy={busy}
        onFriendRequest={handleFriendRequest}
        onDm={handleDm}
      />
    </div>
  );
}

function ResultBlock({
  result,
  viewerTier,
  busy,
  onFriendRequest,
  onDm,
}: {
  result: Result;
  viewerTier: number;
  busy: boolean;
  onFriendRequest: (p: PublicProfile) => void;
  onDm: (p: PublicProfile) => void;
}) {
  if (result.status === "idle") return null;
  if (result.status === "searching") {
    return (
      <div
        className="dim small"
        style={{ marginTop: 12, textAlign: "center" }}
      >
        Looking…
      </div>
    );
  }
  if (result.status === "invalid") {
    return (
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--coral)",
          marginTop: 10,
        }}
      >
        ✕ {result.hint}
      </div>
    );
  }
  if (result.status === "not-found") {
    return (
      <div
        className="card-dark"
        style={{
          padding: 14,
          marginTop: 12,
          borderColor: "var(--paper-dim)",
          background: "var(--ink)",
        }}
      >
        <p className="dim small" style={{ margin: 0 }}>
          No match. Either the alias doesn&apos;t exist, the person
          hasn&apos;t enabled social, or they&apos;ve turned off alias
          search.
        </p>
      </div>
    );
  }

  const { profile: p, friendship } = result;
  const eligibility = canSendFriendRequest(
    { currentTier: viewerTier },
    { privacy: p.privacy, currentTier: p.currentTier },
    friendship
  );

  let friendCta: { label: string; disabled: boolean; title?: string };
  if (friendship?.status === "accepted") {
    friendCta = { label: "Friends", disabled: true };
  } else if (friendship?.status === "pending") {
    friendCta = { label: "Pending…", disabled: true };
  } else if (eligibility.ok) {
    friendCta = { label: "Send friend request", disabled: busy };
  } else {
    friendCta = {
      label: "Can't request",
      disabled: true,
      title: eligibility.reason,
    };
  }

  return (
    <div className="skater-card" style={{ marginTop: 14 }}>
      <div className="head">
        <div
          className="avatar"
          style={{
            background: p.aliasColor ?? aliasColor(p.alias.toLowerCase()),
            width: 48,
            height: 48,
          }}
        >
          {aliasInitials(p.alias)}
        </div>
        <div className="name-line">
          <span className="nm">@{p.alias}</span>
          <span className="distance">
            TIER {p.currentTier} · {p.daysAsMember} DAYS
          </span>
        </div>
      </div>
      <div className="working-on">
        {p.workingOn.length > 0 ? (
          <>
            Working on <b>{p.workingOn.slice(0, 2).join(", ")}</b>
            {p.workingOn.length > 2 && ` +${p.workingOn.length - 2}`}
          </>
        ) : (
          <span className="dim">No tricks in progress</span>
        )}
      </div>
      <div className="tier-strip">
        <Tag tone="outline">{p.landedCount} LANDED</Tag>
        {p.homeSpotName && (
          <Tag tone="outline">HOME · {p.homeSpotName.toUpperCase()}</Tag>
        )}
      </div>
      <div className="actions" style={{ flexWrap: "wrap" }}>
        <Button
          size="sm"
          variant="primary"
          disabled={friendCta.disabled}
          onClick={() => onFriendRequest(p)}
          title={friendCta.title}
        >
          {friendCta.label}
        </Button>
        {p.privacy.dmsFrom !== "none" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onDm(p)}
          >
            Message
          </Button>
        )}
      </div>
    </div>
  );
}
