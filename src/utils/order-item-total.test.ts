import test from "node:test";
import assert from "node:assert/strict";
import { calculateItemTotal } from "./order-item-total.ts";
import { orderItemPrintLabel, orderItemQuantityLabel, orderItemTotalWeight } from "./order-item-quantity.ts";

const galinha = { item_type: 'weight_per_kg', price: 11.9, quantity: 2 };

test('peso por unidade (pedido do cliente) multiplica pela quantidade', () => {
  assert.equal(calculateItemTotal({ ...galinha, weight: 1.203 }), 28.63);
});

test('peso da etiqueta (weight_total) já é de todas as unidades: 2,406 x 11,90', () => {
  assert.equal(calculateItemTotal({ ...galinha, weight: 2.406, weight_total: true }), 28.63);
});

test('peso total não multiplica o kg pela quantidade, mas adicionais continuam por unidade', () => {
  assert.equal(calculateItemTotal({ item_type: 'weight_per_kg', price: 10, quantity: 2, weight: 1, weight_total: true, selected_extras: [{ price: 2 }] }), 14);
});

test('item por unidade não muda', () => {
  assert.equal(calculateItemTotal({ item_type: 'unit', price: 5, quantity: 3 }), 15);
});

test('peso total de todas as unidades', () => {
  assert.ok(Math.abs(orderItemTotalWeight({ ...galinha, weight: 1.203 }) - 2.406) < 1e-5);
  assert.equal(orderItemTotalWeight({ ...galinha, weight: 2.406, weight_total: true }), 2.406);
});

test('via impressa mostra quantidade e peso total', () => {
  assert.equal(orderItemPrintLabel({ ...galinha, weight: 2.406, weight_total: true }), '2 un. · 2,406 kg');
  assert.equal(orderItemPrintLabel({ ...galinha, weight: 1.203 }), '2 un. · 2,406 kg');
  assert.equal(orderItemPrintLabel({ item_type: 'weight_per_kg', quantity: 1, weight: 1.4 }), '1,4 kg');
  assert.equal(orderItemPrintLabel({ item_type: 'unit', quantity: 3 }), '3 un.');
});

test('rótulo de lista', () => {
  assert.equal(orderItemQuantityLabel({ ...galinha, weight: 1.203 }), '2x 1,203 kg');
  assert.equal(orderItemQuantityLabel({ ...galinha, weight: 2.406, weight_total: true }), '2 un. · 2,406 kg');
});
