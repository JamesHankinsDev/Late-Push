"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { listMyConversations } from "@/lib/sources/conversations";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { Conversation } from "@/lib/types";
import { Button, Eyebrow } from "@/components/ui/primitives";

export default function InboxPage() {
  const { profile } = useAuthContext();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const list = await listMyConversations(profile.uid);
      setConvs(list);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!profile) return null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>DMS</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Your conversations.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          Alias-only chat. Messages are moderated for PII sharing,
          pressure tactics, and harassment. Start a conversation from any
          Nearby or Friends card.
        </p>
      </div>

      {loading && convs.length === 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 68 }}
            />
          ))}
        </div>
      ) : convs.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 32, textAlign: "center" }}
        >
          <Eyebrow>QUIET INBOX</Eyebrow>
          <p
            className="dim"
            style={{ fontSize: 14, marginTop: 12, marginBottom: 20 }}
          >
            No DMs yet. Start one from the Social tab — Nearby or Friends.
          </p>
          <Link href="/social">
            <Button variant="primary">Find people →</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {convs.map((c) => {
            const otherAlias =
              c.userA === profile.uid ? c.aliasB : c.aliasA;
            const otherColor =
              c.userA === profile.uid ? c.aliasColorB : c.aliasColorA;
            return (
              <Link
                key={c.id}
                href={`/dms/${c.id}`}
                className="card-dark"
                style={{
                  padding: 14,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background:
                      otherColor ?? aliasColor(otherAlias.toLowerCase()),
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--hammer)",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {aliasInitials(otherAlias)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--display)",
                        fontSize: 15,
                        letterSpacing: "0.04em",
                      }}
                    >
                      @{otherAlias}
                    </span>
                    {c.lastMessageAt && (
                      <span className="label">
                        {relativeTime(c.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div
                    className="dim"
                    style={{
                      fontSize: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.lastMessage ?? "No messages yet."}
                  </div>
                </div>
                <span style={{ color: "var(--paper-dim)" }}>→</span>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/social">
          <Button variant="ghost">← Social</Button>
        </Link>
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "NOW";
  if (mins < 60) return `${mins}M`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H`;
  const days = Math.floor(hrs / 24);
  return `${days}D`;
}
