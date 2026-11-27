'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatBRL, parseMoney, round2, ruleAdjustment } from '@/lib/split-payment';
import {
  PAYMENT_OPTIONS, SPLIT_OPTIONS, draftError, withRestInSecond,
  type PaymentDraft, type RuleOf,
} from '@/lib/order-payment-draft';

interface Props {
  draft: PaymentDraft;
  onChange: (draft: PaymentDraft) => void;
  /** valor do pedido sem acréscimo/desconto de forma de pagamento */
  baseTotal: number;
  /** soma dos itens (o percentual de cada forma incide nela) */
  itemsTotal: number;
  ruleOf: RuleOf;
  /** a loja não oferece pagamento dividido */
  splitAllowed?: boolean;
}

// Edição do pagamento do pedido em qualquer status: 1 forma ou 2 formas, igual ao fechamento no PDV/site
export function OrderPaymentEditor({ draft, onChange, baseTotal, itemsTotal, ruleOf, splitAllowed = true }: Props) {
  const error = draftError(draft, baseTotal);

  const setPart = (index: number, patch: Partial<{ method: string; amount: string }>) => {
    const parts = draft.parts.map((p, i) => (i === index ? { ...p, ...patch } : p));
    const next = { ...draft, parts };
    onChange(index === 0 && patch.amount !== undefined ? withRestInSecond(next, baseTotal) : next);
  };

  const toggleSplit = (on: boolean) => {
    if (!on) return onChange({ ...draft, split: false, method: draft.parts[0].method || draft.method });
    const first = SPLIT_OPTIONS.some((o) => o.value === draft.method) ? draft.method : 'cash';
    const second = SPLIT_OPTIONS.find((o) => o.value !== first)!.value;
    onChange({ ...draft, split: true, parts: [{ method: first, amount: '' }, { method: second, amount: '' }] });
  };

  const sum = round2(draft.parts.reduce((acc, p) => acc + (Number.isFinite(parseMoney(p.amount)) ? parseMoney(p.amount) : 0), 0));

  return (
    <div className="space-y-3" data-testid="order-payment-editor">
      {splitAllowed && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Dividir em 2 formas</span>
          <Switch data-testid="payment-split-toggle" aria-label="Dividir em 2 formas de pagamento" checked={draft.split} onCheckedChange={toggleSplit} />
        </div>
      )}

      {!draft.split ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Metodo</span>
          <Select value={draft.method} onValueChange={(value) => onChange({ ...draft, method: value })}>
            <SelectTrigger data-testid="payment-method-select" className="h-8 w-48 text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-md border-[#E5E2DD]">
              {PAYMENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          {draft.parts.map((part, index) => {
            const amount = parseMoney(part.amount);
            const adj = Number.isFinite(amount) ? ruleAdjustment(ruleOf(part.method), itemsTotal, amount, baseTotal) : 0;
            return (
              <div key={index} className="rounded-md border border-[#E5E2DD] p-2 space-y-1.5" data-testid={`payment-part-${index + 1}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground w-5">{index + 1}ª</span>
                  <Select value={part.method} onValueChange={(value) => setPart(index, { method: value })}>
                    <SelectTrigger data-testid={`payment-part-${index + 1}-method`} className="h-8 flex-1 text-sm border-[#E5E2DD] rounded-md bg-white cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-[#E5E2DD]">
                      {SPLIT_OPTIONS.filter((o) => o.value !== draft.parts[1 - index].method).map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    data-testid={`payment-part-${index + 1}-amount`}
                    aria-label={`Valor da ${index + 1}ª forma`}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="h-8 w-28 text-sm"
                    value={part.amount}
                    onChange={(e) => setPart(index, { amount: e.target.value })}
                  />
                </div>
                {adj !== 0 && (
                  <p className={cn('text-xs text-right font-medium', adj < 0 ? 'text-green-600' : 'text-orange-600')} data-testid={`payment-part-${index + 1}-adjust`}>
                    {adj < 0 ? 'Desconto' : 'Acréscimo'} {adj < 0 ? '-' : '+'}{formatBRL(Math.abs(adj))} → paga {formatBRL(round2(amount + adj))}
                  </p>
                )}
              </div>
            );
          })}
          <p className={cn('text-xs text-right', error ? 'text-red-600 font-semibold' : 'text-muted-foreground')} data-testid="payment-split-status">
            {error ?? `Soma ${formatBRL(sum)} = valor do pedido ${formatBRL(baseTotal)}`}
          </p>
        </div>
      )}
    </div>
  );
}
