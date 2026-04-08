"use client";

import { useState, useEffect } from "react";
import { SkateSpot, WeatherData } from "@/lib/types";
import SkateScoreBadge from "@/components/ui/SkateScoreBadge";
import dynamic from "next/dynamic";

const SpotMap = dynamic(() => import("@/components/spots/SpotMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 md:h-96 bg-concrete-800 rounded-lg animate-pulse" />
  ),
});

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

  // Fetch spots and weather when location is available
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Spot Finder
        </h1>
        <p className="text-sm text-concrete-400 mt-1">
          Find skateparks and spots near you
        </p>
      </div>

      {/* Weather / Skate Score */}
      {weather && (
        <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-concrete-500 uppercase tracking-wider mb-1">
                Current Conditions
              </p>
              <p className="text-white font-display font-bold text-lg">
                {weather.temperature}°F — {weather.description}
              </p>
              <div className="flex gap-4 text-xs text-concrete-400 mt-1">
                <span>Wind: {weather.windSpeed} mph</span>
                <span>Humidity: {weather.humidity}%</span>
                {weather.precipitation > 0 && (
                  <span className="text-skate-red">
                    Precip: {weather.precipitation}mm
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-concrete-500 uppercase tracking-wider mb-1">
                Good day to skate?
              </p>
              <SkateScoreBadge score={weather.skateScore} />
            </div>
          </div>
        </div>
      )}

      {/* Location prompt */}
      {!userLocation && (
        <div className="bg-concrete-900 border border-concrete-700 rounded-lg p-8 text-center mb-6">
          <p className="text-concrete-400 mb-3">
            Enable location to find skateparks near you and check conditions.
          </p>
          <button
            onClick={requestLocation}
            className="px-6 py-2 rounded-lg bg-skate-lime text-concrete-950 font-bold text-sm hover:bg-skate-lime/90 transition-colors"
          >
            Enable Location
          </button>
          {error && (
            <p className="text-xs text-skate-red mt-3">{error}</p>
          )}
        </div>
      )}

      {/* Map */}
      {userLocation && (
        <div className="mb-6">
          <SpotMap
            spots={spots}
            userLocation={userLocation}
            weather={weather}
          />
        </div>
      )}

      {/* Radius selector */}
      {userLocation && (
        <div className="flex gap-2 mb-4">
          {[5000, 10000, 25000, 50000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                radius === r
                  ? "bg-skate-lime text-concrete-950 font-bold"
                  : "bg-concrete-800 text-concrete-300 hover:bg-concrete-700"
              }`}
            >
              {r < 1000
                ? `${r}m`
                : `${r / 1000}km`}
            </button>
          ))}
        </div>
      )}

      {/* Spot list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-concrete-900 border border-concrete-700 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-concrete-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-concrete-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : spots.length > 0 ? (
        <div className="space-y-2">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="bg-concrete-900 border border-concrete-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-sm">
                    {spot.name}
                  </h3>
                  <div className="flex gap-3 text-xs text-concrete-400 mt-1">
                    {spot.distance && <span>{spot.distance} mi</span>}
                    {spot.surface && <span>Surface: {spot.surface}</span>}
                    <span className="capitalize">{spot.type.replace("_", " ")}</span>
                  </div>
                </div>
                {spot.beginnerFriendly && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-skate-lime/20 text-skate-lime font-medium flex-shrink-0">
                    Beginner Friendly
                  </span>
                )}
              </div>
              {spot.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {spot.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-concrete-800 text-concrete-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : userLocation ? (
        <p className="text-concrete-500 text-sm text-center py-8">
          No spots found in this area. Try increasing the radius.
        </p>
      ) : null}
    </div>
  );
}
