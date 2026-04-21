"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SkateSpot, WeatherData } from "@/lib/types";
import SkateScoreBadge from "@/components/ui/SkateScoreBadge";
import { Button, Eyebrow, Tag } from "@/components/ui/primitives";

const SpotMap = dynamic(() => import("@/components/spots/SpotMap"), {
  ssr: false,
  loading: () => (
    <div
      className="card-dark animate-pulse"
      style={{ height: 320, padding: 0 }}
    />
  ),
});

const RADIUS_OPTIONS = [5000, 10000, 25000, 50000];

export default function SpotsPage() {
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [radius, setRadius] = useState(10000);

  const requestLocation = () => {
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setError("Location access denied. Enable it to find spots near you.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!userLocation) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [spotsRes, weatherRes] = await Promise.all([
          fetch(
            `/api/spots?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
          ),
          fetch(
            `/api/weather?lat=${userLocation.lat}&lng=${userLocation.lng}`
          ),
        ]);
        if (spotsRes.ok) {
          const data = await spotsRes.json();
          setSpots(data.spots);
        }
        if (weatherRes.ok) {
          const data = await weatherRes.json();
          setWeather(data);
        }
      } catch {
        setError("Failed to load spots. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, radius]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>SPOT FINDER</Eyebrow>
        <h1 className="hed hed-l" style={{ marginTop: 10 }}>
          Parks, ledges, perfect lots.
        </h1>
        <p className="dim" style={{ marginTop: 8, maxWidth: "52ch" }}>
          Drop a pin on your location and we&apos;ll pull nearby skate spots,
          real weather, and a skate score so you know if today&apos;s worth it.
        </p>
      </div>

      {/* Weather / Skate Score */}
      {weather && (
        <div
          className="card-dark"
          style={{
            padding: 18,
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div>
            <Eyebrow>CURRENT CONDITIONS</Eyebrow>
            <div
              style={{
                fontFamily: "var(--hammer)",
                fontSize: 22,
                letterSpacing: "0.02em",
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              {weather.temperature}°F · {weather.description.toUpperCase()}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "var(--paper-dim)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <span>WIND {weather.windSpeed} mph</span>
              <span>HUMIDITY {weather.humidity}%</span>
              {weather.precipitation > 0 && (
                <span style={{ color: "var(--coral)" }}>
                  PRECIP {weather.precipitation}mm
                </span>
              )}
            </div>
          </div>
          <SkateScoreBadge score={weather.skateScore} />
        </div>
      )}

      {/* Location prompt */}
      {!userLocation && (
        <div
          className="card-dark"
          style={{ padding: 32, textAlign: "center", marginBottom: 20 }}
        >
          <Eyebrow>LOCATION</Eyebrow>
          <p
            style={{
              color: "var(--paper-dim)",
              margin: "12px 0 20px",
              fontSize: 14,
            }}
          >
            Enable location to find skateparks near you and check conditions.
          </p>
          <Button variant="primary" onClick={requestLocation}>
            Enable location →
          </Button>
          {error && (
            <p
              className="mono"
              style={{
                color: "var(--coral)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 14,
              }}
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* Map */}
      {userLocation && (
        <div style={{ marginBottom: 18 }}>
          <SpotMap
            spots={spots}
            userLocation={userLocation}
            weather={weather}
          />
        </div>
      )}

      {/* Radius selector */}
      {userLocation && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <span className="label" style={{ alignSelf: "center" }}>
            RADIUS →
          </span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--r-s)",
                background: radius === r ? "var(--hazard)" : "var(--ink-2)",
                color: radius === r ? "var(--ink)" : "var(--paper-dim)",
                border: `1px solid ${
                  radius === r ? "var(--ink)" : "var(--ink-3)"
                }`,
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: radius === r ? 700 : 400,
              }}
            >
              {r < 1000 ? `${r}m` : `${r / 1000}km`}
            </button>
          ))}
        </div>
      )}

      {/* Spot list */}
      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-dark animate-pulse"
              style={{ height: 80 }}
            />
          ))}
        </div>
      ) : spots.length > 0 ? (
        <div style={{ display: "grid", gap: 12 }}>
          {spots.map((spot) => (
            <div key={spot.id} className="card-dark" style={{ padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 17,
                      letterSpacing: "0.04em",
                      color: "var(--paper)",
                    }}
                  >
                    {spot.name}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--paper-dim)",
                      marginTop: 4,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {spot.distance != null && <span>{spot.distance} MI</span>}
                    {spot.surface && <span>SURFACE · {spot.surface}</span>}
                    <span>{spot.type.replace("_", " ")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {spot.source === "seed" && <Tag tone="violet">CURATED</Tag>}
                  {spot.beginnerFriendly && (
                    <Tag tone="mint">BEGINNER FRIENDLY</Tag>
                  )}
                </div>
              </div>
              {spot.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {spot.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : userLocation ? (
        <p
          className="dim"
          style={{ textAlign: "center", padding: "32px 0", fontSize: 13 }}
        >
          No spots found in this area. Try increasing the radius.
        </p>
      ) : null}
    </div>
  );
}
