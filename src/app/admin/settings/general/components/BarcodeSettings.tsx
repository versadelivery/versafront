import { AlertCircle, Bell, Check, PackagePlus, Receipt, Scale, ScanBarcode } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BarcodeNotFoundAction = "notice" | "quick_create";
export type ScaleLabelMode = "weight" | "total";

interface BarcodeSettingsProps {
  notFoundAction: BarcodeNotFoundAction;
  scaleMode: ScaleLabelMode;
  onNotFoundActionChange: (value: BarcodeNotFoundAction) => void;
  onScaleModeChange: (value: ScaleLabelMode) => void;
}

interface Option<T extends string> {
  value: T;
  icon: LucideIcon;
  title: string;
  description: string;
}

const NOT_FOUND_OPTIONS: Option<BarcodeNotFoundAction>[] = [
  {
    value: "notice",
    icon: Bell,
    title: "Só avisar",
    description: "Mostra um aviso e o operador segue para o próximo produto.",
  },
  {
    value: "quick_create",
    icon: PackagePlus,
    title: "Cadastro rápido",
    description: "Abre um formulário para cadastrar o produto na hora. Só para quem tem permissão de catálogo.",
  },
];

const SCALE_OPTIONS: Option<ScaleLabelMode>[] = [
  {
    value: "weight",
    icon: Scale,
    title: "Peso",
    description: "A etiqueta traz o peso. O sistema multiplica pelo preço do kg cadastrado.",
  },
  {
    value: "total",
    icon: Receipt,
    title: "Total",
    description: "A etiqueta traz o valor em R$. O sistema calcula o peso.",
  },
];

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2" role="group" aria-label={label}>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(({ value: optionValue, icon: Icon, title, description }) => {
          const selected = optionValue === value;

          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(optionValue)}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-md border p-4 text-left transition-colors",
                selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-[#E5E2DD] bg-white hover:border-primary/50"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  selected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 pr-6">
                <span className="block text-sm font-semibold text-gray-900">{title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
              </span>
              {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BarcodeSettings({ notFoundAction, scaleMode, onNotFoundActionChange, onScaleModeChange }: BarcodeSettingsProps) {
  return (
    <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
        <ScanBarcode className="h-4 w-4 text-primary" />
        <h2 className="font-tomato text-base font-semibold text-gray-900">Leitor de código de barras</h2>
      </div>
      <div className="px-5 py-5 space-y-6">
        <p className="text-sm text-muted-foreground">
          O leitor USB funciona como um teclado: digita o número do produto sozinho. No PDV, clique na busca e bipe.
        </p>

        <OptionGroup
          label="Quando o código não estiver cadastrado (PDV)"
          options={NOT_FOUND_OPTIONS}
          value={notFoundAction}
          onChange={onNotFoundActionChange}
        />

        <div className="space-y-3">
          <OptionGroup
            label="Minha balança grava no código de barras"
            options={SCALE_OPTIONS}
            value={scaleMode}
            onChange={onScaleModeChange}
          />
          {scaleMode === "total" && (
            <p className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                O preço do kg na balança e no sistema precisam ser iguais. O total pode diferir em centavos por arredondamento.
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
