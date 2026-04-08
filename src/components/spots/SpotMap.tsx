"use client";

import { useEffect, useState } from "react";
import { SkateSpot, WeatherData } from "@/lib/types";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

interface SpotMapProps {
  spots: SkateSpot[];
  userLocation: { lat: number; lng: number } | null;
  weather: WeatherData | null;
}

export default function SpotMap({ spots, userLocation }: SpotMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix default marker icons
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    });
  }, []);

  if (!mounted || !userLocation) {
    return (
      <div className="w-full h-64 md:h-96 bg-concrete-800 rounded-lg flex items-center justify-center text-concrete-500 text-sm">
        {!userLocation ? "Enable location to see the map" : "Loading map..."}
      </div>
    );
  }

  return (
    <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden border border-concrete-700">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        className="w-full h-full"
        style={{ background: "#1c1917" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]}>
            <Popup>
              <div className="text-concrete-950">
                <p className="font-bold text-sm">{spot.name}</p>
                {spot.distance && (
                  <p className="text-xs">{spot.distance} mi away</p>
                )}
                {spot.surface && (
                  <p className="text-xs">Surface: {spot.surface}</p>
                )}
                {spot.beginnerFriendly && (
                  <p className="text-xs text-green-600 font-medium">
                    Beginner Friendly
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
