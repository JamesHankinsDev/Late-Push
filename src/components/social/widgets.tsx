"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MOCK_LEADERBOARD, MOCK_DMS } from "@/lib/social/mock";
import { useAuthContext } from "@/components/AuthProvider";
import {
  getMyPresence,
  listLiveNowVisibleTo,
  startLive,
  stopLive,
} from "@/lib/sources/livePresence";
import { blockedUidsFor } from "@/lib/sources/blocks";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { LivePresence } from "@/lib/types";
import { Button } from "@/components/ui/primitives";

export function LiveNowWidget() {
  const { profile } = useAuthContext();
  const [others, setOthers] = useState<LivePresence[]>([]);
  const [mine, setMine] = useState<LivePresence | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!profile) return;
    try {
      const [myPresence, blocked] = await Promise.all([
        getMyPresence(profile.uid),
        blockedUidsFor(profile.uid),
      ]);
      setMine(myPresence);
      const live = await listLiveNowVisibleTo(profile.uid, blocked);
      setOthers(live);
    } catch {
      setOthers([]);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
    // Cheap polling — live-now is a weak real-time surface.
    const t = setInterval(refresh, 45_000);
    return () => clearInterval(t);
  }, [refresh]);

  async function toggleLive() {
    if (!profile || busy) return;
    setBusy(true);
    try {
      if (mine) {
        await stopLive(profile.uid);
      } else {
        await startLive({
          uid: profile.uid,
          alias: profile.alias ?? "Skater",
          aliasColor: profile.aliasColor,
          spotId: profile.homeSpotId,
          spotName: profile.homeSpotName,
        });
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const canToggle =
    !!profile?.alias && profile?.privacy?.socialEnabled !== false;

  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">
          <span className="live-dot" style={{ marginRight: 6 }} /> LIVE NOW
        </span>
        <span className="label">{others.length} SKATING</span>
      </div>

      {canToggle && (
        <div style={{ marginBottom: 12 }}>
          <Button
            size="sm"
            variant={mine ? "coral" : "primary"}
            onClick={toggleLive}
            disabled={busy}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {mine
              ? busy
                ? "Stopping…"
                : "Stop live"
              : busy
              ? "Going live…"
              : "I'm skating now →"}
          </Button>
        </div>
      )}

      {others.length === 0 ? (
        <p className="dim small" style={{ margin: 0 }}>
          No one else is live right now.
        </p>
      ) : (
        <div className="live-rail">
          {others.slice(0, 6).map((s) => (
            <Link
              key={s.uid}
              href={`/social`}
              className="live-skater"
              style={{ textDecoration: "none" }}
            >
              <div
                className="avatar"
                style={{
                  background: s.aliasColor ?? aliasColor(s.alias.toLowerCase()),
                }}
              >
                {aliasInitials(s.alias)}
              </div>
              <div className="line">
                <span className="n">@{s.alias}</span>
                <span className="s">{s.spotName ?? "SOMEWHERE"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function LeaderboardWidget() {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">WEEK XP · FRIENDS</span>
        <span className="label">RESETS SUN</span>
      </div>
      {MOCK_LEADERBOARD.map((l) => (
        <div
          key={l.r}
          className={`lb-item ${l.r <= 3 ? "top-3" : ""}`}
          style={{
            background: l.you ? "rgba(255,90,60,0.06)" : "transparent",
            margin: "0 -4px",
            padding: "8px 4px",
            borderRadius: 4,
          }}
        >
          <span className="lb-rank">{l.r}</span>
          <div className="lb-avatar" style={{ background: l.color }}>
            {l.avatar}
          </div>
          <span
            className="lb-name"
            style={{
              color: l.you ? "var(--coral)" : "var(--paper)",
              fontWeight: l.you ? 700 : 400,
            }}
          >
            {l.name}
            {l.you && " ← you"}
          </span>
          <span className="lb-xp">{l.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

export function DMsWidget() {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">DMs</span>
        <span className="label">
          {MOCK_DMS.filter((d) => d.unread).length} UNREAD
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_DMS.map((c) => (
          <div
            key={c.nm}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px dashed var(--ink-3)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: c.color,
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--display)",
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {c.avatar}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  color: c.unread ? "var(--paper)" : "var(--paper-dim)",
                  fontWeight: c.unread ? 600 : 400,
                }}
              >
                {c.nm}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--paper-dim)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.preview}
              </div>
            </div>
            {c.unread && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--coral)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
