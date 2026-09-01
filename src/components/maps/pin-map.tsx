"use client"

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { Store } from 'lucide-react'

// Esri usa a ordem {z}/{y}/{x} nas URLs de tile (diferente do padrão XYZ {z}/{x}/{y}).
const SATELLITE_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const LABELS_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION = 'Tiles &copy; Esri'

// Pino vermelho fixo (posição geográfica real, não o centro da tela) marcando o estabelecimento.
const shopIcon = L.divIcon({
  className: '',
  html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5s12.5-19.1 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#EF4444" stroke="#7F1D1D" stroke-width="1"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  </svg>`,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
})

// Controla o mapa por baixo do pino fixo: recentraliza quando a posição vem de fora (endereço
// digitado, CEP, valor inicial) e reporta a nova posição quando é o próprio usuário que
// arrasta/move o mapa — sem o segundo disparar o primeiro de volta (senão o mapa "trava"
// tentando voltar pro lugar de onde o usuário acabou de sair).
function MapController({ latitude, longitude, onCenterChange }: {
  latitude: number
  longitude: number
  onCenterChange: (lat: number, lng: number) => void
}) {
  const skipNextRecenterRef = useRef(false)

  const map = useMapEvents({
    moveend: () => {
      skipNextRecenterRef.current = true
      const center = map.getCenter()
      onCenterChange(center.lat, center.lng)
    },
  })

  useEffect(() => {
    if (skipNextRecenterRef.current) {
      skipNextRecenterRef.current = false
      return
    }
    map.setView([latitude, longitude])
  }, [latitude, longitude, map])

  return null
}

export interface PinMapProps {
  latitude: number
  longitude: number
  onCenterChange: (lat: number, lng: number) => void
  heightClassName?: string
  zoom?: number
  // Posição fixa (real, geográfica) do estabelecimento — marcada com um pino vermelho sempre
  // visível quando estiver dentro da área do mapa, além de habilitar o botão "Ir até a loja".
  shopMarker?: { latitude: number; longitude: number }
}

export default function PinMap({ latitude, longitude, onCenterChange, heightClassName = 'h-64 sm:h-56', zoom = 17, shopMarker }: PinMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)

  const goToShop = () => {
    if (!shopMarker || !mapRef.current) return
    mapRef.current.flyTo([shopMarker.latitude, shopMarker.longitude], Math.max(mapRef.current.getZoom(), zoom))
  }

  return (
    <div className={`relative rounded-md overflow-hidden border border-[#E5E2DD] ${heightClassName}`}>
      <MapContainer
        ref={mapRef}
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer attribution={ESRI_ATTRIBUTION} url={SATELLITE_TILE_URL} />
        <TileLayer attribution={ESRI_ATTRIBUTION} url={LABELS_TILE_URL} />
        <MapController latitude={latitude} longitude={longitude} onCenterChange={onCenterChange} />
        {shopMarker && <Marker position={[shopMarker.latitude, shopMarker.longitude]} icon={shopIcon} />}
      </MapContainer>

      {/* Pino fixo no centro da tela — quem se move é o mapa por baixo, não o pino. */}
      <img
        src="/leaflet/marker-icon.png"
        alt="Localização"
        className="pointer-events-none absolute z-[1000]"
        style={{
          left: '50%',
          top: '50%',
          width: 25,
          height: 41,
          transform: 'translate(-50%, -100%)',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))',
        }}
      />

      {shopMarker && (
        <button
          type="button"
          onClick={goToShop}
          className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 bg-white hover:bg-[#FAF9F7] border border-[#E5E2DD] rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-md cursor-pointer transition-colors"
        >
          <Store className="w-3.5 h-3.5 text-red-500" />
          Ir até a loja
        </button>
      )}
    </div>
  )
}
