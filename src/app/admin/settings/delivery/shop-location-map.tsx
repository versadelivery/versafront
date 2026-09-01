"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/hooks/use-shop";

const PinMap = dynamic(() => import("@/components/maps/pin-map"), { ssr: false });

// Centro da cidade de Itapajé-CE — usado só como ponto de partida enquanto a loja não tem
// localização definida; o lojista deve mover o mapa até a posição real do estabelecimento.
const DEFAULT_COORDS = { latitude: -3.6764, longitude: -39.5776 };

export default function ShopLocationMap() {
  const { shop, updateShop, isUpdating } = useShop();

  const savedLatitude = shop?.latitude ?? null;
  const savedLongitude = shop?.longitude ?? null;
  const hasSavedLocation = savedLatitude !== null && savedLongitude !== null;

  const [pin, setPin] = useState(() => ({
    latitude: savedLatitude ?? DEFAULT_COORDS.latitude,
    longitude: savedLongitude ?? DEFAULT_COORDS.longitude,
  }));

  // Sincroniza o pino com o valor salvo assim que ele chega da API (primeira carga), sem
  // sobrescrever um ajuste que o lojista já esteja fazendo na tela.
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded || !shop) return;
    if (savedLatitude !== null && savedLongitude !== null) {
      setPin({ latitude: savedLatitude, longitude: savedLongitude });
    }
    setSeeded(true);
  }, [shop, savedLatitude, savedLongitude, seeded]);

  const hasChanges = pin.latitude !== (savedLatitude ?? DEFAULT_COORDS.latitude) ||
    pin.longitude !== (savedLongitude ?? DEFAULT_COORDS.longitude);

  const handleSave = () => {
    updateShop({ latitude: pin.latitude, longitude: pin.longitude });
  };

  if (!seeded) return null;

  return (
    <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="font-tomato text-base font-semibold text-gray-900">Localização da loja</h2>
        </div>
        {hasSavedLocation ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Definida
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Não definida
          </span>
        )}
      </div>

      <div className="px-5 py-5 space-y-3">
        <p className="text-sm text-muted-foreground">
          Mova o mapa até o pino ficar exatamente em cima do seu estabelecimento. Essa é a posição
          usada para calcular a distância até o cliente na taxa por km.
        </p>

        <PinMap
          latitude={pin.latitude}
          longitude={pin.longitude}
          onCenterChange={(latitude, longitude) => setPin({ latitude, longitude })}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
          </p>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isUpdating}
            size="sm"
            className="rounded-md"
          >
            {isUpdating ? "Salvando..." : "Salvar localização"}
          </Button>
        </div>
      </div>
    </div>
  );
}
