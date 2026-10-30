"use client";

import { Input } from "@/components/ui/input";

export type DiscountType = "final" | "fixed" | "percentage";

const OPTIONS: { type: DiscountType; label: string }[] = [
  { type: "final", label: "Preço final" },
  { type: "fixed", label: "R$ Fixo" },
  { type: "percentage", label: "% Porcentagem" },
];

const toNumber = (value: string) => parseFloat(value.replace(",", ".")) || 0;
const toCents = (value: number) => Math.round(value * 100) / 100;
export const formatMoney = (value: number) => value.toFixed(2).replace(".", ",");
const formatPercent = (value: number) => String(toCents(value)).replace(".", ",");

// Preço promocional que vai para a API, qualquer que seja o modo em que o lojista digitou
export function discountFinalPrice(price: number, type: DiscountType, value: string): number {
  if (!value) return price;
  const amount = toNumber(value);
  if (type === "final") return toCents(Math.max(0, amount));
  if (type === "percentage") return toCents(Math.max(0, price - (price * amount) / 100));
  return toCents(Math.max(0, price - amount));
}

// Ao trocar de modo o valor é convertido, então o preço final continua o mesmo
export function convertDiscountValue(price: number, from: DiscountType, value: string, to: DiscountType): string {
  if (!value || price <= 0) return "";
  const final = discountFinalPrice(price, from, value);
  if (to === "final") return formatMoney(final);
  if (to === "fixed") return formatMoney(toCents(price - final));
  return formatPercent(((price - final) / price) * 100);
}

export function discountError(price: number, type: DiscountType, value: string): string | null {
  if (!value) return null;
  const amount = toNumber(value);
  if (type === "final" && price > 0 && amount >= price) return "O preço final deve ser menor que o preço original";
  if (type === "fixed" && price > 0 && amount >= price) return "Desconto deve ser menor que o preço original";
  if (type === "percentage" && amount >= 100) return "Desconto não pode ser 100% ou mais";
  return null;
}

function maskValue(type: DiscountType, raw: string): string {
  if (type === "percentage") {
    const cleaned = raw.replace(/[^\d,.]/g, "").replace(".", ",");
    const [whole = "", decimals] = cleaned.split(",");
    const limited = `${whole.slice(0, 3)}${decimals !== undefined ? `,${decimals.slice(0, 2)}` : ""}`;
    return toNumber(limited) > 100 ? "100" : limited;
  }
  const digits = raw.replace(/\D/g, "");
  return digits ? formatMoney(parseInt(digits, 10) / 100) : "";
}

interface DiscountFieldsProps {
  price: number;
  type: DiscountType;
  value: string;
  error?: string;
  onTypeChange: (type: DiscountType) => void;
  onValueChange: (value: string) => void;
}

export function DiscountFields({ price, type, value, error, onTypeChange, onValueChange }: DiscountFieldsProps) {
  const final = discountFinalPrice(price, type, value);
  const saved = Math.max(0, toCents(price - final));
  const percent = price > 0 ? (saved / price) * 100 : 0;
  const hasValue = !!value && price > 0;
  const label = type === "final" ? "Preço final (R$)" : type === "fixed" ? "Valor do desconto (R$)" : "Desconto (%)";

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-lg bg-muted/40 p-1" role="radiogroup" aria-label="Como informar o desconto">
        {OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            role="radio"
            aria-checked={type === option.type}
            onClick={() => option.type !== type && onTypeChange(option.type)}
            className={`flex-1 cursor-pointer rounded-md px-1 py-2 text-sm font-medium transition-colors ${type === option.type ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{label}</label>
        <Input
          inputMode="decimal"
          value={value}
          onChange={(e) => onValueChange(maskValue(type, e.target.value))}
          placeholder={type === "percentage" ? "0" : "0,00"}
          className={error ? "border-destructive" : ""}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {price > 0 && (
        <dl className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white text-sm" aria-label="Resumo do desconto">
          <div className="flex items-center justify-between p-3">
            <dt className="text-muted-foreground">Preço final</dt>
            <dd className="font-bold">R$ {formatMoney(final)}</dd>
          </div>
          <div className="flex items-center justify-between p-3">
            <dt className="text-muted-foreground">Desconto em R$</dt>
            <dd className="font-semibold">{hasValue ? `R$ ${formatMoney(saved)}` : "—"}</dd>
          </div>
          <div className="flex items-center justify-between p-3">
            <dt className="text-muted-foreground">Desconto em %</dt>
            <dd className="font-semibold">{hasValue ? `${formatPercent(percent)}%` : "—"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
