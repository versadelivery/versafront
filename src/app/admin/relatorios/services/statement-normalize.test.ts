import test from "node:test";
import assert from "node:assert/strict";
import { normalizeStatement } from "./statement-normalize.ts";

test("resposta vazia/nula não quebra", () => {
  for (const raw of [null, undefined, {}]) {
    const r = normalizeStatement(raw as never);
    assert.ok(Array.isArray(r.payment_groups) && Array.isArray(r.payment_methods) && Array.isArray(r.items));
    assert.equal(r.summary.order_count, 0);
  }
});

test("API antiga (sem payment_groups) vira um bloco Todos a partir dos itens", () => {
  const r = normalizeStatement({
    items: [{ name: "Frango", quantity: 2, unit: "kg", unit_price: 0, revenue: 22, payments: [] }],
    summary: { order_count: 2, item_revenue: 22, delivery_fees: 0, total_revenue: 22, total_item_quantity: 2 },
  } as never);
  assert.equal(r.payment_groups.length, 1);
  assert.deepEqual(r.payment_groups[0].items[0], { name: "Frango", quantity: 2, unit: "kg", unit_price: 11, revenue: 22 });
  assert.equal(r.payment_groups[0].average_ticket, 11);
});

test("API intermediária (grupos sem delivery_fee_items) ganha lista vazia", () => {
  const r = normalizeStatement({ payment_groups: [{ method: "cash", label: "Dinheiro", order_count: 1, items: [], items_total: 10, delivery_fees: 2, total_revenue: 12, average_ticket: 12 }] } as never);
  assert.deepEqual(r.payment_groups[0].delivery_fee_items, []);
});

test("resposta completa passa intacta", () => {
  const g = { method: "cash", label: "Dinheiro", order_count: 8, items: [], items_total: 632, delivery_fees: 19, delivery_fee_items: [{ amount: 2, count: 5, total: 10 }], total_revenue: 651, average_ticket: 81.38 };
  assert.deepEqual(normalizeStatement({ payment_groups: [g] } as never).payment_groups[0], g);
});
