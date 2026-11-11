import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { parseBarcode, scanCode } from "@/lib/barcode/parse-barcode";
import type { ScaleMode, ScanItem, ScanResult } from "@/lib/barcode/parse-barcode";

interface UseBarcodeScannerOptions<T extends ScanItem> {
  items: T[];
  mode: ScaleMode;
  onResult: (result: ScanResult<T>, code: string) => void;
  clearSearch: () => void;
  // Com o catálogo ainda carregando, todo código pareceria "não cadastrado" (e abriria o cadastro rápido por engano)
  ready?: boolean;
  onNotReady?: () => void;
  // Liga o atalho F2 (devolve o foco ao campo do leitor) em qualquer ponto da tela. Só o PDV usa.
  shortcut?: boolean;
}

// O leitor USB digita o número e termina com Enter. Este hook decide se o texto do campo é uma
// leitura (8+ dígitos, sem letras) e, só nesse caso, interpreta; texto comum continua sendo busca por nome.
export function useBarcodeScanner<T extends ScanItem>({ items, mode, onResult, clearSearch, ready = true, onNotReady, shortcut = false }: UseBarcodeScannerOptions<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFocus, setHasFocus] = useState(false);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setHasFocus(document.activeElement === inputRef.current);
  }, []);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "F2") return;
      event.preventDefault();
      focusInput();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, focusInput]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    // O valor vem do DOM: o estado do React pode ainda não ter recebido o último dígito.
    const text = scanCode(event.currentTarget.value);
    if (!text) return;

    event.preventDefault();
    clearSearch();
    if (!ready) {
      onNotReady?.();
      return;
    }
    onResult(parseBarcode(text, mode, items), text);
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
