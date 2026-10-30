import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { isScannable, parseBarcode } from "@/lib/barcode/parse-barcode";
import type { ScaleMode, ScanItem, ScanResult } from "@/lib/barcode/parse-barcode";

interface UseBarcodeScannerOptions<T extends ScanItem> {
  items: T[];
  mode: ScaleMode;
  onResult: (result: ScanResult<T>, code: string) => void;
  clearSearch: () => void;
  // Com o catálogo ainda carregando, todo código pareceria "não cadastrado" (e abriria o cadastro rápido por engano)
  ready?: boolean;
  onNotReady?: () => void;
}

// O leitor USB digita o número e termina com Enter. Este hook decide se o texto do campo é uma
// leitura (8+ dígitos, sem letras) e, só nesse caso, interpreta; texto comum continua sendo busca por nome.
export function useBarcodeScanner<T extends ScanItem>({ items, mode, onResult, clearSearch, ready = true, onNotReady }: UseBarcodeScannerOptions<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFocus, setHasFocus] = useState(false);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setHasFocus(document.activeElement === inputRef.current);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    // O valor vem do DOM: o estado do React pode ainda não ter recebido o último dígito.
    const text = event.currentTarget.value;
    if (!isScannable(text)) return;

    event.preventDefault();
    clearSearch();
    if (!ready) {
      onNotReady?.();
      return;
    }
    onResult(parseBarcode(text, mode, items), text.trim());
    focusInput();
  };

  return {
    inputRef,
    hasFocus,
    focusInput,
    handleKeyDown,
    focusProps: {
      onFocus: () => setHasFocus(true),
      onBlur: () => setHasFocus(false),
    },
  };
}
