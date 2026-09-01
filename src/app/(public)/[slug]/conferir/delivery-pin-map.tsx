"use client"

import PinMap from '@/components/maps/pin-map'

interface DeliveryPinMapProps {
  latitude: number
  longitude: number
  onCenterChange: (lat: number, lng: number) => void
  shopLatitude?: number | null
  shopLongitude?: number | null
}

export default function DeliveryPinMap({ latitude, longitude, onCenterChange, shopLatitude, shopLongitude }: DeliveryPinMapProps) {
  const shopMarker = shopLatitude != null && shopLongitude != null
    ? { latitude: shopLatitude, longitude: shopLongitude }
    : undefined

  return (
    // Altura maior que no desktop dá mais espaço pra mover o mapa com o dedo no mobile.
    <PinMap
      latitude={latitude}
      longitude={longitude}
      onCenterChange={onCenterChange}
      heightClassName="h-64 sm:h-56"
      shopMarker={shopMarker}
    />
  )
}
