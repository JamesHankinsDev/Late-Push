"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { fetchNearby } from "@/lib/sources/publicProfiles";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { mergePrivacy } from "@/lib/social/privacy";
import { PublicProfile } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

type NearbyRow = PublicProfile & { homeSpotDistanceMi: number };

const MAX_SHOWN = 3;

export default function NearbyPreview() {
  const { profile } = useAuthContext();
  const [rows, setRows] = useState<NearbyRow[] | null>(null);

  const privacy = mergePrivacy(profile?.privacy);
  const canFetch =
    !!profile &&
    privacy.socialEnabled &&
    privacy.discoverableInNearby &&
    !!profile.homeSpotLat &&
    !!profile.homeSpotLng;

  useEffect(() => {
    if (!profile || !canFetch) {
      setRows([]);
      return;
    }
    (async () => {
      try {
        const res = await fetchNearby({
          viewerUid: profile.uid,
          viewerLat: profile.homeSpotLat,
          viewerLng: profile.homeSpotLng,
          radiusMi: profile.nearbyRadiusMi ?? 5,
        });
        setRows(res.slice(0, MAX_SHOWN));
      } catch {
        setRows([]);
      }
    })();
  }, [profile, canFetch]);

  // Not yet opted in — soft prompt
  if (!canFetch) {
    return (
      <div className="card-dark" style={{ padding: 18, textAlign: "center" }}>
        <Eyebrow>NEARBY IS OFF</Eyebrow>
        <p
          className="dim"
          style={{ fontSize: 13, margin: "12px 0 16px" }}
        >
          {!privacy.socialEnabled
            ? "Turn on social to see skaters within 5 miles of your home spot."
            : !profile?.homeSpotId
            ? "Pick a home spot so Nearby can match you with skaters close by."
            : "Turn on Nearby in privacy settings to see who's around."}
        </p>
        <Link href="/settings/privacy">
          <Button size="sm" variant="primary">
            Privacy settings →
          </Button>
        </Link>
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="skaters-grid">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="card-dark animate-pulse"
            style={{ height: 200 }}
          />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="card-dark" style={{ padding: 20, textAlign: "center" }}>
        <p className="dim small" style={{ margin: 0 }}>
          No other skaters within {profile?.nearbyRadiusMi ?? 5} miles of your
          home spot yet. Check the Social tab from time to time.
        </p>
      </div>
    );
  }

  return (
    <div className="skaters-grid">
      {rows.map((p) => (
        <div key={p.uid} className="skater-card">
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
            <span className="lvl">TIER {p.currentTier}</span>
            <Tag tone="outline">{p.daysAsMember}D</Tag>
            <Tag tone="outline">{p.landedCount} LANDED</Tag>
          </div>
        </div>
      ))}
    </div>
  );
}
