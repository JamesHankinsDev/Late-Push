"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { fetchNearby } from "@/lib/sources/publicProfiles";
import { block } from "@/lib/sources/blocks";
import { PublicProfile } from "@/lib/types";
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
              onBlock={() => handleBlock(p.uid)}
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
  onBlock,
  busy,
}: {
  p: NearbyProfile;
  onBlock: () => void;
  busy: boolean;
}) {
  const tierLabel = TIER_LABELS[p.currentTier] ?? "";
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
      <div className="actions">
        <Button size="sm" variant="ghost" disabled>
          Friend request
        </Button>
        <Button size="sm" variant="ghost" onClick={onBlock} disabled={busy}>
          {busy ? "…" : "Block"}
        </Button>
      </div>
    </div>
  );
}
