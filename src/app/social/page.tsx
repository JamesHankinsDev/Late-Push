"use client";

import { useState } from "react";
import { Eyebrow, Tag } from "@/components/ui/primitives";
import {
  MOCK_SKATERS,
  MOCK_CREWS,
  MOCK_MEETUPS,
  MOCK_FEED,
} from "@/lib/social/mock";
import {
  NearbyTab,
  CrewsTab,
  MeetupsTab,
  FeedTab,
} from "@/components/social/tabs";
import {
  LiveNowWidget,
  LeaderboardWidget,
  DMsWidget,
} from "@/components/social/widgets";

type TabId = "nearby" | "crews" | "meetups" | "feed";

const TABS: { id: TabId; lbl: string; ct: number }[] = [
  { id: "nearby", lbl: "NEARBY", ct: MOCK_SKATERS.length },
  { id: "crews", lbl: "CREWS", ct: MOCK_CREWS.length },
  { id: "meetups", lbl: "MEETUPS", ct: MOCK_MEETUPS.length },
  { id: "feed", lbl: "FEED", ct: MOCK_FEED.length },
];

export default function SocialPage() {
  const [tab, setTab] = useState<TabId>("nearby");

  return (
    <div>
      {/* Preview notice */}
      <div
        className="card-dark"
        style={{
          padding: "12px 18px",
          marginBottom: 20,
          borderColor: "var(--hazard)",
          background: "rgba(245,212,0,0.04)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <Tag tone="yellow">PREVIEW</Tag>
        <div className="dim" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>
          Everything on this page is mock data — the Social backend
          isn&apos;t live yet. Buttons are disabled so nothing fakes a
          real interaction. The shape is final; the names aren&apos;t real.
        </div>
      </div>

      <div className="social-header">
        <div>
          <Eyebrow>THE SOCIAL HUB</Eyebrow>
          <h2 className="hed hed-l" style={{ marginTop: 10 }}>
            Skate with people.
          </h2>
          <p className="dim" style={{ maxWidth: "52ch", marginTop: 8 }}>
            Solo sessions are fine. Sessions with others are better. Matched by
            tier, what you&apos;re working on, and vibe — because a Tier 4
            grinder doesn&apos;t want to babysit your first ollies, and you
            don&apos;t want to feel bad about yours.
          </p>
        </div>
        <div className="social-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`social-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.lbl}
              <span className="ct">{t.ct}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="social-layout">
        <div>
          {tab === "nearby" && <NearbyTab />}
          {tab === "crews" && <CrewsTab />}
          {tab === "meetups" && <MeetupsTab />}
          {tab === "feed" && <FeedTab />}
        </div>
        <div className="social-side">
          <LiveNowWidget />
          <LeaderboardWidget />
          <DMsWidget />
        </div>
      </div>
    </div>
  );
}
