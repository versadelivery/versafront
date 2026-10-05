"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Crosshair, Info, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AddressSearchInput } from "@/components/map/address-search-input";
import { LocationPickerMap } from "@/components/map/location-picker-map";
import { GeoPlace, reverseGeocode } from "@/services/geocoding-service";

// Centro de Itapajé/CE: ponto de partida do mapa quando a loja ainda não
// escolheu uma localização.
const FALLBACK_COORDINATES = { latitude: -3.6841324, longitude: -39.5851265 };

export interface StoreLocation {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface StoreLocationPickerProps {
  shopId: string | number;
  value: StoreLocation;
  onChange: (location: StoreLocation) => void;
  error?: string;
}

export function StoreLocationPicker({ shopId, value, onChange, error }: StoreLocationPickerProps) {
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [pinMoved, setPinMoved] = useState(false);
  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasCoordinates = value.latitude !== null && value.longitude !== null;
  const latitude = value.latitude ?? FALLBACK_COORDINATES.latitude;
  const longitude = value.longitude ?? FALLBACK_COORDINATES.longitude;

  useEffect(() => () => {
    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
  }, []);

  const handleSelectSuggestion = (place: GeoPlace) => {
    setPinMoved(false);
    onChange({ latitude: place.latitude, longitude: place.longitude, address: place.label });
  };

  // O pin manda: ao movê-lo as coordenadas mudam na hora e o texto é apenas
  // reescrito depois, para o endereço não ficar contradizendo o ponto salvo.
  const handlePinChange = (nextLatitude: number, nextLongitude: number) => {
    setPinMoved(true);
    onChange({ latitude: nextLatitude, longitude: nextLongitude, address: value.address });

    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
    setIsResolvingPin(true);

    reverseTimerRef.current = setTimeout(async () => {
      try {
        const place = await reverseGeocode(shopId, nextLatitude, nextLongitude);
        if (place?.label) {
          onChange({ latitude: nextLatitude, longitude: nextLongitude, address: place.label });
        }
      } catch {
        // Sem reverse geocoding o ponto continua válido: o texto atual é mantido.
      } finally {
        setIsResolvingPin(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] p-4">
        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Busque o endereço do estabelecimento e depois mova o mapa até o pin ficar na porta exata.
          A posição do pin é o que define a distância cobrada de cada cliente.
        </p>
      </div>

      <div className="max-w-xl">
        <Label htmlFor="storeLocationAddress" className="mb-1.5 block text-sm font-medium">
          Endereço do estabelecimento
        </Label>
        <AddressSearchInput
          id="storeLocationAddress"
          shopId={shopId}
          value={value.address}
          onValueChange={(address) => onChange({ ...value, address })}
          onSelect={handleSelectSuggestion}
          placeholder="Ex: Rua Major Joaquim Alexandre, Itapajé"
          hasError={!!error}
        />
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
      </div>

      <LocationPickerMap
        latitude={latitude}
        longitude={longitude}
        onChange={handlePinChange}
        className="h-[320px] w-full"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Crosshair className="h-3.5 w-3.5 flex-shrink-0" />
          {hasCoordinates ? (
            <>
              Localização salva:{" "}
              <span className="font-medium text-gray-700">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </>
          ) : (
            "Nenhuma localização definida ainda — busque o endereço ou mova o mapa."
          )}
        </p>
        {isResolvingPin && (
          <span className="text-sm text-muted-foreground">Atualizando endereço do pin...</span>
        )}
      </div>

      {pinMoved && (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          A localização foi ajustada no mapa. As distâncias passarão a ser calculadas a partir deste ponto.
        </p>
      )}
    </div>
  );
}
