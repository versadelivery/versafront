import { test } from 'node:test'
import assert from 'node:assert/strict'
import { needsOptions } from './needs-options.ts'

const step = (required: boolean | undefined, optionCount: number) => ({
  id: '1',
  attributes: { required, options: { data: Array.from({ length: optionCount }, (_, i) => ({ id: String(i) })) } },
})

test('an item with no options goes straight to the cart', () => {
  assert.equal(needsOptions({}), false)
  assert.equal(needsOptions({ steps: { data: [] } }), false)
})

test('optional extras, prepare methods and shared complements do not stop the bip', () => {
  assert.equal(
    needsOptions({
      extra: { data: [{ id: 'e' }] },
      prepare_method: { data: [{ id: 'p' }] },
      shared_complements: { data: [{ id: 'c' }] },
    }),
    false
  )
})

test('a required step with options needs the options dialog', () => {
  assert.equal(needsOptions({ steps: { data: [step(true, 3)] } }), true)
})

test('a step with no required flag counts as required, like the dialog does', () => {
  assert.equal(needsOptions({ steps: { data: [step(undefined, 2)] } }), true)
})

test('an optional step does not stop the bip', () => {
  assert.equal(needsOptions({ steps: { data: [step(false, 3)] } }), false)
})

test('a required step with no options cannot be answered, so it does not block', () => {
  assert.equal(needsOptions({ steps: { data: [step(true, 0)] } }), false)
})

test('one required step among optional ones is enough', () => {
  assert.equal(needsOptions({ steps: { data: [step(false, 2), step(true, 2)] } }), true)
})
