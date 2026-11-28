// Pagamento dividido em 2 formas: regras puras (sem React) usadas pelo PDV e pelo checkout do site.
// O servidor valida tudo de novo; aqui só guiamos o preenchimento (valor restante, mensagens).

export type SplitMethod = "cash" | "debit" | "credit" | "manual_pix" | "food_voucher";
export interface SplitPayment { payment_method: SplitMethod; amount: number }

// Fiado e PIX automático ficam de fora da divisão (a API recusa)
export const SPLIT_METHODS: readonly SplitMethod[] = ["cash", "debit", "credit", "manual_pix", "food_voucher"];

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  manual_pix: "PIX",
  asaas_pix: "PIX",
  store_credit: "Fiado",
  food_voucher: "Vale alimentação / refeição",
};

export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** "12,50" ou "12.50" → 12.5; vazio ou inválido → NaN */
export function parseMoney(text: string): number {
  const clean = text.trim().replace(/\s/g, "").replace(/^R\$/, "");
  if (!clean) return NaN;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  return /^\d+(\.\d+)?$/.test(normalized) ? round2(Number(normalized)) : NaN;
}

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/** Regra de acréscimo/desconto de uma forma de pagamento (campos da config da loja) */
export interface AdjustmentRule { type?: string | null; value?: number | string | null; valueType?: string | null }

const cents = (n: number) => BigInt(Math.round(n * 100));

/**
 * Acréscimo (+) ou desconto (-) da forma sobre a parte `part` do valor `base` do pedido; o percentual incide sobre os itens.
 * Conta em centavos inteiros, arredondando meio-centavo para cima: o mesmo resultado da API (Orders::PaymentPlan).
 */
export function ruleAdjustment(rule: AdjustmentRule | null | undefined, itemsTotal: number, part = 1, base = 1): number {
  if (!rule || !rule.type || rule.type === "none") return 0;
  const value = Number(rule.value ?? 0);
  if (!(value > 0)) return 0;
  let amount: number;
  if (rule.valueType === "percentage") {
    if (!(base > 0)) return 0;
    const num = cents(itemsTotal) * cents(part) * BigInt(Math.round(value * 100));
    const den = cents(base) * BigInt(10000);
    amount = Number((BigInt(2) * num + den) / (BigInt(2) * den)) / 100;
  } else {
    amount = round2(value);
  }
  return rule.type === "discount" ? -amount : amount;
}

export const remaining = (total: number, first: number) => round2(total - first);

/** Mensagem de erro do 1º valor (precisa ficar entre 0 e o total, sem chegar nele) ou null se está ok */
export function validateFirstAmount(total: number, amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return "Informe um valor maior que zero";
  if (round2(amount) >= round2(total)) return `O 1º valor precisa ser menor que o total (${formatBRL(total)})`;
  return null;
}

export function buildPayments(total: number, first: SplitMethod, firstAmount: number, second: SplitMethod): SplitPayment[] | null {
  if (first === second || validateFirstAmount(total, firstAmount)) return null;
  return [
    { payment_method: first, amount: round2(firstAmount) },
    { payment_method: second, amount: remaining(total, firstAmount) },
  ];
}

/** "Dinheiro R$ 12,50 + Crédito R$ 7,50" (vazio se não for pedido dividido) */
export function formatPayments(payments: { payment_method: string; amount: number | string }[] | undefined | null): string {
  if (!payments || payments.length === 0) return "";
  return payments.map((p) => `${PAYMENT_LABELS[p.payment_method] ?? p.payment_method} ${formatBRL(Number(p.amount))}`).join(" + ");
}

/** Lê `payments` dos atributos de um pedido (a API manda vazio quando é forma única) */
export const paymentsOf = (attrs: unknown) => (attrs as { payments?: { payment_method: string; amount: number | string }[] } | null | undefined)?.payments;
