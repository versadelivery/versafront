import { CheckCircle2, ScanBarcode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCodeCheck } from "@/hooks/useCodeCheck";

interface BarcodeFieldsProps {
  barcode: string;
  scaleCode: string;
  showScaleCode: boolean;
  exceptId?: string;
  errors: { barcode?: string; scaleCode?: string };
  onBarcodeChange: (value: string) => void;
  onScaleCodeChange: (value: string) => void;
}

// O leitor termina a leitura com Enter; sem isso o formulário seria enviado a cada bipada.
const ignoreEnter = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') e.preventDefault();
};

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <ScanBarcode className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

interface CodeStatusProps {
  error?: string;
  owner: string | null;
  free: boolean;
  checking: boolean;
}

// Erro do servidor (ao salvar) tem prioridade; senão mostra o resultado da checagem ao vivo.
function CodeStatus({ error, owner, free, checking }: CodeStatusProps) {
  if (error) return <p className="text-xs text-destructive">{error}</p>;
  if (owner) return <p className="text-xs text-destructive" role="alert">Já está em uso pelo item &quot;{owner}&quot;.</p>;
  if (checking) return <p className="text-xs text-muted-foreground">Verificando...</p>;
  if (free) {
    return (
      <p className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Código livre.
      </p>
    );
  }
  return null;
}

export function BarcodeFields({ barcode, scaleCode, showScaleCode, exceptId, errors, onBarcodeChange, onScaleCodeChange }: BarcodeFieldsProps) {
  const check = useCodeCheck({ barcode, scaleCode: showScaleCode ? scaleCode : '', exceptId });

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="item-barcode">Código de barras</label>
        <Input
          id="item-barcode"
          inputMode="numeric"
          autoComplete="off"
          value={barcode}
          onChange={(e) => onBarcodeChange(e.target.value.replace(/\D/g, ''))}
          onKeyDown={ignoreEnter}
          placeholder="Opcional"
          className={errors.barcode || check.barcodeOwner ? 'border-destructive' : ''}
        />
        <CodeStatus error={errors.barcode} owner={check.barcodeOwner} free={check.barcodeFree} checking={check.checking && barcode.length >= 8} />
        <Hint>Clique no campo e bipe o produto. O leitor digita o número sozinho.</Hint>
      </div>

      {showScaleCode && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="item-scale-code">Código na balança</label>
          <Input
            id="item-scale-code"
            inputMode="numeric"
            autoComplete="off"
            value={scaleCode}
            onChange={(e) => onScaleCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={ignoreEnter}
            placeholder="Ex.: 45"
            className={errors.scaleCode || check.scaleCodeOwner ? 'border-destructive' : ''}
          />
          <CodeStatus error={errors.scaleCode} owner={check.scaleCodeOwner} free={check.scaleCodeFree} checking={check.checking && !!scaleCode} />
          <Hint>Número do produto programado na balança (o PLU). Tem que ser o mesmo da balança.</Hint>
        </div>
      )}
    </>
  );
}
