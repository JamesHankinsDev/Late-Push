"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { updateUserProfile } from "@/lib/sources/firestore";
import { SkateSpot } from "@/lib/types";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

export default function HomeSpotPage() {
  const { profile, refreshProfile } = useAuthContext();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const currentId = profile?.homeSpotId;

  const requestLocation = () => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {
        setError(
          "Location access denied. You can still pick from the curated list below."
        );
        setLoading(false);
      },
      { enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    if (!userLocation) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/spots?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=40000`
        );
        const data = await res.json();
        setSpots(data.spots ?? []);
      } catch {
        setError("Couldn't load nearby spots. Try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userLocation]);

  async function pick(spot: SkateSpot) {
    if (!profile || saving) return;
    setSaving(spot.id);
    try {
      await updateUserProfile(profile.uid, {
        homeSpotId: spot.id,
        homeSpotName: spot.name,
        homeSpotLat: spot.lat,
        homeSpotLng: spot.lng,
        nearbyRadiusMi: profile.nearbyRadiusMi ?? 5,
      });
      await refreshProfile();
      router.push("/settings/privacy");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't set home spot."
      );
      setSaving(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>HOME SPOT</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Pick your anchor.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          We use this to match you with skaters nearby — never your precise
          location. Others see: &ldquo;@your_alias · ~3 mi from Lynch Family.&rdquo; Not your
          home address, not your real coordinates.
        </p>
      </div>

      {profile?.homeSpotName && (
        <div
          className="card-dark"
          style={{
            padding: 16,
            marginBottom: 18,
            borderColor: "var(--mint)",
            background: "rgba(120,209,154,0.05)",
          }}
        >
          <Eyebrow tone="mint">CURRENT</Eyebrow>
          <div
            style={{
              fontFamily: "var(--hammer)",
              fontSize: 20,
              marginTop: 8,
              letterSpacing: "0.02em",
            }}
          >
            {profile.homeSpotName}
          </div>
        </div>
      )}

      {!userLocation ? (
        <div
          className="card-dark"
          style={{ padding: 24, textAlign: "center", marginBottom: 18 }}
        >
          <p
            className="dim"
            style={{ fontSize: 14, marginBottom: 14, maxWidth: "40ch", margin: "0 auto 14px" }}
          >
            Enable location to see spots near you. We use it once to load this
            list — we don&apos;t store or share your coordinates.
          </p>
          <Button variant="primary" onClick={requestLocation} disabled={loading}>
            {loading ? "Loading…" : "Find nearby spots →"}
          </Button>
          {error && (
            <p
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--coral)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 12,
              }}
            >
              {error}
            </p>
          )}
        </div>
      ) : loading ? (
        <div style={{ display: "grid", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 68 }}
            />
          ))}
        </div>
      ) : spots.length === 0 ? (
        <p className="dim" style={{ fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          No spots nearby. Widen the search in{" "}
          <Link href="/spots" style={{ color: "var(--hazard)" }}>
            Spots
          </Link>
          .
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {spots.map((spot) => {
            const isCurrent = spot.id === currentId;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => pick(spot)}
                disabled={saving !== null}
                className="card-dark"
                style={{
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "left",
                  cursor: "pointer",
                  background: isCurrent
                    ? "rgba(120,209,154,0.08)"
                    : undefined,
                  borderColor: isCurrent ? "var(--mint)" : undefined,
                  color: "inherit",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 16,
                      letterSpacing: "0.04em",
                      color: "var(--paper)",
                    }}
                  >
                    {spot.name}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      color: "var(--paper-dim)",
                      marginTop: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    {spot.distance != null && `${spot.distance} MI · `}
                    {spot.type.replace("_", " ")}
                    {spot.source === "seed" && " · CURATED"}
                  </div>
                </div>
                {isCurrent ? (
                  <Tag tone="mint">CURRENT</Tag>
                ) : saving === spot.id ? (
                  <Tag tone="outline">SAVING…</Tag>
                ) : (
                  <span className="label" style={{ color: "var(--hazard)" }}>
                    PICK →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/settings/privacy">
          <Button variant="ghost">← Privacy</Button>
        </Link>
      </div>
    </div>
  );
}
