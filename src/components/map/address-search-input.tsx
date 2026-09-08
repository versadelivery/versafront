"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GeoPlace, searchAddresses } from "@/services/geocoding-service";

const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;

interface AddressSearchInputProps {
  shopId: string | number;
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (place: GeoPlace) => void;
  placeholder?: string;
  hasError?: boolean;
  id?: string;
}

export function AddressSearchInput({
  shopId,
  value,
  onValueChange,
  onSelect,
  placeholder = "Digite a rua e o bairro",
  hasError = false,
  id,
}: AddressSearchInputProps) {
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  // Texto já resolvido em uma sugestão: impede que a seleção dispare nova busca.
  const settledQueryRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();

    if (query.length < MIN_QUERY_LENGTH || settledQueryRef.current === query) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setSearchFailed(false);

    const timer = setTimeout(async () => {
      try {
        const places = await searchAddresses(shopId, query);
        if (cancelled) return;
        setResults(places);
        setIsOpen(true);
      } catch {
        if (cancelled) return;
        setResults([]);
        setSearchFailed(true);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, shopId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: GeoPlace) => {
    settledQueryRef.current = place.label.trim();
    onValueChange(place.label);
    onSelect(place);
    setIsOpen(false);
    setResults([]);
  };

  const showEmptyState =
    isOpen && !isSearching && results.length === 0 && value.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(event) => {
            settledQueryRef.current = null;
            onValueChange(event.target.value);
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "pl-8 pr-9 text-sm border-[#E5E2DD] focus:border-primary/40",
            hasError && "border-red-400 focus:border-red-400"
          )}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[#E5E2DD] bg-white shadow-md">
          {results.map((place, index) => (
            <li key={`${place.latitude},${place.longitude},${index}`}>
              <button
                type="button"
                onClick={() => handleSelect(place)}
                className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-[#FAF9F7]"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span className="min-w-0 text-gray-700">{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmptyState && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          {searchFailed
            ? "Não conseguimos buscar o endereço agora. Você pode marcar a localização direto no mapa."
            : "Nenhum endereço encontrado. Tente só o nome da rua e ajuste o pin no mapa."}
        </p>
      )}
    </div>
  );
}
