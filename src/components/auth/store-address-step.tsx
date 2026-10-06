"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Crosshair, Info, MapPin } from "lucide-react";
import { AuthFormInput } from "@/components/auth/auth-form-input";
import { AddressSearchInput } from "@/components/map/address-search-input";
import { LocationPickerMap } from "@/components/map/location-picker-map";
import { GeoPlace, reverseGeocode } from "@/services/geocoding-service";

// Centro de Itapajé/CE: ponto de partida do mapa até a loja escolher a localização
// (o pin só é salvo depois que o usuário busca um endereço ou move o mapa).
const FALLBACK_COORDINATES = { latitude: -3.6841324, longitude: -39.5851265 };

export interface StoreAddressFields {
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_neighborhood: string;
  address_city: string;
}

export interface StorePin {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface StoreAddressStepProps {
  shop: StoreAddressFields;
  errors?: Partial<Record<keyof StoreAddressFields, string>>;
  location: StorePin;
  disabled?: boolean;
  /** Digitação direta em um dos campos (name = "shop.address_street" etc.) */
  onFieldInput: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Campos preenchidos pela busca ou pelo pin */
  onFieldsChange: (fields: Partial<StoreAddressFields>) => void;
  onLocationChange: (location: StorePin) => void;
}

const roadOf = (place: GeoPlace) => place.road || place.street?.split(",")[0]?.trim() || "";

// Só sobrescreve o que o provedor devolveu: um campo que ele não conhece fica como o usuário digitou.
// `keepNumber`: o número que o usuário digitou não é trocado pelo da casa mais próxima do pin.
const fieldsFromPlace = (place: GeoPlace, keepNumber = false): Partial<StoreAddressFields> => {
  const fields: Partial<StoreAddressFields> = {};
  if (roadOf(place)) fields.address_street = roadOf(place);
  if (place.house_number && !keepNumber) fields.address_number = place.house_number;
  if (place.neighborhood) fields.address_neighborhood = place.neighborhood;
  if (place.city) fields.address_city = place.city;
  return fields;
};

export function StoreAddressStep({
  shop,
  errors,
  location,
  disabled = false,
  onFieldInput,
  onFieldsChange,
  onLocationChange,
}: StoreAddressStepProps) {
  const [searchText, setSearchText] = useState("");
  const [pinMoved, setPinMoved] = useState(false);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [fieldsEditedAfterPin, setFieldsEditedAfterPin] = useState(false);
  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cada movimento do pin / escolha de sugestão invalida a resposta de reverse geocoding anterior
  const reverseSeqRef = useRef(0);
  const numberTypedByUserRef = useRef(false);
  const shopRef = useRef(shop);
  shopRef.current = shop;

  const hasCoordinates = location.latitude !== null && location.longitude !== null;

  const cancelPendingReverse = () => {
    reverseSeqRef.current += 1;
    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
    setIsResolvingPin(false);
  };

  useEffect(() => () => {
    reverseSeqRef.current += 1;
    if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
  }, []);

  const handleFieldInput = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name.replace("shop.", "");
    if (field === "address_number") numberTypedByUserRef.current = event.target.value.trim() !== "";
    if (hasCoordinates && field !== "address_complement") setFieldsEditedAfterPin(true);
    onFieldInput(event);
  };

  const handleSelectSuggestion = (place: GeoPlace) => {
    cancelPendingReverse();
    setPinMoved(false);
    setFieldsEditedAfterPin(false);
    numberTypedByUserRef.current = false;
    onFieldsChange(fieldsFromPlace(place));
    onLocationChange({ latitude: place.latitude, longitude: place.longitude, address: place.label });
  };

  // O pin manda: ao movê-lo a posição muda na hora e os campos de endereço são reescritos
  // depois (rua, bairro e cidade do ponto), para o texto não contradizer o ponto salvo.
  const handlePinChange = (latitude: number, longitude: number) => {
    cancelPendingReverse();
    const seq = reverseSeqRef.current;
    setPinMoved(true);
    setFieldsEditedAfterPin(false);
    onLocationChange({ latitude, longitude, address: location.address });
    setIsResolvingPin(true);

    reverseTimerRef.current = setTimeout(async () => {
      try {
        const place = await reverseGeocode(undefined, latitude, longitude);
        // Chegou atrasada (pin movido de novo, sugestão escolhida ou passo fechado): descarta
        if (!place || seq !== reverseSeqRef.current) return;

        const keepNumber = numberTypedByUserRef.current && shopRef.current.address_number.trim() !== "";
        onFieldsChange(fieldsFromPlace(place, keepNumber));
        onLocationChange({ latitude, longitude, address: place.label });
        setSearchText(place.label);
      } catch {
        // Sem reverse geocoding o ponto continua válido: os campos ficam como estão.
      } finally {
        if (seq === reverseSeqRef.current) setIsResolvingPin(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#E8E4DF] bg-[#FAF9F7] p-3.5">
        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#009246]" />
        <p className="text-sm text-[#474747]">
          Informe o endereço completo da loja (rua e número). Depois ajuste o pin no mapa até a porta exata:
          a posição do pin define a distância usada na taxa de entrega por km.
        </p>
      </div>

      <div>
        <label htmlFor="storeAddressSearch" className="block text-sm font-medium text-[#474747] mb-1.5">
          Buscar endereço
        </label>
        <AddressSearchInput
          id="storeAddressSearch"
          value={searchText}
          onValueChange={setSearchText}
          onSelect={handleSelectSuggestion}
          placeholder="Ex: Rua Major Joaquim Alexandre, Itapajé"
        />
      </div>

      <AuthFormInput
        type="text"
        name="shop.address_street"
        placeholder="Nome da rua"
        value={shop.address_street}
        onChange={handleFieldInput}
        disabled={disabled}
        label="Rua"
        error={errors?.address_street}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <AuthFormInput
            type="text"
            name="shop.address_number"
            placeholder="Ex: 120"
            value={shop.address_number}
            onChange={handleFieldInput}
            disabled={disabled}
            label="Número"
            error={errors?.address_number}
          />
        </div>
        <AuthFormInput
          type="text"
          name="shop.address_complement"
          placeholder="Sala, loja... (opcional)"
          value={shop.address_complement ?? ""}
          onChange={handleFieldInput}
          disabled={disabled}
          label="Complemento"
          required={false}
          error={errors?.address_complement}
        />
      </div>

      <AuthFormInput
        type="text"
        name="shop.address_neighborhood"
        placeholder="Bairro"
        value={shop.address_neighborhood}
        onChange={handleFieldInput}
        disabled={disabled}
        label="Bairro"
        error={errors?.address_neighborhood}
      />

      <AuthFormInput
        type="text"
        name="shop.address_city"
        placeholder="Cidade"
        value={shop.address_city}
        onChange={handleFieldInput}
        disabled={disabled}
        label="Cidade"
        error={errors?.address_city}
      />

      <LocationPickerMap
        latitude={location.latitude ?? FALLBACK_COORDINATES.latitude}
        longitude={location.longitude ?? FALLBACK_COORDINATES.longitude}
        onChange={handlePinChange}
        className="h-[280px] w-full"
      />

      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-sm text-[#858585]">
          <Crosshair className="h-3.5 w-3.5 flex-shrink-0" />
          {hasCoordinates ? (
            <>
              Localização marcada:{" "}
              <span className="font-medium text-[#474747]">
                {location.latitude!.toFixed(6)}, {location.longitude!.toFixed(6)}
              </span>
            </>
          ) : (
            "Nenhuma localização marcada ainda: busque o endereço ou mova o mapa."
          )}
        </p>
        {isResolvingPin && <span className="text-sm text-[#858585]">Atualizando o endereço do pin...</span>}
      </div>

      {!hasCoordinates && (
        <p className="flex items-start gap-1.5 text-sm text-[#858585]">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          Sem o pin você pode seguir, mas a taxa de entrega por km só funciona depois que a localização for
          definida em Configurações &gt; Entrega.
        </p>
      )}

      {pinMoved && hasCoordinates && !fieldsEditedAfterPin && (
        <p className="flex items-start gap-1.5 text-sm text-[#858585]">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          O pin foi ajustado no mapa e os campos de endereço acompanham o ponto. Confira o número da loja.
        </p>
      )}

      {fieldsEditedAfterPin && hasCoordinates && (
        <p className="flex items-start gap-1.5 text-sm text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          Você mudou o endereço depois de marcar o pin. Confira se o pin ainda está na porta da loja: é a posição dele que
          define a taxa por km.
        </p>
      )}
    </div>
  );
}
