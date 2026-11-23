import test from "node:test";
import assert from "node:assert/strict";
import { isSameCartLine } from "./cart-line.ts";

const galinha = { id: "7", weight: 1.203 };

test("mesmo item, mesmo peso, sem escolhas: junta (quantidade +1)", () => {
  assert.equal(isSameCartLine(galinha, { ...galinha }), true);
  assert.equal(isSameCartLine({ ...galinha, selectedMethods: [] }, galinha), true);
});

test("modo de preparo diferente NÃO junta (o preparo escolhido não pode se perder)", () => {
  assert.equal(isSameCartLine(galinha, { ...galinha, selectedMethods: ["12"] }), false);
  assert.equal(isSameCartLine({ ...galinha, selectedMethods: ["11"] }, { ...galinha, selectedMethods: ["12"] }), false);
});

test("mesmo preparo junta, em qualquer ordem de marcação", () => {
  assert.equal(isSameCartLine({ ...galinha, selectedMethods: ["12", "13"] }, { ...galinha, selectedMethods: ["13", "12"] }), true);
});

test("peso, adicionais, montagem e complementos continuam separando linhas", () => {
  assert.equal(isSameCartLine(galinha, { ...galinha, weight: 1.5 }), false);
  assert.equal(isSameCartLine(galinha, { ...galinha, selectedExtras: ["1"] }), false);
  assert.equal(isSameCartLine({ ...galinha, selectedOptions: { 1: "2" } }, { ...galinha, selectedOptions: { 1: "3" } }), false);
  assert.equal(isSameCartLine(galinha, { ...galinha, selectedSharedComplements: ["9"] }), false);
  assert.equal(isSameCartLine(galinha, { ...galinha, id: "8" }), false);
});
