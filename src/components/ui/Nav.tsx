"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { Bar } from "@/components/ui/primitives";
import { TIERS, TRICKS } from "@/lib/curriculum";

const NAV_ITEMS = [
  { href: "/dashboard", label: "TODAY", n: "01" },
  { href: "/tricks", label: "PATH", n: "02" },
  { href: "/social", label: "SOCIAL", n: "03" },
  { href: "/profile", label: "PROFILE", n: "04" },
];

const TIER_LABELS = ["STARTER", "FOUNDATIONS", "MANEUVERING", "FIRST TRICKS", "INTERMEDIATE"];

function initialsFrom(name: string | null | undefined): string {
  if (!name) return "YO";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "YO";
}

export default function Nav() {
  const pathname = usePathname();
  const { profile, signOut } = useAuthContext();

  if (!profile) return null;

  // Progress within the current tier drives the nav bar — lightweight stand-in
  // for the design's XP bar until a real XP system exists.
  const currentTier = profile.currentTier ?? 0;
  const tierTricks = TRICKS.filter((t) => t.tier === currentTier);
  const landedInTier = tierTricks.filter((t) => {
    const s = profile.trickProgress?.[t.id]?.status;
    return s === "landed_once" || s === "consistent" || s === "mastered";
  }).length;
  const tierPct = tierTricks.length
    ? Math.round((landedInTier / tierTricks.length) * 100)
    : 0;
  const tierLabel = TIER_LABELS[currentTier] ?? "";
  const tierName = TIERS[currentTier]?.name ?? "";

  return (
    <nav className="nav">
      <Link href="/dashboard" className="logo">
        LATE<span className="accent">/</span>PUSH
      </Link>
      <div className="logo-sub">Skateboarding for people with jobs</div>

      <div className="nav-items">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "active" : ""}`}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  opacity: 0.6,
                  width: 22,
                }}
              >
                {item.n}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "10px 12px",
          border: "1px dashed var(--ink-3)",
          borderRadius: 10,
        }}
      >
        <div className="label" style={{ marginBottom: 6 }}>
          Tier {currentTier} · {landedInTier} / {tierTricks.length} landed
        </div>
        <Bar value={tierPct} />
      </div>

      <div className="nav-profile">
        <div className="avatar">{initialsFrom(profile.displayName)}</div>
        <div className="meta">
          <span className="name">{profile.displayName || "You"}</span>
          <span className="xp">
            TIER {currentTier} · {tierLabel || tierName.toUpperCase()}
          </span>
        </div>
      </div>

      <button
        onClick={signOut}
        style={{
          marginTop: 10,
          padding: "6px 10px",
          background: "transparent",
          color: "var(--paper-dim)",
          border: "1px dashed var(--ink-3)",
          borderRadius: 4,
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        SIGN OUT
      </button>
    </nav>
  );
}
