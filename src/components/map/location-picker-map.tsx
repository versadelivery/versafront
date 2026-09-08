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

// Tolerância de ~1cm: abaixo disso a posição é considerada a mesma e o mapa
// não precisa ser recentralizado.
const COORDINATE_EPSILON = 1e-7;

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  zoom?: number;
  className?: string;
}

/**
 * O pin fica fixo no centro da tela e quem se move é o mapa — mesmo padrão dos
 * apps de entrega. A posição escolhida é sempre o centro do mapa ao fim do
 * movimento, o que evita o alvo pequeno e difícil de acertar no celular.
 */
export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  zoom = 16,
  className,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const onChangeRef = useRef(onChange);
  // Última posição emitida pelo próprio mapa: evita recentralizar em resposta
  // ao movimento que o usuário acabou de fazer.
  const lastEmittedRef = useRef<string | null>(null);
  // Movimentos disparados por código não devem ser reemitidos como escolha do usuário.
  const isProgrammaticRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        attributionControl: true,
      });

      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);

      map.on("movestart", () => setIsMoving(true));

      map.on("moveend", () => {
        setIsMoving(false);

        if (isProgrammaticRef.current) {
          isProgrammaticRef.current = false;
          return;
        }

        const center = map.getCenter();
        lastEmittedRef.current = `${center.lat},${center.lng}`;
        onChangeRef.current(center.lat, center.lng);
      });

      mapRef.current = map;
      setIsReady(true);

      // O contêiner costuma ser montado dentro de um passo ainda em animação.
      // pan: false impede que o recálculo de tamanho conte como escolha do usuário.
      setTimeout(() => map.invalidateSize({ pan: false }), 200);
    }

    initialize();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (lastEmittedRef.current === `${latitude},${longitude}`) return;

    const center = map.getCenter();
    if (
      Math.abs(center.lat - latitude) < COORDINATE_EPSILON &&
      Math.abs(center.lng - longitude) < COORDINATE_EPSILON
    ) {
      return;
    }

    isProgrammaticRef.current = true;
    map.setView([latitude, longitude], Math.max(map.getZoom(), zoom), { animate: true });
  }, [latitude, longitude, zoom]);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-md border border-[#E5E2DD]", className)}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Pin fixo no centro. pointer-events-none deixa o arraste passar para o mapa. */}
      <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
        {/* Sombra marca o ponto exato que será salvo. */}
        <span
          className={cn(
            "absolute h-2 w-2 rounded-full bg-black/30 blur-[1px] transition-opacity duration-150",
            isMoving ? "opacity-100" : "opacity-50"
          )}
        />
        {/* -18px sobe o desenho para que a ponta encoste no centro do contêiner. */}
        <span className="absolute -translate-y-[18px]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              "h-10 w-10 drop-shadow-md transition-transform duration-150",
              isMoving && "-translate-y-1"
            )}
          >
            <path
              d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
              fill="#E8590C"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="10" r="2.6" fill="white" />
          </svg>
        </span>
      </div>

      {!isReady && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-[#FAF9F7]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
