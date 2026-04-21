"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  listPublicUpcoming,
  listUpcomingForUser,
} from "@/lib/sources/meetups";
import { Meetup } from "@/lib/types";
import { Button, Tag } from "@/components/ui/primitives";
import { format } from "date-fns";

export default function MeetupsTab() {
  const { profile } = useAuthContext();
  const [mine, setMine] = useState<Meetup[]>([]);
  const [publics, setPublics] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        listUpcomingForUser(profile.uid),
        listPublicUpcoming(30),
      ]);
      setMine(m);
      setPublics(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load meetups.");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myIds = new Set(mine.map((m) => m.id));
  const othersPublic = publics.filter((m) => !myIds.has(m.id) && m.hostUid !== profile?.uid);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span className="label">
          UPCOMING · {mine.length} YOUR RSVPS · {publics.length} PUBLIC
        </span>
        <Link href="/meetups/new">
          <Button size="sm" variant="primary">
            + Plan a session
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="card-dark"
          style={{
            padding: 12,
            marginBottom: 18,
            borderColor: "var(--coral)",
            color: "var(--coral)",
          }}
        >
          {error}
        </div>
      )}

      {/* Your meetups */}
      <div className="sec-head">
        <h3>You&apos;re going</h3>
        <span className="label">{mine.length}</span>
      </div>
      {loading && mine.length === 0 ? (
        <Skel />
      ) : mine.length === 0 ? (
        <EmptyRow text="No RSVPs yet. Find a session below or start your own." />
      ) : (
        <div className="meetups-list" style={{ marginBottom: 24 }}>
          {mine.map((m) => (
            <MeetupRow key={m.id} m={m} mine />
          ))}
        </div>
      )}

      {/* Public discovery */}
      <div className="sec-head">
        <h3>Public meetups</h3>
        <span className="label">{othersPublic.length}</span>
      </div>
      {loading && othersPublic.length === 0 ? (
        <Skel />
      ) : othersPublic.length === 0 ? (
        <EmptyRow text="No public meetups on the calendar. Be the first." />
      ) : (
        <div className="meetups-list">
          {othersPublic.map((m) => (
            <MeetupRow key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MeetupRow({ m, mine }: { m: Meetup; mine?: boolean }) {
  const { mo, day } = dateParts(m.date);
  return (
    <Link
      href={`/meetups/${m.id}`}
      className="meetup-card"
      style={{ cursor: "pointer" }}
    >
      <div className="meetup-date">
        <div className="mo">{mo}</div>
        <div className="day">{day}</div>
        {m.time && <div className="time">{m.time}</div>}
      </div>
      <div className="meetup-info">
        <h5>{m.title}</h5>
        <div className="loc">◉ {m.spotName}</div>
        <div className="focus">{m.focus}</div>
      </div>
      <div className="meetup-go">
        {mine ? (
          <Tag tone="mint">GOING</Tag>
        ) : (
          <span className="label" style={{ color: "var(--hazard)" }}>
            VIEW →
          </span>
        )}
        <span className="rsvp-count">
          {m.goingCount} GOING
          {m.crewTag ? ` · ${m.crewTag}` : ""}
        </span>
      </div>
    </Link>
  );
}

function Skel() {
  return (
    <div className="meetups-list" style={{ marginBottom: 24 }}>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="card-dark animate-pulse"
          style={{ height: 88 }}
        />
      ))}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      className="card-dark"
      style={{ padding: 18, marginBottom: 24, textAlign: "center" }}
    >
      <p className="dim small" style={{ margin: 0 }}>
        {text}
      </p>
    </div>
  );
}

function dateParts(iso: string): { mo: string; day: string } {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return {
      mo: format(d, "MMM").toUpperCase(),
      day: format(d, "dd"),
    };
  } catch {
    return { mo: "—", day: "—" };
  }
}
