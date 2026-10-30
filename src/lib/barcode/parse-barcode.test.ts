import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isScannable, isValidEan13, parseBarcode } from './parse-barcode.ts'
import type { ScanItem } from './parse-barcode.ts'

const picanha: ScanItem = { id: 'picanha', barcode: null, scaleCode: 45, itemType: 'weight_per_kg', price: 69.9, active: true }
const frango: ScanItem = { id: 'frango', barcode: null, scaleCode: 1, itemType: 'weight_per_kg', price: 10, active: true }
const carvaoPorGrama: ScanItem = { id: 'carvao', barcode: null, scaleCode: 77, itemType: 'weight_per_g', price: 0.0699, active: true }
const coca: ScanItem = { id: 'coca', barcode: '7908412514920', scaleCode: null, itemType: 'unit', price: 8, active: true }
const linguica: ScanItem = { id: 'linguica', barcode: '7891000100103', scaleCode: null, itemType: 'weight_per_kg', price: 30, active: true }
const items = [picanha, frango, carvaoPorGrama, coca, linguica]

// Monta uma etiqueta de balança válida: 2 + PLU (6 dígitos) + payload (5 dígitos) + DV.
function label(scaleCode: number, payload: number): string {
  const base = `2${String(scaleCode).padStart(6, '0')}${String(payload).padStart(5, '0')}`
  const sum = [...base].reduce((acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 1 : 3), 0)
  return base + String((10 - (sum % 10)) % 10)
}

test('real label from the owner: frango, 8.055 kg at R$ 10.00 is R$ 80.55', () => {
  const result = parseBarcode('2000001080559', 'weight', items)

  assert.deepEqual(result, { kind: 'scale', item: frango, weight: 8.055, total: 80.55 })
})

test('scale label in weight mode returns 1.570 kg and R$ 109.74', () => {
  assert.deepEqual(parseBarcode('2000045015708', 'weight', items), { kind: 'scale', item: picanha, weight: 1.57, total: 109.74 })
})

test('scale label in total mode returns total 15.70 and weight 0.225', () => {
  assert.deepEqual(parseBarcode('2000045015708', 'total', items), { kind: 'scale', item: picanha, weight: 0.225, total: 15.7 })
})

test('weight_per_g item keeps grams as weight', () => {
  const result = parseBarcode(label(77, 1570), 'weight', items)

  assert.deepEqual(result, { kind: 'scale', item: carvaoPorGrama, weight: 1570, total: 109.74 })
})

test('weight_per_g item in total mode divides the total by the price per gram', () => {
  const result = parseBarcode(label(77, 1574), 'total', items)

  assert.equal(result.kind, 'scale')
  assert.equal(result.kind === 'scale' && result.weight, 225.179)
  assert.equal(result.kind === 'scale' && result.total, 15.74)
})

test('accepts the heaviest weight the label can carry', () => {
  const result = parseBarcode(label(1, 99999), 'weight', items)

  assert.deepEqual(result, { kind: 'scale', item: frango, weight: 99.999, total: 999.99 })
})

test('bad check digit returns invalid_check_digit', () => {
  assert.deepEqual(parseBarcode('2000045015701', 'weight', items), { kind: 'error', reason: 'invalid_check_digit' })
})

test('the owner example label with the wrong digit is refused, not guessed', () => {
  assert.deepEqual(parseBarcode('2000450015701', 'weight', items), { kind: 'error', reason: 'invalid_check_digit' })
})

test('unknown scale code returns unknown_scale_code', () => {
  assert.deepEqual(parseBarcode(label(999, 1570), 'weight', items), { kind: 'error', reason: 'unknown_scale_code' })
})

test('a scale code that belongs to a unit item is not a scale label item', () => {
  const unitWithCode: ScanItem = { ...coca, scaleCode: 500 }

  assert.deepEqual(parseBarcode(label(500, 1570), 'weight', [unitWithCode]), { kind: 'error', reason: 'unknown_scale_code' })
})

test('zero weight returns zero_weight', () => {
  assert.deepEqual(parseBarcode(label(45, 0), 'weight', items), { kind: 'error', reason: 'zero_weight' })
  assert.deepEqual(parseBarcode(label(45, 0), 'total', items), { kind: 'error', reason: 'zero_weight' })
})

test('total mode that rounds to zero weight returns zero_weight', () => {
  assert.deepEqual(parseBarcode(label(45, 1), 'total', items), { kind: 'error', reason: 'zero_weight' })
})

test('price 0 returns invalid_price in both modes, with no division by zero', () => {
  const free: ScanItem = { ...picanha, price: 0 }

  assert.deepEqual(parseBarcode('2000045015708', 'total', [free]), { kind: 'error', reason: 'invalid_price' })
  assert.deepEqual(parseBarcode('2000045015708', 'weight', [free]), { kind: 'error', reason: 'invalid_price' })
})

test('factory barcode of a unit item returns kind unit', () => {
  assert.deepEqual(parseBarcode('7908412514920', 'weight', items), { kind: 'unit', item: coca })
})

test('factory barcode of a weight item returns needs_weight', () => {
  assert.deepEqual(parseBarcode('7891000100103', 'weight', items), { kind: 'needs_weight', item: linguica })
})

test('unknown barcode returns not_found', () => {
  assert.deepEqual(parseBarcode('7891234567895', 'weight', items), { kind: 'error', reason: 'not_found' })
})

test('text with letters or empty text returns not_found', () => {
  assert.deepEqual(parseBarcode('abc12345678', 'weight', items), { kind: 'error', reason: 'not_found' })
  assert.deepEqual(parseBarcode('', 'weight', items), { kind: 'error', reason: 'not_found' })
  assert.deepEqual(parseBarcode('   ', 'weight', items), { kind: 'error', reason: 'not_found' })
})

test('inactive item returns inactive, for factory barcode and for scale label', () => {
  const offCoca: ScanItem = { ...coca, active: false }
  const offPicanha: ScanItem = { ...picanha, active: false }

  assert.deepEqual(parseBarcode('7908412514920', 'weight', [offCoca]), { kind: 'error', reason: 'inactive' })
  assert.deepEqual(parseBarcode('2000045015708', 'weight', [offPicanha]), { kind: 'error', reason: 'inactive' })
})

test('a registered factory barcode wins over the scale label reading', () => {
  const weird: ScanItem = { ...coca, id: 'weird', barcode: '2000045015708' }

  assert.deepEqual(parseBarcode('2000045015708', 'weight', [picanha, weird]), { kind: 'unit', item: weird })
})

test('trims trailing newline and spaces from the reader', () => {
  assert.equal(parseBarcode('7908412514920\r\n', 'weight', items).kind, 'unit')
  assert.equal(parseBarcode('  2000045015708 ', 'weight', items).kind, 'scale')
})

test('a 13 digit code that does not start with 2 is never read as a scale label', () => {
  assert.deepEqual(parseBarcode('7000045015700', 'weight', items), { kind: 'error', reason: 'not_found' })
})

test('isScannable rejects text with letters and strings under 8 digits', () => {
  assert.equal(isScannable('abc12345678'), false)
  assert.equal(isScannable('1234567'), false)
  assert.equal(isScannable('Picanha'), false)
  assert.equal(isScannable(''), false)
  assert.equal(isScannable('12345678'), true)
  assert.equal(isScannable('7908412514920\n'), true)
})

test('isValidEan13 accepts real codes and rejects wrong digits and wrong lengths', () => {
  assert.equal(isValidEan13('7908412514920'), true)
  assert.equal(isValidEan13('2000001080559'), true)
  assert.equal(isValidEan13('7908412514921'), false)
  assert.equal(isValidEan13('790841251492'), false)
  assert.equal(isValidEan13('79084125149200'), false)
  assert.equal(isValidEan13('790841251492a'), false)
})
