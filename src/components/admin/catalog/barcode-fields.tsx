import { ScanBarcode } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BarcodeFieldsProps {
  barcode: string;
  scaleCode: string;
  showScaleCode: boolean;
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

export function BarcodeFields({ barcode, scaleCode, showScaleCode, errors, onBarcodeChange, onScaleCodeChange }: BarcodeFieldsProps) {
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
          className={errors.barcode ? 'border-destructive' : ''}
        />
        {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
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
            className={errors.scaleCode ? 'border-destructive' : ''}
          />
          {errors.scaleCode && <p className="text-xs text-destructive">{errors.scaleCode}</p>}
          <Hint>Número do produto programado na balança (o PLU). Tem que ser o mesmo da balança.</Hint>
        </div>
      )}
    </>
  );
}
