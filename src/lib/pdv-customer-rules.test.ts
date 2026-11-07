import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectCustomerErrors, type PdvRuleContext } from './pdv-customer-rules.ts'

const base: PdvRuleContext = {
  orderType: 'delivery',
  customer: { name: '', phone: '', address: '', number: '', neighborhood: '' },
  isPerKm: false,
  isPerNeighborhood: false,
  selectedNeighborhoodId: '',
  km: { address: '', number: '', neighborhood: '', latitude: null, longitude: null, error: null, hasQuote: false },
}
const ctx = (over: Partial<PdvRuleContext>): PdvRuleContext => ({ ...base, ...over })

test('no order type chosen blocks everything', () => {
  assert.deepEqual(Object.keys(collectCustomerErrors(ctx({ orderType: null }))), ['orderType'])
})

test('counter needs nothing, not even a name', () => {
  assert.deepEqual(collectCustomerErrors(ctx({ orderType: 'counter' })), {})
})

test('pickup needs only a valid phone', () => {
  assert.deepEqual(Object.keys(collectCustomerErrors(ctx({ orderType: 'pickup' }))), ['phone'])
  const ok = ctx({ orderType: 'pickup', customer: { ...base.customer, phone: '(85) 98877-6655' } })
  assert.deepEqual(collectCustomerErrors(ok), {})
  const bad = ctx({ orderType: 'pickup', customer: { ...base.customer, phone: '(85) 988' } })
  assert.match(collectCustomerErrors(bad).phone, /inválido/)
})

test('delivery requires name, phone and address', () => {
  assert.deepEqual(Object.keys(collectCustomerErrors(base)).sort(), ['address', 'name', 'neighborhood', 'number', 'phone'])
})

test('delivery per neighborhood asks for the neighborhood list, not free text', () => {
  const errors = collectCustomerErrors(ctx({ isPerNeighborhood: true, customer: { name: 'A', phone: '(85) 98877-6655', address: 'Rua', number: '10', neighborhood: 'x' } }))
  assert.deepEqual(errors, { neighborhood: 'Selecione um bairro' })
})

test('delivery per km needs a confirmed location and a quote', () => {
  const km = { address: 'Rua A', number: '1', neighborhood: 'Centro', latitude: -3.7, longitude: -38.5, error: null, hasQuote: false }
  const customer = { name: 'A', phone: '(85) 98877-6655', address: '', number: '', neighborhood: '' }
  assert.match(collectCustomerErrors(ctx({ isPerKm: true, customer, km })).address, /taxa/)
  assert.deepEqual(collectCustomerErrors(ctx({ isPerKm: true, customer, km: { ...km, hasQuote: true } })), {})
  assert.match(collectCustomerErrors(ctx({ isPerKm: true, customer, km: { ...km, latitude: null } })).address, /mapa/)
})

test('delivery needs the house number in its own field, or S/N', () => {
  const customer = { name: 'A', phone: '(85) 98877-6655', address: 'Major Barreto', number: '', neighborhood: 'Centro' }
  assert.deepEqual(collectCustomerErrors(ctx({ customer })), { number: 'Informe o número ou marque S/N' })
  assert.deepEqual(collectCustomerErrors(ctx({ customer: { ...customer, number: 'S/N' } })), {})
  assert.deepEqual(collectCustomerErrors(ctx({ customer: { ...customer, number: 'sn' } })), {})
  assert.deepEqual(collectCustomerErrors(ctx({ customer: { ...customer, number: '1300' } })), {})
})

test('per km also accepts S/N as the number', () => {
  const km = { address: 'Rua A', number: 'S/N', neighborhood: 'Centro', latitude: -3.7, longitude: -38.5, error: null, hasQuote: true }
  const customer = { name: 'A', phone: '(85) 98877-6655', address: '', number: '', neighborhood: '' }
  assert.deepEqual(collectCustomerErrors(ctx({ isPerKm: true, customer, km })), {})
  assert.deepEqual(Object.keys(collectCustomerErrors(ctx({ isPerKm: true, customer, km: { ...km, number: '' } }))), ['number'])
})
