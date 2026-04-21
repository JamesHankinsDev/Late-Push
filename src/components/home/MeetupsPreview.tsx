"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import {
  listPublicUpcoming,
  listUpcomingForUser,
} from "@/lib/sources/meetups";
import { Meetup } from "@/lib/types";
import { Button, Tag } from "@/components/ui/primitives";
import { format } from "date-fns";

const MAX_SHOWN = 2;

/**
 * Dashboard widget: 2 upcoming meetups relevant to the viewer. Prefers
 * sessions they've RSVP'd to; falls back to public meetups.
 */
export default function MeetupsPreview() {
  const { profile } = useAuthContext();
  const [meetups, setMeetups] = useState<Meetup[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const mine = await listUpcomingForUser(profile.uid);
        if (mine.length > 0) {
          setMeetups(mine.slice(0, MAX_SHOWN));
          return;
        }
        const publics = await listPublicUpcoming(MAX_SHOWN);
        setMeetups(publics);
      } catch {
        setMeetups([]);
      }
    })();
  }, [profile]);

  if (meetups === null) {
    return (
      <div className="meetups-list">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="card-dark animate-pulse"
            style={{ height: 80 }}
          />
        ))}
      </div>
    );
  }

  if (meetups.length === 0) {
    return (
      <div
        className="card-dark"
        style={{ padding: 20, textAlign: "center" }}
      >
        <p
          className="dim"
          style={{ fontSize: 13, margin: "0 0 14px", maxWidth: "40ch", marginLeft: "auto", marginRight: "auto" }}
        >
          No upcoming meetups. Start one — public or crew-only — and skate with
          people at your level.
        </p>
        <Link href="/meetups/new">
          <Button size="sm" variant="primary">
            + Plan a session
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="meetups-list">
      {meetups.map((m) => (
        <MeetupRow key={m.id} m={m} />
      ))}
    </div>
  );
}

function MeetupRow({ m }: { m: Meetup }) {
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
        <Tag tone="outline">{m.goingCount} GOING</Tag>
        <span className="rsvp-count">
          {m.crewTag ? m.crewTag : m.visibility === "public" ? "OPEN" : "CREW"}
        </span>
      </div>
    </Link>
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
