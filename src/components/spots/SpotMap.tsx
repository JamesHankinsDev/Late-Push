"use client";

import { useEffect, useRef, useState } from "react";
import type * as LeafletType from "leaflet";
import { SkateSpot, WeatherData } from "@/lib/types";

interface SpotMapProps {
  spots: SkateSpot[];
  userLocation: { lat: number; lng: number } | null;
  weather: WeatherData | null;
}

// Brand palette (mirrors :root CSS vars — Leaflet div-icons need raw hex)
const INK = "#0e0d0c";
const INK_2 = "#1a1816";
const INK_3 = "#24211e";
const PAPER = "#f2ece0";
const HAZARD = "#f5d400";
const MINT = "#78d19a";
const SKY = "#7ec7ff";

export default function SpotMap({ spots, userLocation }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const markersRef = useRef<LeafletType.Layer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (mapInstanceRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      // Cancellation + re-entry guards: React 18 strict mode double-mounts
      // effects, so the first mount's async import can resolve after the
      // second mount has already initialized. Without this, Leaflet throws
      // "Map container is already initialized."
      if (cancelled) return;
      const container = mapRef.current;
      if (!container) return;
      if (mapInstanceRef.current) return;
      if ((container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id)
        return;

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

      const map = L.map(container, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
      }).addTo(map);

      // "You are here" — sky-blue pulsing dot
      const youIcon = L.divIcon({
        html: `
          <div style="position:relative;width:24px;height:24px;">
            <div style="position:absolute;inset:0;background:${SKY};border-radius:50%;opacity:0.3;animation:lp-pulse 2s infinite;"></div>
            <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;background:${SKY};border:3px solid ${INK};border-radius:50%;box-shadow:0 0 8px rgba(126,199,255,0.6);"></div>
          </div>
          <style>@keyframes lp-pulse{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(2);opacity:0}}</style>
        `,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: youIcon })
        .addTo(map)
        .bindPopup(popupHtml({ title: "You are here" }));

      mapInstanceRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setReady(false);
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !ready) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      const map = mapInstanceRef.current;
      if (!map) return;

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      // Hazard-yellow spot pin
      const spotIcon = L.divIcon({
        html: `
          <div style="width:32px;height:32px;background:${HAZARD};border:2px solid ${INK};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:2px 2px 0 ${INK};">
            🛹
          </div>
        `,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      spots.forEach((spot) => {
        const meta: string[] = [];
        if (spot.distance != null) meta.push(`${spot.distance} MI`);
        if (spot.surface) meta.push(`SURFACE · ${spot.surface.toUpperCase()}`);
        meta.push(spot.type.replace("_", " ").toUpperCase());

        const tagsHtml =
          spot.tags.length > 0
            ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">
                ${spot.tags
                  .map(
                    (t) =>
                      `<span style="font-family:JetBrains Mono,monospace;font-size:10px;background:${INK_3};color:${PAPER};padding:2px 6px;border-radius:3px;letter-spacing:0.06em;text-transform:uppercase;">${t}</span>`
                  )
                  .join("")}
              </div>`
            : "";

        const beginnerChip = spot.beginnerFriendly
          ? `<div style="margin-top:6px;display:inline-block;font-family:JetBrains Mono,monospace;font-size:10px;background:${MINT};color:${INK};padding:2px 8px;border-radius:3px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">BEGINNER FRIENDLY</div>`
          : "";

        const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(
          map
        );
        marker.bindPopup(
          popupHtml({
            title: spot.name,
            meta,
            extra: beginnerChip + tagsHtml,
          })
        );
        markersRef.current.push(marker);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [spots, ready]);

  if (!userLocation) {
    return (
      <div
        className="card-dark"
        style={{
          padding: 0,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--paper-dim)",
          fontSize: 14,
        }}
      >
        Enable location to see the map
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 360,
        borderRadius: "var(--r-m)",
        overflow: "hidden",
        border: "2px solid var(--ink-3)",
        background: INK_2,
      }}
    />
  );
}

function popupHtml({
  title,
  meta,
  extra,
}: {
  title: string;
  meta?: string[];
  extra?: string;
}) {
  return `
    <div style="color:${INK};min-width:180px;font-family:'Space Grotesk',system-ui,sans-serif;">
      <div style="font-family:Anton,'Archivo Black',sans-serif;font-size:17px;letter-spacing:0.02em;line-height:1.1;margin:0 0 4px;">${title}</div>
      ${
        meta && meta.length
          ? `<div style="font-family:JetBrains Mono,monospace;font-size:10px;color:#444;letter-spacing:0.08em;">${meta.join(" · ")}</div>`
          : ""
      }
      ${extra ?? ""}
    </div>
  `;
}
