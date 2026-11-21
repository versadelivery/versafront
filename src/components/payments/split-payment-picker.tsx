"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Split } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PAYMENT_LABELS, buildPayments, formatBRL, parseMoney, remaining, validateFirstAmount,
  type SplitMethod, type SplitPayment,
} from "@/lib/split-payment";

export interface SplitValue {
  /** modo "2 formas" ligado */
  active: boolean;
  /** as 2 partes, só quando o preenchimento terminou (senão null) */
  payments: SplitPayment[] | null;
}

interface Props {
  total: number;
  /** formas que podem ser divididas e estão ligadas neste canal (site ou PDV) */
  methods: { key: SplitMethod; label?: string }[];
  onChange: (value: SplitValue) => void;
  idPrefix?: string;
  /** texto do título (o site usa "Combinar 2 meios de pagamento") */
  title?: string;
}

const chip = (selected: boolean) =>
  cn(
    "rounded-md border-2 px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer text-left",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    selected ? "border-primary bg-primary text-white" : "border-[#E5E2DD] bg-white text-gray-800 hover:border-gray-400"
  );

// Divisão em 2 formas, em etapas: vê o total, escolhe a 1ª forma e o valor, "OK"; a 2ª etapa já vem com o restante.
export function SplitPaymentPicker({ total, methods, onChange, idPrefix = "split", title = "Dividir em 2 formas de pagamento" }: Props) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [first, setFirst] = useState<SplitMethod | null>(null);
  const [amountText, setAmountText] = useState("");
  const [second, setSecond] = useState<SplitMethod | null>(null);
  const [touched, setTouched] = useState(false);
  const emitted = useRef<string>("");

  const label = (key: SplitMethod) => methods.find((m) => m.key === key)?.label ?? PAYMENT_LABELS[key] ?? key;
  const firstAmount = parseMoney(amountText);
  const error = validateFirstAmount(total, firstAmount);
  const rest = Number.isFinite(firstAmount) ? remaining(total, firstAmount) : 0;
  const payments = active && step === 3 && first && second ? buildPayments(total, first, firstAmount, second) : null;

  // O total mudou (item novo, cupom, taxa): o preenchimento antigo não vale mais
  const lastTotal = useRef(total);
  useEffect(() => {
    if (lastTotal.current !== total) {
      lastTotal.current = total;
      setStep(1);
      setSecond(null);
    }
  }, [total]);

  // Forma que deixou de estar disponível (config mudou) sai da escolha
  useEffect(() => {
    if (first && !methods.some((m) => m.key === first)) { setFirst(null); setStep(1); }
    if (second && !methods.some((m) => m.key === second)) { setSecond(null); setStep(2); }
  }, [methods, first, second]);

  useEffect(() => {
    const key = JSON.stringify({ active, payments });
    if (emitted.current !== key) {
      emitted.current = key;
      onChange({ active, payments });
    }
  });

  if (methods.length < 2) return null;

  const toggle = (on: boolean) => {
    setActive(on);
    setStep(1); setFirst(null); setSecond(null); setAmountText(""); setTouched(false);
  };

  const confirmFirst = () => {
    setTouched(true);
    if (!first || error) return;
    if (second === first) setSecond(null);
    setStep(2);
  };

  return (
    <div className="space-y-3 rounded-md border border-[#E5E2DD] p-3" data-testid={`${idPrefix}-box`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Split className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">Ex.: parte em dinheiro, parte no Pix</p>
          </div>
        </div>
        <Switch data-testid={`${idPrefix}-toggle`} aria-label={title} checked={active} onCheckedChange={toggle} />
      </div>

      {active && (
        <div className="space-y-3" data-testid={`${idPrefix}-flow`}>
          <div className="flex items-baseline justify-between rounded-md bg-[#F6F4F0] px-3 py-2">
            <span className="text-sm text-muted-foreground">Total do pedido</span>
            <span className="text-base font-bold" data-testid={`${idPrefix}-total`}>{formatBRL(total)}</span>
          </div>

          {step === 1 && (
            <div className="space-y-3" data-testid={`${idPrefix}-step-1`}>
              <p className="text-sm font-semibold">1ª forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="1ª forma">
                {methods.map((m) => (
                  <button key={m.key} type="button" role="radio" aria-checked={first === m.key} data-testid={`${idPrefix}-first-${m.key}`} className={chip(first === m.key)} onClick={() => setFirst(m.key)}>
                    {m.label ?? PAYMENT_LABELS[m.key]}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <label htmlFor={`${idPrefix}-amount`} className="text-sm font-medium">Quanto vai pagar nessa forma?</label>
                <Input
                  id={`${idPrefix}-amount`}
                  data-testid={`${idPrefix}-amount`}
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amountText}
                  onChange={(e) => { setAmountText(e.target.value); setTouched(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmFirst(); } }}
                  className={touched && error ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {touched && error && <p className="text-xs text-red-500" data-testid={`${idPrefix}-error`}>{error}</p>}
                {!first && touched && <p className="text-xs text-red-500">Escolha a forma de pagamento</p>}
              </div>
              <Button type="button" className="w-full" data-testid={`${idPrefix}-ok-1`} onClick={confirmFirst}>OK</Button>
            </div>
          )}

          {step >= 2 && first && (
            <div className="flex items-center justify-between rounded-md border border-[#E5E2DD] px-3 py-2" data-testid={`${idPrefix}-line-1`}>
              <span className="text-sm"><span className="text-muted-foreground">1ª:</span> <b>{label(first)}</b></span>
              <span className="flex items-center gap-2">
                <b className="text-sm">{formatBRL(firstAmount)}</b>
                <button type="button" className="text-xs font-medium text-primary underline cursor-pointer" data-testid={`${idPrefix}-edit`} onClick={() => { setStep(1); setSecond(null); }}>
                  <Pencil className="mr-0.5 inline h-3 w-3" />Editar
                </button>
              </span>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3" data-testid={`${idPrefix}-step-2`}>
              <p className="text-sm font-semibold">2ª forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="2ª forma">
                {methods.filter((m) => m.key !== first).map((m) => (
                  <button key={m.key} type="button" role="radio" aria-checked={second === m.key} data-testid={`${idPrefix}-second-${m.key}`} className={chip(second === m.key)} onClick={() => setSecond(m.key)}>
                    {m.label ?? PAYMENT_LABELS[m.key]}
                  </button>
                ))}
              </div>
              <div className="flex items-baseline justify-between rounded-md bg-primary px-3 py-2.5 text-white">
                <span className="text-sm">Valor restante</span>
                <span className="text-lg font-bold" data-testid={`${idPrefix}-rest`}>{formatBRL(rest)}</span>
              </div>
              <Button type="button" className="w-full" disabled={!second} data-testid={`${idPrefix}-ok-2`} onClick={() => setStep(3)}>OK</Button>
            </div>
          )}

          {step === 3 && first && second && (
            <>
              <div className="flex items-center justify-between rounded-md border border-[#E5E2DD] px-3 py-2" data-testid={`${idPrefix}-line-2`}>
                <span className="text-sm"><span className="text-muted-foreground">2ª:</span> <b>{label(second)}</b></span>
                <span className="flex items-center gap-2">
                  <b className="text-sm">{formatBRL(rest)}</b>
                  <button type="button" className="text-xs font-medium text-primary underline cursor-pointer" onClick={() => setStep(2)}>
                    <Pencil className="mr-0.5 inline h-3 w-3" />Editar
                  </button>
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-green-700" data-testid={`${idPrefix}-done`}>
                <Check className="h-4 w-4" /> Pagamento dividido pronto
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
