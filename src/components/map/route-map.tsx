"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const STORE_PIN = `
  <span class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 ring-2 ring-white shadow">
    <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
  </span>
`;

const CUSTOMER_PIN = `
  <svg viewBox="0 0 24 24" fill="none" class="h-8 w-8 drop-shadow">
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="#E8590C" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="10" r="2.6" fill="white"/>
  </svg>
`;

export interface RouteMapPoint {
  latitude: number;
  longitude: number;
}

interface RouteMapProps {
  origin: RouteMapPoint;
  destination: RouteMapPoint;
  /** Traçado da rota como pares [latitude, longitude]. */
  geometry?: number[][];
  className?: string;
}

/** Mapa somente de leitura: mostra loja, cliente e o trajeto entre os dois. */
export function RouteMap({ origin, destination, geometry, className }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);

      const originPoint: [number, number] = [origin.latitude, origin.longitude];
      const destinationPoint: [number, number] = [destination.latitude, destination.longitude];
      const line = geometry?.length ? (geometry as [number, number][]) : [originPoint, destinationPoint];

      // Sem geometria da rota, o traçado vira uma reta pontilhada — deixa claro
      // que é só uma referência visual, não o caminho real.
      L.polyline(line, {
        color: "#E8590C",
        weight: 4,
        opacity: 0.85,
        dashArray: geometry?.length ? undefined : "6 8",
      }).addTo(map);

      L.marker(originPoint, {
        icon: L.divIcon({ html: STORE_PIN, className: "versa-route-store", iconSize: [20, 20], iconAnchor: [10, 10] }),
        title: "Loja",
      }).addTo(map);

      L.marker(destinationPoint, {
        icon: L.divIcon({ html: CUSTOMER_PIN, className: "versa-route-customer", iconSize: [32, 32], iconAnchor: [16, 30] }),
        title: "Entrega",
      }).addTo(map);

      map.fitBounds(L.latLngBounds(line), { padding: [30, 30] });

      mapRef.current = map;
      setIsReady(true);

      // O mapa nasce dentro de um modal que ainda pode estar animando.
      setTimeout(() => map.invalidateSize({ pan: false }), 200);
    }

    initialize();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [origin.latitude, origin.longitude, destination.latitude, destination.longitude, geometry]);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-md border border-[#E5E2DD]", className)}>
      <div ref={containerRef} className="h-full w-full" />
      {!isReady && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-[#FAF9F7]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
