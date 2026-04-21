"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import {
  clearRsvp,
  deleteMeetup,
  getMeetup,
  listRsvpsFor,
  setRsvp,
} from "@/lib/sources/meetups";
import { aliasColor, aliasInitials } from "@/lib/social/aliases";
import { Meetup, MeetupRsvp, RsvpStatus } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";
import { format } from "date-fns";

export default function MeetupDetailPage({ params }: { params: { id: string } }) {
  const { profile } = useAuthContext();
  const router = useRouter();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [rsvps, setRsvps] = useState<MeetupRsvp[]>([]);
  const [myRsvp, setMyRsvp] = useState<MeetupRsvp | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [m, rs] = await Promise.all([
        getMeetup(params.id),
        listRsvpsFor(params.id),
      ]);
      setMeetup(m);
      setRsvps(rs);
      setMyRsvp(rs.find((r) => r.uid === profile.uid) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load meetup.");
    } finally {
      setLoading(false);
    }
  }, [profile, params.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRsvp(status: RsvpStatus) {
    if (!profile || !meetup || busy) return;
    setBusy(true);
    setError("");
    try {
      await setRsvp(
        meetup,
        {
          uid: profile.uid,
          alias: profile.alias ?? "",
          aliasColor: profile.aliasColor ?? "#f5d400",
        },
        status
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't RSVP.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!profile || !meetup || busy) return;
    setBusy(true);
    try {
      await clearRsvp(meetup.id, profile.uid);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!profile || !meetup || busy) return;
    if (
      !confirm(
        `Delete "${meetup.title}"? RSVPs will be cleared. Can't be undone.`
      )
    )
      return;
    setBusy(true);
    try {
      await deleteMeetup(meetup.id);
      router.push("/social");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
      setBusy(false);
    }
  }

  if (loading && !meetup) {
    return <div className="card-dark animate-pulse" style={{ height: 260 }} />;
  }

  if (!meetup) {
    return (
      <div className="card-dark" style={{ padding: 40, textAlign: "center" }}>
        <Eyebrow tone="coral">NOT FOUND</Eyebrow>
        <h2 className="hed hed-m" style={{ marginTop: 12 }}>
          No such meetup
        </h2>
        <p className="dim">
          Either it doesn&apos;t exist, it was deleted, or you don&apos;t have
          access (private crew meetup).
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/social">
            <Button variant="ghost">← Back to Social</Button>
          </Link>
        </div>
      </div>
    );
  }

  const going = rsvps.filter((r) => r.status === "going");
  const maybe = rsvps.filter((r) => r.status === "maybe");
  const isHost = meetup.hostUid === profile?.uid;
  const dateLabel = formatDate(meetup.date);

  return (
    <div>
      <div
        className="card-dark"
        style={{
          padding: 24,
          marginBottom: 22,
          background: "linear-gradient(180deg, var(--ink-3), var(--ink-2))",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "baseline",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <Eyebrow>MEETUP</Eyebrow>
          {meetup.crewId && (
            <Tag tone="outline">
              {meetup.crewTag} · {meetup.crewName}
            </Tag>
          )}
          <Tag tone={meetup.visibility === "public" ? "mint" : "yellow"}>
            {meetup.visibility === "public" ? "PUBLIC" : "CREW ONLY"}
          </Tag>
        </div>
        <h1 className="hed hed-l" style={{ margin: "4px 0 12px" }}>
          {meetup.title}
        </h1>

        <div
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <InfoBlock
            label="When"
            value={`${dateLabel}${meetup.time ? ` · ${meetup.time}` : ""}`}
          />
          <InfoBlock label="Where" value={meetup.spotName} />
          <InfoBlock
            label="Going"
            value={`${meetup.goingCount}${
              maybe.length ? ` · ${maybe.length} maybe` : ""
            }`}
          />
        </div>

        {meetup.focus && (
          <p
            style={{
              color: "var(--paper-2)",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 16,
              maxWidth: "60ch",
            }}
          >
            {meetup.focus}
          </p>
        )}

        {/* Host chip */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                meetup.hostAliasColor ??
                aliasColor(meetup.hostAlias.toLowerCase()),
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--hammer)",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {aliasInitials(meetup.hostAlias)}
          </div>
          <div>
            <div className="label">HOSTED BY</div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: 15,
                letterSpacing: "0.04em",
              }}
            >
              @{meetup.hostAlias}
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--coral)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isHost ? (
            <>
              <Tag tone="mint">YOU&apos;RE HOSTING</Tag>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={busy}
              >
                {busy ? "…" : "Delete meetup"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={myRsvp?.status === "going" ? "mint" : "primary"}
                onClick={() => handleRsvp("going")}
                disabled={busy}
              >
                {myRsvp?.status === "going" ? "✓ Going" : "I'm in →"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleRsvp("maybe")}
                disabled={busy}
              >
                {myRsvp?.status === "maybe" ? "✓ Maybe" : "Maybe"}
              </Button>
              {myRsvp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={busy}
                >
                  Clear RSVP
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Attendees */}
      <div className="sec-head">
        <h3>Going</h3>
        <span className="label">{going.length}</span>
      </div>
      {going.length === 0 ? (
        <div
          className="card-dark"
          style={{ padding: 18, textAlign: "center", marginBottom: 24 }}
        >
          <p className="dim small" style={{ margin: 0 }}>
            No one yet — be the first.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
          {going.map((r) => (
            <AttendeeRow key={r.id} rsvp={r} hostUid={meetup.hostUid} />
          ))}
        </div>
      )}

      {maybe.length > 0 && (
        <>
          <div className="sec-head">
            <h3>Maybe</h3>
            <span className="label">{maybe.length}</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {maybe.map((r) => (
              <AttendeeRow key={r.id} rsvp={r} hostUid={meetup.hostUid} />
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/social">
          <Button variant="ghost">← Back to Social</Button>
        </Link>
      </div>
    </div>
  );
}

function AttendeeRow({
  rsvp,
  hostUid,
}: {
  rsvp: MeetupRsvp;
  hostUid: string;
}) {
  const color =
    rsvp.aliasColor ?? aliasColor((rsvp.alias ?? "?").toLowerCase());
  return (
    <div
      className="card-dark"
      style={{
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: color,
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--hammer)",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {aliasInitials(rsvp.alias ?? "?")}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--display)",
            fontSize: 15,
            letterSpacing: "0.04em",
          }}
        >
          @{rsvp.alias ?? "unknown"}
        </div>
      </div>
      {rsvp.uid === hostUid && <Tag tone="mint">HOST</Tag>}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 4 }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: "var(--display)",
          fontSize: 15,
          letterSpacing: "0.04em",
          color: "var(--paper)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return format(d, "EEE MMM d").toUpperCase();
  } catch {
    return iso;
  }
}
