"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { Bar } from "@/components/ui/primitives";
import { TIERS, TRICKS } from "@/lib/curriculum";

const NAV_ITEMS = [
  { href: "/dashboard", label: "TODAY", n: "01" },
  { href: "/tricks", label: "PATH", n: "02" },
  { href: "/spots", label: "SPOTS", n: "03" },
  { href: "/social", label: "SOCIAL", n: "04" },
  { href: "/profile", label: "PROFILE", n: "05" },
];

const TIER_LABELS = [
  "STARTER",
  "FOUNDATIONS",
  "MANEUVERING",
  "FIRST TRICKS",
  "INTERMEDIATE",
];

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

  const currentTier = profile?.currentTier ?? 0;
  const tierTricks = TRICKS.filter((t) => t.tier === currentTier);
  const landedInTier = profile
    ? tierTricks.filter((t) => {
        const s = profile.trickProgress?.[t.id]?.status;
        return s === "landed_once" || s === "consistent" || s === "mastered";
      }).length
    : 0;
  const tierPct = tierTricks.length
    ? Math.round((landedInTier / tierTricks.length) * 100)
    : 0;
  const tierLabel = TIER_LABELS[currentTier] ?? "";
  const tierName = TIERS[currentTier]?.name ?? "";

  const logActive =
    pathname === "/sessions/new" || pathname.startsWith("/sessions/new");

  return (
    <nav className="nav">
      <Link href="/dashboard" className="logo">
        LATE<span className="accent">/</span>PUSH
      </Link>
      <div className="logo-sub">Never too late to skate</div>

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
                className="nav-item-num"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  opacity: 0.6,
                  width: 22,
                }}
              >
                {item.n}
              </span>
              <span className="nav-item-label">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Log session CTA — always visible, prominent */}
      <Link
        href="/sessions/new"
        className={`nav-log-cta ${logActive ? "active" : ""}`}
      >
        <span className="plus">+</span>
        <span>LOG SESSION</span>
      </Link>

      <div
        className="nav-tier-bar"
        style={{
          marginTop: 18,
          padding: "10px 12px",
          border: "1px dashed var(--ink-3)",
          borderRadius: 10,
        }}
      >
        <div className="label" style={{ marginBottom: 6 }}>
          {profile
            ? `Tier ${currentTier} · ${landedInTier} / ${tierTricks.length} landed`
            : "LOADING…"}
        </div>
        <Bar value={tierPct} />
      </div>

      <div className="nav-profile">
        <div className="avatar">
          {profile ? initialsFrom(profile.displayName) : "…"}
        </div>
        <div className="meta">
          <span className="name">
            {profile?.displayName || (profile ? "You" : "Loading…")}
          </span>
          <span className="xp">
            {profile
              ? `TIER ${currentTier} · ${tierLabel || tierName.toUpperCase()}`
              : ""}
          </span>
        </div>
      </div>

      <button
        className="nav-signout"
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
