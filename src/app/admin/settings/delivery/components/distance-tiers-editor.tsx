"use client";

import { AlertCircle, DollarSign, Info, Plus, Route, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeliveryDistanceTier } from "@/services/delivery-service";
import { formatCurrencyInput, formatCurrencyValue, parseCurrencyInput } from "@/utils/format-price";

/**
 * Uma faixa do formulário. `upToKm` é a distância final; a inicial é sempre a
 * final da faixa anterior, o que torna impossível cadastrar sobreposições ou
 * intervalos vazios. A última faixa é sempre aberta ("acima de X km").
 */
export interface TierDraft {
  key: string;
  upToKm: string;
  amount: string;
}

export const createTierKey = () =>
  `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_TIER_DRAFTS: TierDraft[] = [
  { key: createTierKey(), upToKm: "3", amount: "5,00" },
  { key: createTierKey(), upToKm: "5", amount: "8,00" },
  { key: createTierKey(), upToKm: "10", amount: "12,00" },
  { key: createTierKey(), upToKm: "", amount: "20,00" },
];

export function tiersToDrafts(tiers: DeliveryDistanceTier[]): TierDraft[] {
  if (tiers.length === 0) return DEFAULT_TIER_DRAFTS.map(tier => ({ ...tier, key: createTierKey() }));

  return [...tiers]
    .sort((a, b) => a.min_km - b.min_km)
    .map(tier => ({
      key: createTierKey(),
      upToKm: tier.max_km === null ? "" : String(tier.max_km),
      amount: formatCurrencyValue(tier.amount),
    }));
}

export function draftsToTiers(drafts: TierDraft[]): DeliveryDistanceTier[] {
  let minKm = 0;

  return drafts.map((draft, index) => {
    const isLast = index === drafts.length - 1;
    const maxKm = isLast ? null : parseFloat(draft.upToKm.replace(",", "."));
    const tier: DeliveryDistanceTier = {
      min_km: minKm,
      max_km: Number.isFinite(maxKm as number) ? (maxKm as number) : null,
      amount: parseCurrencyInput(draft.amount),
    };
    minKm = tier.max_km ?? minKm;
    return tier;
  });
}

export function validateDrafts(drafts: TierDraft[]): string | null {
  if (drafts.length === 0) return "Cadastre ao menos uma faixa de quilometragem";

  let previous = 0;

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    const isLast = index === drafts.length - 1;

    if (parseCurrencyInput(draft.amount) < 0) {
      return "Os valores das faixas não podem ser negativos";
    }

    if (isLast) break;

    const upTo = parseFloat(draft.upToKm.replace(",", "."));
    if (!Number.isFinite(upTo)) return "Informe a distância final de todas as faixas";
    if (upTo <= previous) {
      return `A distância final da ${index + 1}ª faixa deve ser maior que ${formatKm(previous)} km`;
    }
    previous = upTo;
  }

  return null;
}

function formatKm(value: number): string {
  return String(value).replace(".", ",");
}

interface DistanceTiersEditorProps {
  drafts: TierDraft[];
  onChange: (drafts: TierDraft[]) => void;
  error?: string;
}

export function DistanceTiersEditor({ drafts, onChange, error }: DistanceTiersEditorProps) {
  const updateDraft = (key: string, patch: Partial<TierDraft>) => {
    onChange(drafts.map(draft => (draft.key === key ? { ...draft, ...patch } : draft)));
  };

  const addTier = () => {
    const bounded = drafts.slice(0, -1);
    const openEnded = drafts[drafts.length - 1];
    onChange([...bounded, { key: createTierKey(), upToKm: "", amount: "" }, openEnded]);
  };

  const removeTier = (key: string) => {
    if (drafts.length <= 1) return;
    onChange(drafts.filter(draft => draft.key !== key));
  };

  const minKmFor = (index: number): number => {
    let minKm = 0;
    for (let i = 0; i < index; i += 1) {
      const upTo = parseFloat(drafts[i].upToKm.replace(",", "."));
      if (Number.isFinite(upTo)) minKm = upTo;
    }
    return minKm;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] p-4">
        <Route className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Defina o valor cobrado por faixa de distância. Cada faixa começa onde a anterior
          termina e a distância limite pertence sempre à faixa seguinte — 3 km cai em
          &ldquo;3 a 5 km&rdquo;, não em &ldquo;0 a 3 km&rdquo;.
        </p>
      </div>

      <div className="space-y-2">
        {drafts.map((draft, index) => {
          const isLast = index === drafts.length - 1;
          const minKm = minKmFor(index);

          return (
            <div
              key={draft.key}
              className="flex flex-col gap-3 rounded-md border border-[#E5E2DD] p-3 sm:flex-row sm:items-end"
            >
              <div className="sm:w-28">
                <Label className="mb-1.5 block text-sm font-medium">De</Label>
                <div className="flex h-10 items-center rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-3 text-sm text-muted-foreground">
                  {formatKm(minKm)} km
                </div>
              </div>

              <div className="sm:w-36">
                <Label className="mb-1.5 block text-sm font-medium">Até</Label>
                {isLast ? (
                  <div className="flex h-10 items-center rounded-md border border-[#E5E2DD] bg-[#FAF9F7] px-3 text-sm text-muted-foreground">
                    Sem limite
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={draft.upToKm}
                      onChange={(event) =>
                        updateDraft(draft.key, {
                          upToKm: event.target.value.replace(/[^\d.,]/g, ""),
                        })
                      }
                      placeholder="Ex: 3"
                      className="h-10 rounded-md border-[#E5E2DD] bg-white pr-10 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      km
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-3.5 w-3.5" />
                  Valor da entrega
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={draft.amount}
                    onChange={(event) =>
                      updateDraft(draft.key, { amount: formatCurrencyInput(event.target.value) })
                    }
                    placeholder="0,00"
                    className="h-10 rounded-md border-[#E5E2DD] bg-white pl-10 text-sm"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => removeTier(draft.key)}
                disabled={drafts.length <= 1}
                aria-label="Remover faixa"
                className="h-10 w-10 cursor-pointer rounded-md border border-gray-300 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <Button
        variant="outline"
        onClick={addTier}
        className="h-10 cursor-pointer gap-2 rounded-md border border-gray-300 hover:bg-[#FAF9F7]"
      >
        <Plus className="h-4 w-4" />
        Adicionar faixa
      </Button>

      <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        A distância é calculada pela rota entre a loja e o endereço confirmado pelo cliente,
        não em linha reta.
      </p>
    </div>
  );
}
