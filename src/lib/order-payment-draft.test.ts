import test from "node:test";
import assert from "node:assert/strict";
import { draftAdjustment, draftError, draftFromOrder, draftPayload, draftsEqual, withRestInSecond, type PaymentDraft } from "./order-payment-draft.ts";

const rules: Record<string, { type: string; value: number; valueType: string }> = {
  cash: { type: "discount", value: 10, valueType: "percentage" },
  credit: { type: "surcharge", value: 5, valueType: "percentage" },
};
const ruleOf = (m: string) => rules[m];
const split = (a: string, b: string, x: string, y: string): PaymentDraft => ({ split: true, method: a, parts: [{ method: a, amount: x }, { method: b, amount: y }] });

test("rascunho vem do pedido: fatia = valor final - acréscimo", () => {
  const d = draftFromOrder({ payment_method: "cash", payments: [{ payment_method: "cash", amount: 36, adjustment_amount: -4 }, { payment_method: "credit", amount: 63, adjustment_amount: 3 }] });
  assert.equal(d.split, true);
  assert.deepEqual(d.parts.map((p) => p.amount), ["40", "60"]);
  assert.equal(draftFromOrder({ payment_method: "debit" }).split, false);
});

test("acréscimo por forma: único e dividido", () => {
  assert.equal(draftAdjustment({ split: false, method: "credit", parts: [] }, ruleOf, 100, 100), 5);
  assert.equal(draftAdjustment({ split: false, method: "debit", parts: [] }, ruleOf, 100, 100), 0);
  assert.equal(draftAdjustment(split("cash", "credit", "40", "60"), ruleOf, 100, 100), -1); // -4 + 3
});

test("erro: soma menor, maior, formas iguais, valores vazios", () => {
  assert.match(draftError(split("cash", "credit", "40", "50"), 100)!, /inferior/);
  assert.match(draftError(split("cash", "credit", "40", "70"), 100)!, /acima/);
  assert.match(draftError(split("cash", "cash", "40", "60"), 100)!, /diferentes/);
  assert.match(draftError(split("cash", "credit", "", "60"), 100)!, /valor/);
  assert.equal(draftError(split("cash", "credit", "40", "60"), 100), null);
  assert.equal(draftError({ split: false, method: "cash", parts: [] }, 100), null);
});

test("payload: única manda payment_method, dividida manda as fatias", () => {
  assert.deepEqual(draftPayload({ split: false, method: "pix", parts: [] }), { payment_method: "pix" });
  assert.deepEqual(draftPayload(split("cash", "credit", "40,50", "59,5")), { payments: [{ payment_method: "cash", amount: 40.5 }, { payment_method: "credit", amount: 59.5 }] });
});

test("1º valor preenche o restante na 2ª fatia; igual detecta mudança", () => {
  const d = withRestInSecond(split("cash", "credit", "30", ""), 100);
  assert.equal(d.parts[1].amount, "70");
  assert.equal(draftsEqual(d, split("cash", "credit", "30", "70")), true);
  assert.equal(draftsEqual(d, split("cash", "debit", "30", "70")), false);
});
