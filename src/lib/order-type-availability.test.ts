import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canTurnOff, getAvailability, resolveOrderType } from './order-type-availability.ts'

test('both types are available when the config has no flags (old cached shop)', () => {
  assert.deepEqual(getAvailability(undefined), { delivery: true, pickup: true })
  assert.deepEqual(getAvailability(null), { delivery: true, pickup: true })
  assert.deepEqual(getAvailability({}), { delivery: true, pickup: true })
  assert.deepEqual(getAvailability({ accepts_delivery: null, accepts_pickup: null }), { delivery: true, pickup: true })
})

test('reads each flag independently', () => {
  assert.deepEqual(getAvailability({ accepts_delivery: false, accepts_pickup: true }), { delivery: false, pickup: true })
  assert.deepEqual(getAvailability({ accepts_delivery: true, accepts_pickup: false }), { delivery: true, pickup: false })
})

test('keeps the current type while it is available', () => {
  assert.equal(resolveOrderType('delivery', { delivery: true, pickup: true }), 'delivery')
  assert.equal(resolveOrderType('pickup', { delivery: true, pickup: true }), 'pickup')
  assert.equal(resolveOrderType('pickup', { delivery: false, pickup: true }), 'pickup')
})

test('moves to the other type when the current one is turned off', () => {
  assert.equal(resolveOrderType('delivery', { delivery: false, pickup: true }), 'pickup')
  assert.equal(resolveOrderType('pickup', { delivery: true, pickup: false }), 'delivery')
})

test('keeps the current type when nothing is available, so the API gets to refuse it', () => {
  assert.equal(resolveOrderType('delivery', { delivery: false, pickup: false }), 'delivery')
})

test('only allows turning one off while the other stays on', () => {
  assert.equal(canTurnOff('delivery', { delivery: true, pickup: true }), true)
  assert.equal(canTurnOff('pickup', { delivery: true, pickup: true }), true)
  assert.equal(canTurnOff('delivery', { delivery: true, pickup: false }), false)
  assert.equal(canTurnOff('pickup', { delivery: false, pickup: true }), false)
})
