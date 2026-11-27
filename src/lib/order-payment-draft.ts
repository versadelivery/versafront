// Edição do pagamento de um pedido já criado (qualquer status): 1 forma ou 2 formas, com o acréscimo/desconto de cada forma.
// Regras puras (sem React). O servidor valida tudo de novo (Orders::Interactors::ChangePayment).
import { SPLIT_METHODS, parseMoney, round2, ruleAdjustment, formatBRL, type AdjustmentRule } from "./split-payment.ts";

export interface PaymentDraftPart { method: string; amount: string }
export interface PaymentDraft { split: boolean; method: string; parts: PaymentDraftPart[] }

/** Todas as formas que o painel pode registrar em um pedido */
export const PAYMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "cash", label: "Dinheiro" },
  { value: "debit", label: "Cartão de Débito" },
  { value: "credit", label: "Cartão de Crédito" },
  { value: "manual_pix", label: "PIX" },
  { value: "asaas_pix", label: "PIX Automático" },
  { value: "store_credit", label: "Fiado (a receber)" },
  { value: "food_voucher", label: "Vale alimentação / refeição" },
];
export const SPLIT_OPTIONS = PAYMENT_OPTIONS.filter((o) => (SPLIT_METHODS as readonly string[]).includes(o.value));

const toText = (n: number) => String(round2(n)).replace(".", ",");

/** Rascunho a partir do pedido: `payments` traz o valor final de cada parte; a fatia (sem acréscimo) é valor - acréscimo */
export function draftFromOrder(order: { payment_method: string; payments?: { payment_method: string; amount: number | string; adjustment_amount?: number | string }[] }): PaymentDraft {
  const parts = order.payments ?? [];
  if (parts.length === 2) {
    return {
      split: true,
      method: parts[0].payment_method,
      parts: parts.map((p) => ({ method: p.payment_method, amount: toText(Number(p.amount) - Number(p.adjustment_amount ?? 0)) })),
    };
  }
  return { split: false, method: order.payment_method, parts: [{ method: "cash", amount: "" }, { method: "credit", amount: "" }] };
}

export const draftsEqual = (a: PaymentDraft, b: PaymentDraft) =>
  a.split === b.split && (a.split
    ? a.parts.every((p, i) => p.method === b.parts[i].method && parseMoney(p.amount) === parseMoney(b.parts[i].amount))
    : a.method === b.method);

export type RuleOf = (method: string) => AdjustmentRule | null | undefined;

/** Acréscimo/desconto total do rascunho. itemsTotal = só os itens (o percentual incide nele); baseTotal = valor sem acréscimo de forma */
export function draftAdjustment(draft: PaymentDraft, ruleOf: RuleOf, itemsTotal: number, baseTotal: number): number {
  if (!draft.split) return ruleAdjustment(ruleOf(draft.method), itemsTotal);
  return round2(draft.parts.reduce((sum, p) => {
    const amount = parseMoney(p.amount);
    if (!Number.isFinite(amount)) return sum;
    return sum + ruleAdjustment(ruleOf(p.method), itemsTotal, amount, baseTotal);
  }, 0));
}

/** Mensagem de erro do rascunho (null = pode salvar) */
export function draftError(draft: PaymentDraft, baseTotal: number): string | null {
  if (!draft.split) return draft.method ? null : "Escolha a forma de pagamento";
  const [a, b] = draft.parts;
  if (!a.method || !b.method) return "Escolha as 2 formas de pagamento";
  if (a.method === b.method) return "As 2 formas de pagamento devem ser diferentes";
  const x = parseMoney(a.amount);
  const y = parseMoney(b.amount);
  if (!(x > 0) || !(y > 0)) return "Informe o valor das 2 formas (maior que zero)";
  const sum = round2(x + y);
  if (sum < round2(baseTotal)) return `Pagamento inferior ao valor do pedido: falta ${formatBRL(round2(baseTotal - sum))}`;
  if (sum > round2(baseTotal)) return `Pagamento acima do valor do pedido: sobra ${formatBRL(round2(sum - baseTotal))}`;
  return null;
}

/** Campos para a API: forma única manda payment_method; dividido manda as 2 fatias (sem acréscimo) */
export function draftPayload(draft: PaymentDraft): { payment_method: string } | { payments: { payment_method: string; amount: number }[] } {
  if (!draft.split) return { payment_method: draft.method };
  return { payments: draft.parts.map((p) => ({ payment_method: p.method, amount: parseMoney(p.amount) })) };
}

/** Ao digitar o 1º valor, a 2ª fatia vira o restante (continua editável) */
export function withRestInSecond(draft: PaymentDraft, baseTotal: number): PaymentDraft {
  const first = parseMoney(draft.parts[0].amount);
  if (!Number.isFinite(first) || first <= 0 || first >= baseTotal) return draft;
  return { ...draft, parts: [draft.parts[0], { ...draft.parts[1], amount: toText(baseTotal - first) }] };
}
