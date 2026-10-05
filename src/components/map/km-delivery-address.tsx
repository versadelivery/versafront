"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Loader2,
  MapPin,
  Route,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AddressSearchInput } from "@/components/map/address-search-input";
import { LocationPickerMap } from "@/components/map/location-picker-map";
import {
  DeliveryQuote,
  GeoPlace,
  formatDistance,
  getDeliveryQuote,
  parseDeliveryQuoteError,
  reverseGeocode,
} from "@/services/geocoding-service";

type Step = "address" | "confirm" | "done";

export interface KmDeliveryState {
  address: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  quote: DeliveryQuote | null;
  error: string | null;
  isCalculating: boolean;
}

export const emptyKmDeliveryState: KmDeliveryState = {
  address: "",
  number: "",
  neighborhood: "",
  complement: "",
  reference: "",
  latitude: null,
  longitude: null,
  quote: null,
  error: null,
  isCalculating: false,
};

interface KmDeliveryAddressProps {
  shopId: string | number;
  storeLatitude: number | null;
  storeLongitude: number | null;
  itemsTotal: number;
  value: KmDeliveryState;
  onChange: (updater: (previous: KmDeliveryState) => KmDeliveryState) => void;
  fieldErrors: Record<string, string>;
}

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "address", label: "Endereço" },
  { key: "confirm", label: "Localização" },
  { key: "done", label: "Entrega" },
];

export function KmDeliveryAddress({
  shopId,
  storeLatitude,
  storeLongitude,
  itemsTotal,
  value,
  onChange,
  fieldErrors,
}: KmDeliveryAddressProps) {
  const [step, setStep] = useState<Step>(value.quote ? "done" : "address");
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quotedKeyRef = useRef<string | null>(null);
  const prefillHandledRef = useRef(false);

  const hasCoordinates = value.latitude !== null && value.longitude !== null;
  const mapLatitude = value.latitude ?? storeLatitude ?? 0;
  const mapLongitude = value.longitude ?? storeLongitude ?? 0;

  useEffect(() => () => {
    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
  }, []);

  // Endereço recuperado do último pedido: a localização já foi confirmada antes,
  // então o cliente cai direto no resumo da entrega.
  useEffect(() => {
    if (prefillHandledRef.current) return;
    if (step !== "address") {
      prefillHandledRef.current = true;
      return;
    }
    if (value.latitude === null || value.longitude === null || !value.address) return;

    prefillHandledRef.current = true;
    setStep("done");
  }, [step, value.latitude, value.longitude, value.address]);

  const requestQuote = useCallback(
    async (latitude: number, longitude: number, total: number) => {
      const key = `${latitude},${longitude},${total}`;
      if (quotedKeyRef.current === key) return;
      quotedKeyRef.current = key;

      onChange(previous => ({ ...previous, isCalculating: true, error: null }));

      try {
        const quote = await getDeliveryQuote({ shopId, latitude, longitude, itemsTotal: total });
        onChange(previous => ({ ...previous, quote, error: null, isCalculating: false }));
      } catch (error) {
        // Libera a chave para que confirmar a mesma posição de novo tente outra vez,
        // já que a falha pode ser apenas instabilidade do provedor de rotas.
        quotedKeyRef.current = null;
        const parsed = parseDeliveryQuoteError(error);
        onChange(previous => ({ ...previous, quote: null, error: parsed.message, isCalculating: false }));
      }
    },
    [onChange, shopId]
  );

  // O total muda quando o cliente edita o carrinho nesta mesma tela: a faixa
  // pode continuar igual, mas a regra de frete grátis depende do valor.
  useEffect(() => {
    if (step !== "done" || value.latitude === null || value.longitude === null) return;
    requestQuote(value.latitude, value.longitude, itemsTotal);
  }, [step, value.latitude, value.longitude, itemsTotal, requestQuote]);

  const handleSelectSuggestion = (place: GeoPlace) => {
    onChange(previous => ({
      ...previous,
      address: place.label,
      latitude: place.latitude,
      longitude: place.longitude,
      quote: null,
      error: null,
    }));
    quotedKeyRef.current = null;
    setStep("confirm");
  };

  const handlePinChange = (latitude: number, longitude: number) => {
    onChange(previous => ({ ...previous, latitude, longitude, quote: null, error: null }));
    quotedKeyRef.current = null;

    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
    setIsResolvingPin(true);

    reverseTimerRef.current = setTimeout(async () => {
      try {
        const place = await reverseGeocode(shopId, latitude, longitude);
        if (place) {
          onChange(previous => ({
            ...previous,
            address: place.label || previous.address,
          }));
        }
      } catch {
        // O ponto continua válido mesmo sem conseguir reescrever o endereço.
      } finally {
        setIsResolvingPin(false);
      }
    }, 700);
  };

  const startFromMap = () => {
    if (!hasCoordinates && storeLatitude !== null && storeLongitude !== null) {
      onChange(previous => ({ ...previous, latitude: storeLatitude, longitude: storeLongitude }));
    }
    setStep("confirm");
  };

  const confirmLocation = () => {
    if (value.latitude === null || value.longitude === null) return;
    setStep("done");
    requestQuote(value.latitude, value.longitude, itemsTotal);
  };

  const currentStepIndex = STEP_LABELS.findIndex(item => item.key === step);

  return (
    <div className="space-y-4">
      <ol className="flex items-center gap-2">
        {STEP_LABELS.map((item, index) => {
          const isDone = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <li key={item.key} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isDone && "bg-primary text-white",
                  isCurrent && "border-2 border-primary text-primary",
                  !isDone && !isCurrent && "bg-gray-100 text-gray-400"
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:block",
                  isCurrent ? "font-medium text-gray-900" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {index < STEP_LABELS.length - 1 && <span className="h-px flex-1 bg-[#E5E2DD]" />}
            </li>
          );
        })}
      </ol>

      {step === "address" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="kmAddress" className="mb-1.5 block text-sm font-medium text-gray-700">
              Endereço de entrega <span className="text-red-500">*</span>
            </Label>
            <AddressSearchInput
              id="kmAddress"
              shopId={shopId}
              value={value.address}
              onValueChange={(address) => onChange(previous => ({ ...previous, address }))}
              onSelect={handleSelectSuggestion}
              placeholder="Ex: Rua Major Joaquim Alexandre"
              hasError={!!fieldErrors.address}
            />
            {fieldErrors.address && <p className="mt-1 text-sm text-red-500">{fieldErrors.address}</p>}
          </div>

          <button
            type="button"
            onClick={startFromMap}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            Não encontrei meu endereço — marcar no mapa
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-4 py-3">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="text-sm text-gray-700">
              Mova o mapa até o pin ficar na porta da sua casa. É essa posição que define a taxa de entrega.
            </p>
          </div>

          <LocationPickerMap
            latitude={mapLatitude}
            longitude={mapLongitude}
            onChange={handlePinChange}
            className="h-[260px] w-full sm:h-[320px]"
          />

          <p className="text-sm text-muted-foreground">
            {isResolvingPin ? "Atualizando endereço..." : value.address || "Mova o mapa para marcar a localização"}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("address")}
              className="h-11 cursor-pointer gap-1.5 rounded-md border-[#E5E2DD]"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={confirmLocation}
              disabled={!hasCoordinates}
              className="h-11 flex-1 cursor-pointer rounded-md text-base font-semibold"
            >
              Confirmar localização
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-3">
          <div className="rounded-md border border-[#E5E2DD] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <p className="min-w-0 text-sm text-gray-700">{value.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="flex-shrink-0 cursor-pointer text-sm font-medium text-primary hover:underline"
              >
                Ajustar
              </button>
            </div>
          </div>

          {value.isCalculating && (
            <div className="flex items-center gap-2 rounded-md border border-[#E5E2DD] px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando a rota até você...
            </div>
          )}

          {!value.isCalculating && value.error && (
            <div className="flex items-start gap-2.5 rounded-md border border-amber-400 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm text-amber-700">{value.error}</p>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  className="cursor-pointer text-sm font-medium text-amber-800 underline"
                >
                  Revisar localização
                </button>
              </div>
            </div>
          )}

          {!value.isCalculating && value.quote && (
            <div className="rounded-md border border-[#E5E2DD] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <Route className="h-4 w-4 text-primary" />
                  {formatDistance(value.quote.distance_km)} de distância
                </span>
                <span className="text-base font-semibold text-primary">
                  {value.quote.amount === 0
                    ? "Grátis"
                    : `R$ ${value.quote.amount.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              {value.quote.duration_minutes !== null && (
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  Cerca de {value.quote.duration_minutes} min de trajeto
                </p>
              )}
            </div>
          )}

          {/*
            Número e bairro são sempre digitados pelo cliente, nunca preenchidos
            pelo geocoder. Em cidades pequenas o OpenStreetMap quase não tem número
            de casa mapeado (Itapajé/CE tem 3 no município inteiro) e só dois
            bairros para toda a cidade — qualquer palpite viria errado.
          */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="kmNumber" className="mb-1.5 block text-sm font-medium text-gray-700">
                Número <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kmNumber"
                value={value.number}
                onChange={(event) => onChange(previous => ({ ...previous, number: event.target.value }))}
                placeholder="123"
                inputMode="numeric"
                maxLength={10}
                className={cn(
                  "text-sm border-[#E5E2DD] focus:border-primary/40",
                  fieldErrors.number && "border-red-400 focus:border-red-400"
                )}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="kmNeighborhood" className="mb-1.5 block text-sm font-medium text-gray-700">
                Bairro <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kmNeighborhood"
                value={value.neighborhood}
                onChange={(event) => onChange(previous => ({ ...previous, neighborhood: event.target.value }))}
                placeholder="Bairro"
                className={cn(
                  "text-sm border-[#E5E2DD] focus:border-primary/40",
                  fieldErrors.neighborhood && "border-red-400 focus:border-red-400"
                )}
              />
            </div>
          </div>

          {fieldErrors.number || fieldErrors.neighborhood ? (
            <p className="text-sm text-red-500">{fieldErrors.number || fieldErrors.neighborhood}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              O mapa não sabe o número nem o bairro — preencha para o entregador achar você.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="kmComplement" className="mb-1.5 block text-sm font-medium text-gray-700">
                Complemento
              </Label>
              <Input
                id="kmComplement"
                value={value.complement}
                onChange={(event) => onChange(previous => ({ ...previous, complement: event.target.value }))}
                placeholder="Apto, bloco..."
                className="border-[#E5E2DD] text-sm focus:border-primary/40"
              />
            </div>
            <div>
              <Label htmlFor="kmReference" className="mb-1.5 block text-sm font-medium text-gray-700">
                Referência
              </Label>
              <Input
                id="kmReference"
                value={value.reference}
                onChange={(event) => onChange(previous => ({ ...previous, reference: event.target.value }))}
                placeholder="Perto do..."
                className="border-[#E5E2DD] text-sm focus:border-primary/40"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
