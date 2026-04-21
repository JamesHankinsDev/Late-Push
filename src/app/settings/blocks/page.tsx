"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { listBlocks, unblock } from "@/lib/sources/blocks";
import { getPublicProfile } from "@/lib/sources/publicProfiles";
import { Block, PublicProfile } from "@/lib/types";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { Button, Eyebrow } from "@/components/ui/primitives";

interface BlockedRow {
  block: Block;
  profile: PublicProfile | null;
}

export default function BlockedUsersPage() {
  const { profile } = useAuthContext();
  const [rows, setRows] = useState<BlockedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      setLoading(true);
      try {
        const blocks = await listBlocks(profile.uid);
        const withProfiles = await Promise.all(
          blocks.map(async (b) => ({
            block: b,
            profile: await getPublicProfile(b.blockedUid).catch(() => null),
          }))
        );
        setRows(withProfiles);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile]);

  async function handleUnblock(b: Block) {
    if (!profile || busy) return;
    setBusy(b.blockedUid);
    try {
      await unblock(profile.uid, b.blockedUid);
      setRows((prev) => prev.filter((r) => r.block.blockedUid !== b.blockedUid));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>BLOCK LIST</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Who you&apos;ve blocked.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          Blocked users can&apos;t see you in Nearby, on the leaderboard, in
          crew lists, or message you. You can unblock anyone here.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 68 }}
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 32, textAlign: "center" }}
        >
          <Eyebrow tone="mint">NO BLOCKS</Eyebrow>
          <p
            className="dim"
            style={{ marginTop: 12, fontSize: 14 }}
          >
            Nobody on your block list. If someone&apos;s behavior feels off,
            you can always report and block them from their card.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => {
            const p = row.profile;
            const alias = p?.alias ?? "unknown_alias";
            const color = p?.aliasColor ?? aliasColor(alias.toLowerCase());
            return (
              <div
                key={row.block.blockedUid}
                className="card-dark"
                style={{
                  padding: 14,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
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
                  {aliasInitials(alias)}
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
                    @{alias}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      color: "var(--paper-dim)",
                      marginTop: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Blocked{" "}
                    {new Date(row.block.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy === row.block.blockedUid}
                  onClick={() => handleUnblock(row.block)}
                >
                  {busy === row.block.blockedUid ? "…" : "Unblock"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/settings">
          <Button variant="ghost">← Settings</Button>
        </Link>
      </div>
    </div>
  );
}
