import { Loader2 } from "lucide-react";
import type { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

interface BarcodeScannerStatusProps {
  scanner: ReturnType<typeof useBarcodeScanner>;
  // Texto do estado "pronto" (cada tela explica o que a bipada faz ali)
  readyText?: string;
  // Catálogo ainda carregando: o leitor existe, mas uma bipada agora cairia em "carregando"
  loading?: boolean;
}

// Faixa de estado do leitor: pronto quando o campo está em foco; senão vira botão para devolver o foco (ou F2).
export function BarcodeScannerStatus({ scanner, readyText = "Leitor pronto: bipe para adicionar.", loading = false }: BarcodeScannerStatusProps) {
  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground" aria-live="polite">
        <Loader2 aria-hidden className="h-3.5 w-3.5 shrink-0 animate-spin" />
        Carregando o catálogo para o leitor...
      </p>
    );
  }

  return (
    <div aria-live="polite">
      {scanner.hasFocus ? (
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          {readyText}
        </p>
      ) : (
        <button
          type="button"
          onClick={scanner.focusInput}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-3 py-2 text-left text-sm font-medium text-gray-900 transition-colors hover:border-primary/40 hover:bg-white"
        >
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-gray-300" />
          <span className="flex-1">Clique aqui para o leitor voltar a funcionar.</span>
          <kbd className="rounded border border-[#E5E2DD] bg-white px-1.5 py-0.5 text-xs font-normal text-muted-foreground">F2</kbd>
        </button>
      )}
    </div>
  );
}
