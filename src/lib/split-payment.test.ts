import test from "node:test";
import assert from "node:assert/strict";
import { buildPayments, formatPayments, parseMoney, remaining, validateFirstAmount } from "./split-payment.ts";

test("parseMoney aceita vírgula, ponto e milhar", () => {
  assert.equal(parseMoney("12,50"), 12.5);
  assert.equal(parseMoney("12.5"), 12.5);
  assert.equal(parseMoney("1.234,56"), 1234.56);
  assert.equal(parseMoney("R$ 7"), 7);
  assert.ok(Number.isNaN(parseMoney("")));
  assert.ok(Number.isNaN(parseMoney("abc")));
  assert.ok(Number.isNaN(parseMoney("-3")));
});

test("restante não acumula erro de ponto flutuante", () => {
  assert.equal(remaining(254.32, 100.1), 154.22);
  assert.equal(remaining(0.3, 0.1), 0.2);
});

test("1º valor: maior que 0 e menor que o total", () => {
  assert.equal(validateFirstAmount(20, 5), null);
  assert.match(validateFirstAmount(20, 0)!, /maior que zero/);
  assert.match(validateFirstAmount(20, NaN)!, /maior que zero/);
  assert.match(validateFirstAmount(20, 20)!, /menor que o total/);
  assert.match(validateFirstAmount(20, 25)!, /menor que o total/);
});

test("buildPayments fecha na soma e recusa formas iguais", () => {
  assert.deepEqual(buildPayments(20, "cash", 12.5, "credit"), [
    { payment_method: "cash", amount: 12.5 },
    { payment_method: "credit", amount: 7.5 },
  ]);
  assert.equal(buildPayments(20, "cash", 12.5, "cash"), null);
  assert.equal(buildPayments(20, "cash", 20, "credit"), null);
});

test("formatPayments", () => {
  assert.equal(formatPayments([]), "");
  assert.equal(formatPayments(undefined), "");
  assert.match(formatPayments([{ payment_method: "cash", amount: 12.5 }, { payment_method: "credit", amount: "7.5" }]).replace(/ /g, " "), /^Dinheiro R\$ 12,50 \+ Crédito R\$ 7,50$/);
});
