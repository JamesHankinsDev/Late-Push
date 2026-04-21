"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/components/AuthProvider";
import {
  getMyPresence,
  listLiveNowVisibleTo,
  startLive,
  stopLive,
} from "@/lib/sources/livePresence";
import { blockedUidsFor } from "@/lib/sources/blocks";
import { listMyConversations } from "@/lib/sources/conversations";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { Conversation, LivePresence } from "@/lib/types";
import { Button } from "@/components/ui/primitives";

// ==========================================================================
// LIVE NOW — manual presence, polled every 45s
// ==========================================================================

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
            <div key={s.uid} className="live-skater">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// DMs — latest 3 conversations
// ==========================================================================

export function DMsWidget() {
  const { profile } = useAuthContext();
  const [convs, setConvs] = useState<Conversation[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const list = await listMyConversations(profile.uid);
        setConvs(list.slice(0, 3));
      } catch {
        setConvs([]);
      }
    })();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="widget">
      <div className="widget-head">
        <span className="ttl">DMs</span>
        <Link
          href="/dms"
          className="label"
          style={{ color: "var(--hazard)" }}
        >
          OPEN →
        </Link>
      </div>
      {convs === null ? (
        <div style={{ display: "grid", gap: 8 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 38,
                background: "var(--ink-3)",
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      ) : convs.length === 0 ? (
        <p className="dim small" style={{ margin: 0 }}>
          No conversations yet. Message someone from Nearby or Friends.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {convs.map((c) => {
            const otherAlias =
              c.userA === profile.uid ? c.aliasB : c.aliasA;
            const otherColor =
              c.userA === profile.uid ? c.aliasColorB : c.aliasColorA;
            return (
              <Link
                key={c.id}
                href={`/dms/${c.id}`}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px dashed var(--ink-3)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      otherColor ?? aliasColor(otherAlias.toLowerCase()),
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--display)",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {aliasInitials(otherAlias)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--paper)",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    @{otherAlias}
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
                    {c.lastMessage ?? "No messages yet."}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
