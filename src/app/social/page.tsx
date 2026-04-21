"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/ui/primitives";
import { useAuthContext } from "@/components/AuthProvider";
import { mergePrivacy } from "@/lib/social/privacy";
import FriendsTab from "@/components/social/FriendsTab";
import CrewsTab from "@/components/social/CrewsTab";
import MeetupsTab from "@/components/social/MeetupsTab";
import FeedTab from "@/components/social/FeedTab";
import {
  LiveNowWidget,
  DMsWidget,
} from "@/components/social/widgets";
import SocialOff from "@/components/social/SocialOff";
import NearbyReal from "@/components/social/NearbyReal";

type TabId = "nearby" | "friends" | "crews" | "meetups" | "feed";

const TABS: { id: TabId; lbl: string }[] = [
  { id: "nearby", lbl: "NEARBY" },
  { id: "friends", lbl: "FRIENDS" },
  { id: "crews", lbl: "CREWS" },
  { id: "meetups", lbl: "MEETUPS" },
  { id: "feed", lbl: "FEED" },
];

export default function SocialPage() {
  const { profile } = useAuthContext();
  const [tab, setTab] = useState<TabId>("nearby");

  const privacy = mergePrivacy(profile?.privacy);
  const socialOn = privacy.socialEnabled;
  const hasAlias = Boolean(profile?.alias);

  if (!socialOn) {
    return (
      <div>
        <div className="social-header">
          <div>
            <Eyebrow>THE SOCIAL HUB</Eyebrow>
            <h2 className="hed hed-l" style={{ marginTop: 10 }}>
              Skate with people.
            </h2>
            <p className="dim" style={{ maxWidth: "52ch", marginTop: 8 }}>
              Solo is fine. With others is better. Matched by tier, what
              you&apos;re working on, and proximity — always alias-only.
            </p>
          </div>
        </div>
        <SocialOff hasAlias={hasAlias} />
      </div>
    );
  }

  return (
    <div>

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
            </button>
          ))}
        </div>
      </div>

      <div className="social-layout">
        <div>
          {tab === "nearby" && <NearbyReal />}
          {tab === "friends" && <FriendsTab />}
          {tab === "crews" && <CrewsTab />}
          {tab === "meetups" && <MeetupsTab />}
          {tab === "feed" && <FeedTab />}
        </div>
        <div className="social-side">
          <LiveNowWidget />
          <DMsWidget />
        </div>
      </div>
    </div>
  );
}
