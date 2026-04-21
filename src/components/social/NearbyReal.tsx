"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { fetchNearby } from "@/lib/sources/publicProfiles";
import { block } from "@/lib/sources/blocks";
import { openConversation } from "@/lib/sources/conversations";
import {
  getFriendship,
  sendFriendRequest,
} from "@/lib/sources/friendships";
import {
  canSendFriendRequest,
  computeTrustLevel,
} from "@/lib/social/friendship";
import { PublicProfile, Friendship } from "@/lib/types";
import { aliasInitials } from "@/lib/social/aliases";
import { mergePrivacy } from "@/lib/social/privacy";
import { getTrickById } from "@/lib/curriculum";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

type NearbyProfile = PublicProfile & { homeSpotDistanceMi: number };

const TIER_LABELS = [
  "STARTER",
  "FOUNDATIONS",
  "MANEUVERING",
  "FIRST TRICKS",
  "INTERMEDIATE",
];

export default function NearbyReal() {
  const { profile } = useAuthContext();
  const [rows, setRows] = useState<NearbyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "tier" | "trick">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const radius = profile?.nearbyRadiusMi ?? 5;

  useEffect(() => {
    if (!profile) return;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchNearby({
          viewerUid: profile.uid,
          viewerLat: profile.homeSpotLat,
          viewerLng: profile.homeSpotLng,
          radiusMi: radius,
        });
        setRows(result);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile, radius]);

  const myTier = profile?.currentTier ?? 0;
  const myWorkingNames: string[] = Object.entries(profile?.trickProgress ?? {})
    .filter(([, p]) => p.status === "practicing")
    .map(([id]) => getTrickById(id)?.name ?? "")
    .filter(Boolean);

  const filtered = rows.filter((r) => {
    if (filter === "tier") return r.currentTier === myTier;
    if (filter === "trick") {
      if (myWorkingNames.length === 0) return false;
      return myWorkingNames.some((name) => r.workingOn.includes(name));
    }
    return true;
  });

  const [friendships, setFriendships] = useState<Record<string, Friendship | null>>(
    {}
  );

  // After rows load, probe each one's friendship status so the card shows
  // accurate CTA state (pending / accepted / none). One Firestore read per
  // candidate — fine at MVP scale, can denormalize onto publicProfiles
  // later if it gets chatty.
  useEffect(() => {
    if (!profile || rows.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        rows.map(async (r) => {
          try {
            const f = await getFriendship(profile.uid, r.uid);
            return [r.uid, f] as const;
          } catch {
            return [r.uid, null] as const;
          }
        })
      );
      if (cancelled) return;
      setFriendships(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, rows]);

  async function handleBlock(uid: string) {
    if (!profile || busy) return;
    setBusy(uid);
    try {
      await block(profile.uid, uid);
      setRows((prev) => prev.filter((r) => r.uid !== uid));
    } finally {
      setBusy(null);
    }
  }

  const router = useRouter();

  async function handleDm(target: PublicProfile) {
    if (!profile || busy) return;
    setBusy(target.uid);
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
      alert(err instanceof Error ? err.message : "Couldn't start a DM.");
    } finally {
      setBusy(null);
    }
  }

  async function handleFriendRequest(target: PublicProfile) {
    if (!profile || busy) return;
    setBusy(target.uid);
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
      setFriendships((prev) => ({ ...prev, [target.uid]: sent }));
    } catch {
      // Silent — the canSendFriendRequest check should catch most cases;
      // a race (two requests at once) just results in an error here.
    } finally {
      setBusy(null);
    }
  }

  if (!profile) return null;

  const privacy = mergePrivacy(profile.privacy);
  const notDiscoverable = !privacy.discoverableInNearby;

  return (
    <div>
      {notDiscoverable && (
        <div
          className="card-dark"
          style={{
            padding: 14,
            marginBottom: 18,
            borderColor: "var(--hazard)",
            background: "rgba(245,212,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Tag tone="yellow">YOU&apos;RE HIDDEN</Tag>
            <span className="dim" style={{ fontSize: 13, flex: 1 }}>
              You can see others but they can&apos;t see you. Turn on
              &ldquo;Discoverable in Nearby&rdquo; in settings to be matched back.
            </span>
            <Link href="/settings/privacy">
              <Button variant="ghost" size="sm">
                Settings →
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 18,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span className="label" style={{ marginRight: 4 }}>
          MATCH BY →
        </span>
        {(
          [
            { id: "all", lbl: "ALL" },
            { id: "tier", lbl: "SAME TIER" },
            { id: "trick", lbl: "MY TRICKS" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background:
                filter === f.id ? "var(--hazard)" : "var(--ink)",
              color: filter === f.id ? "var(--ink)" : "var(--paper-dim)",
              border: "1px solid var(--ink-3)",
              padding: "6px 10px",
              borderRadius: 4,
              fontFamily: "var(--body)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {f.lbl}
          </button>
        ))}
        <span className="label" style={{ marginLeft: "auto" }}>
          {filtered.length} · {radius}MI RADIUS
        </span>
      </div>

      {loading ? (
        <div className="skaters-grid">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 200 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 32, textAlign: "center" }}
        >
          <Eyebrow>QUIET ZONE</Eyebrow>
          <p
            className="dim"
            style={{ fontSize: 14, marginTop: 12, maxWidth: "40ch", margin: "12px auto 0" }}
          >
            No other skaters within {radius} miles of your home spot right
            now. Check back — you&apos;re probably early.
          </p>
        </div>
      ) : (
        <div className="skaters-grid">
          {filtered.map((p) => (
            <NearbyCard
              key={p.uid}
              p={p}
              viewerTier={myTier}
              friendship={friendships[p.uid] ?? null}
              onBlock={() => handleBlock(p.uid)}
              onFriendRequest={() => handleFriendRequest(p)}
              onDm={() => handleDm(p)}
              busy={busy === p.uid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NearbyCard({
  p,
  viewerTier,
  friendship,
  onBlock,
  onFriendRequest,
  onDm,
  busy,
}: {
  p: NearbyProfile;
  viewerTier: number;
  friendship: Friendship | null;
  onBlock: () => void;
  onFriendRequest: () => void;
  onDm: () => void;
  busy: boolean;
}) {
  const tierLabel = TIER_LABELS[p.currentTier] ?? "";
  const eligibility = canSendFriendRequest(
    { currentTier: viewerTier },
    { privacy: p.privacy, currentTier: p.currentTier },
    friendship
  );
  const trust = computeTrustLevel(friendship);

  let friendCta: { label: string; disabled: boolean; title?: string };
  if (friendship?.status === "accepted") {
    friendCta = {
      label: trust === "trusted" ? "Trusted friend" : "Friends",
      disabled: true,
    };
  } else if (friendship?.status === "pending") {
    friendCta = { label: "Pending…", disabled: true };
  } else if (eligibility.ok) {
    friendCta = { label: busy ? "Sending…" : "Friend request", disabled: busy };
  } else {
    friendCta = { label: "Can't request", disabled: true, title: eligibility.reason };
  }

  return (
    <div className="skater-card">
      <div className="head">
        <div
          className="avatar"
          style={{ background: p.aliasColor, width: 48, height: 48 }}
        >
          {aliasInitials(p.alias)}
        </div>
        <div className="name-line">
          <span className="nm">@{p.alias}</span>
          <span className="distance">
            ~{p.homeSpotDistanceMi} MI
            {p.homeSpotName ? ` · ${p.homeSpotName.toUpperCase()}` : ""}
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
        <span className="lvl">
          T{p.currentTier}
          {tierLabel ? ` · ${tierLabel}` : ""}
        </span>
        <Tag tone="outline">{p.daysAsMember}D</Tag>
        <Tag tone="outline">{p.landedCount} LANDED</Tag>
      </div>
      <div className="actions" style={{ flexWrap: "wrap" }}>
        <Button
          size="sm"
          variant={
            friendship?.status === "accepted" ? "mint" : "primary"
          }
          onClick={onFriendRequest}
          disabled={friendCta.disabled}
          title={friendCta.title}
        >
          {friendCta.label}
        </Button>
        {p.privacy.dmsFrom !== "none" && (
          <Button size="sm" variant="ghost" onClick={onDm} disabled={busy}>
            Message
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onBlock} disabled={busy}>
          {busy ? "…" : "Block"}
        </Button>
      </div>
    </div>
  );
}
