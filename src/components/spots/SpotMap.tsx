"use client";

import { useEffect, useRef, useState } from "react";
import { SkateSpot, WeatherData } from "@/lib/types";

interface SpotMapProps {
  spots: SkateSpot[];
  userLocation: { lat: number; lng: number } | null;
  weather: WeatherData | null;
}

export default function SpotMap({ spots, userLocation }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ).addTo(map);

      // "You are here" marker
      const youIcon = L.divIcon({
        html: `
          <div style="position:relative;width:24px;height:24px;">
            <div style="position:absolute;inset:0;background:#22d3ee;border-radius:50%;opacity:0.25;animation:pulse 2s infinite;"></div>
            <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;background:#22d3ee;border:3px solid #fff;border-radius:50;box-shadow:0 0 6px rgba(34,211,238,0.6);"></div>
          </div>
          <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(2);opacity:0}}</style>
        `,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: youIcon })
        .addTo(map)
        .bindPopup(
          `<div style="color:#1c1917;text-align:center;">
            <p style="font-weight:bold;font-size:13px;margin:0;">You are here</p>
          </div>`
        );

      mapInstanceRef.current = map;
      setReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Update spot markers when spots change
  useEffect(() => {
    if (!mapInstanceRef.current || !ready) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current!;

      // Clear previous spot markers only
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      const spotIcon = L.divIcon({
        html: `
          <div style="width:28px;height:28px;background:#a3e635;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
            🛹
          </div>
        `,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      spots.forEach((spot) => {
        const tagsHtml = spot.tags.length > 0
          ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">
              ${spot.tags.map((t) => `<span style="font-size:10px;background:#f0f0f0;padding:1px 5px;border-radius:4px;color:#555;">${t}</span>`).join("")}
            </div>`
          : "";

        const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(map);
        marker.bindPopup(`
          <div style="color:#1c1917;min-width:180px;">
            <p style="font-weight:bold;font-size:14px;margin:0 0 2px;">${spot.name}</p>
            <p style="font-size:12px;color:#666;margin:0 0 6px;text-transform:capitalize;">${spot.type.replace("_", " ")}</p>
            ${spot.distance != null ? `<p style="font-size:12px;margin:0 0 2px;">📍 ${spot.distance} mi away</p>` : ""}
            ${spot.surface ? `<p style="font-size:12px;margin:0 0 2px;">🧱 Surface: ${spot.surface}</p>` : ""}
            ${spot.beginnerFriendly ? `<p style="font-size:12px;margin:0 0 2px;color:#16a34a;font-weight:600;">✅ Beginner Friendly</p>` : ""}
            ${tagsHtml}
          </div>
        `);
        markersRef.current.push(marker);
      });
    });
  }, [spots, ready]);

  if (!userLocation) {
    return (
      <div className="w-full h-64 md:h-96 bg-concrete-800 rounded-lg flex items-center justify-center text-concrete-500 text-sm">
        Enable location to see the map
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-64 md:h-96 rounded-lg overflow-hidden border border-concrete-700"
      style={{ background: "#1c1917" }}
    />
  );
}
