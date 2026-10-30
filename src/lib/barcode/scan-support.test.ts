import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scanErrorMessage } from './scan-messages.ts'
import { toScanItem } from './to-scan-item.ts'
import type { CatalogItemLike } from './to-scan-item.ts'

const raw = (attributes: Record<string, unknown>) => ({
  id: '7',
  attributes: { item_type: 'unit', price: '10.0', price_with_discount: null, active: true, barcode: null, scale_code: null, ...attributes } as CatalogItemLike['attributes'],
})

test('maps the catalog payload to a scan item and keeps the raw item', () => {
  const picanha = raw({ item_type: 'weight_per_kg', price: '69.9', barcode: '7891000100103', scale_code: 45 })
  const scanItem = toScanItem(picanha)

  assert.deepEqual(
    { ...scanItem, raw: undefined },
    { id: '7', barcode: '7891000100103', scaleCode: 45, itemType: 'weight_per_kg', price: 69.9, active: true, raw: undefined }
  )
  assert.equal(scanItem.raw, picanha)
})

test('uses the discounted price when there is one', () => {
  assert.equal(toScanItem(raw({ price: '20.0', price_with_discount: '15.5' })).price, 15.5)
})

test('ignores a missing or blank discount', () => {
  assert.equal(toScanItem(raw({ price: '20.0', price_with_discount: null })).price, 20)
  assert.equal(toScanItem(raw({ price: '20.0', price_with_discount: '' })).price, 20)
  assert.equal(toScanItem(raw({ price: '20.0', price_with_discount: undefined })).price, 20)
})

test('an item without a price reads as price 0, never NaN', () => {
  assert.equal(toScanItem(raw({ price: null })).price, 0)
  assert.equal(toScanItem(raw({ price: 'abc' })).price, 0)
})

test('blank barcode and missing scale code become null', () => {
  const item = toScanItem(raw({ barcode: '', scale_code: undefined }))

  assert.equal(item.barcode, null)
  assert.equal(item.scaleCode, null)
})

test('the item is inactive when it or its group is switched off', () => {
  assert.equal(toScanItem(raw({ active: false })).active, false)
  assert.equal(toScanItem(raw({ active: true }), false).active, false)
  assert.equal(toScanItem(raw({ active: undefined })).active, true)
})

test('error messages are specific and mention the scanned code when it helps', () => {
  assert.equal(scanErrorMessage('not_found', '7891234567895'), 'Código 7891234567895 não cadastrado.')
  assert.equal(scanErrorMessage('invalid_check_digit', ''), 'Etiqueta inválida. Bipe de novo.')
  assert.equal(
    scanErrorMessage('unknown_scale_code', ''),
    'Produto da balança não encontrado. Confira o "Código na balança" no cadastro.'
  )
  assert.equal(scanErrorMessage('zero_weight', ''), 'Etiqueta sem peso. Pese de novo.')
  assert.equal(scanErrorMessage('inactive', ''), 'Item inativo.')
  assert.equal(scanErrorMessage('invalid_price', ''), 'Item sem preço. Corrija no catálogo.')
})
