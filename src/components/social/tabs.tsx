"use client";

import { useState } from "react";
import {
  MOCK_SKATERS,
  MOCK_CREWS,
  MOCK_MEETUPS,
  MOCK_FEED,
} from "@/lib/social/mock";
import { Button, Tag } from "@/components/ui/primitives";

const CREW_AVATAR_COLORS = ["#f5d400", "#ff5a3c", "#78d19a", "#b38cff", "#7ec7ff"];

const NEARBY_FILTERS = [
  { id: "all", lbl: "ALL" },
  { id: "tier", lbl: "SAME TIER" },
  { id: "trick", lbl: "MY TRICKS" },
  { id: "vibe", lbl: "MY VIBE" },
  { id: "live", lbl: "LIVE NOW" },
] as const;

type NearbyFilter = (typeof NEARBY_FILTERS)[number]["id"];

export function NearbyTab() {
  const [filter, setFilter] = useState<NearbyFilter>("all");

  const filtered =
    filter === "live"
      ? MOCK_SKATERS.filter((s) => s.live)
      : filter === "tier"
      ? MOCK_SKATERS.filter((s) => s.tier === 3)
      : MOCK_SKATERS;

  return (
    <div>
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
        {NEARBY_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`tweak-chip ${filter === f.id ? "on" : ""}`}
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
        <span
          className="label"
          style={{ marginLeft: "auto" }}
        >
          {filtered.length} SKATERS · 5MI RADIUS
        </span>
      </div>
      <div className="skaters-grid">
        {filtered.map((s) => (
          <div key={s.id} className={`skater-card ${s.live ? "live" : ""}`}>
            {s.live && (
              <div className="live-banner">
                <span className="live-dot" /> LIVE · {s.spot}
              </div>
            )}
            <div className="head">
              <div className="avatar" style={{ background: s.color }}>
                {s.avatar}
              </div>
              <div className="name-line">
                <span className="nm">{s.name}</span>
                <span className="distance">
                  {s.distance} ·{" "}
                  <span style={{ color: "var(--hazard)" }}>
                    {s.match}% MATCH
                  </span>
                </span>
              </div>
            </div>
            <div className="working-on">
              Working on <b>{s.workingOn}</b>
            </div>
            <div className="tier-strip">
              <span className="lvl">TIER {s.tier}</span>
              {s.vibe.map((v) => (
                <Tag key={v} tone="outline">
                  {v}
                </Tag>
              ))}
            </div>
            <div className="actions">
              <Button size="sm" variant="primary" disabled>
                {s.live ? "Pull up" : "Say hi"}
              </Button>
              <Button size="sm" variant="ghost" disabled>
                Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CrewsTab() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <span className="label">4 CREWS NEARBY · 0 YOU&apos;RE IN</span>
        <Button size="sm" variant="ghost" disabled>
          + Start a crew
        </Button>
      </div>
      <div className="crews-grid">
        {MOCK_CREWS.map((c) => (
          <div key={c.id} className="crew-card">
            <div className="crew-banner" style={{ background: c.color }}>
              <div className="mark">{c.tag}</div>
            </div>
            <div className="crew-body">
              <h4>{c.name}</h4>
              <p>{c.desc}</p>
              <div className="crew-meta">
                <div className="crew-avatars">
                  {c.avatars.map((a, i) => (
                    <div
                      key={i}
                      className="ava"
                      style={{
                        background: CREW_AVATAR_COLORS[i % CREW_AVATAR_COLORS.length],
                      }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
                <span>
                  {c.members} · {c.level} · {c.mtgs}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Button size="sm" variant="primary" disabled>
                  Join
                </Button>
                <Button size="sm" variant="ghost" disabled>
                  Peek in
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MeetupsTab() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <span className="label">UPCOMING · NEXT 14 DAYS</span>
        <Button size="sm" variant="primary" disabled>
          + Plan a session
        </Button>
      </div>
      <div className="meetups-list">
        {MOCK_MEETUPS.map((m) => (
          <div key={m.id} className="meetup-card">
            <div className="meetup-date">
              <div className="mo">{m.mo}</div>
              <div className="day">{m.day}</div>
              <div className="time">{m.time}</div>
            </div>
            <div className="meetup-info">
              <h5>{m.title}</h5>
              <div className="loc">◉ {m.loc}</div>
              <div className="focus">{m.focus}</div>
            </div>
            <div className="meetup-go">
              <Button variant="primary" size="sm" disabled>
                I&apos;m in
              </Button>
              <span className="rsvp-count">
                {m.going} GOING · {m.crew}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedTab() {
  const [reacts, setReacts] = useState<
    Record<string, Partial<Record<"push" | "same" | "fire", boolean>>>
  >({});
  const toggle = (postId: string, type: "push" | "same" | "fire") =>
    setReacts((r) => ({
      ...r,
      [postId]: { ...r[postId], [type]: !r[postId]?.[type] },
    }));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["FOLLOWING", "MY TIER", "MY TRICK", "NEARBY"].map((label, i) => (
          <button
            key={label}
            style={{
              background: i === 0 ? "var(--hazard)" : "var(--ink)",
              color: i === 0 ? "var(--ink)" : "var(--paper-dim)",
              border: "1px solid var(--ink-3)",
              padding: "6px 10px",
              borderRadius: 4,
              fontFamily: "var(--body)",
              fontSize: 12,
              cursor: "not-allowed",
            }}
            disabled
          >
            {label}
          </button>
        ))}
      </div>

      <div className="feed">
        {MOCK_FEED.map((p) => {
          const r = reacts[p.id] ?? {};
          return (
            <div key={p.id} className="feed-post">
              <div className="post-head">
                <div className="avatar" style={{ background: p.color }}>
                  {p.avatar}
                </div>
                <div className="meta">
                  <span className="nm">{p.user}</span>
                  <span className="ts">
                    @{p.handle} · {p.when} AGO
                  </span>
                </div>
                <div className="spacer" />
                <button className="react-btn" disabled>
                  ···
                </button>
              </div>
              <div className="post-body">
                <p>{p.body}</p>
              </div>
              <div className={`post-hero ${p.stampColor === "ko" ? "ko" : ""}`}>
                <div className="stamp-banner">{p.stamp}</div>
                {p.art}
              </div>
              <div className="post-actions">
                <button
                  className={`react-btn ${r.push ? "on" : ""}`}
                  onClick={() => toggle(p.id, "push")}
                >
                  ▲ PUSH · {p.reacts.push + (r.push ? 1 : 0)}
                </button>
                <button
                  className={`react-btn ${r.same ? "on" : ""}`}
                  onClick={() => toggle(p.id, "same")}
                >
                  ◉ SAME BOAT · {p.reacts.same + (r.same ? 1 : 0)}
                </button>
                <button
                  className={`react-btn ${r.fire ? "on" : ""}`}
                  onClick={() => toggle(p.id, "fire")}
                >
                  ✺ FIRE · {p.reacts.fire + (r.fire ? 1 : 0)}
                </button>
                <button
                  className="react-btn"
                  style={{ marginLeft: "auto" }}
                  disabled
                >
                  ✎ {p.comments} comments
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
