import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseWeightInput } from './weight-input.ts'

test('keeps three decimals, with comma or dot', () => {
  assert.equal(parseWeightInput('1,359'), 1.359)
  assert.equal(parseWeightInput('1.359'), 1.359)
  assert.equal(parseWeightInput(' 0,001 '), 0.001)
  assert.equal(parseWeightInput('1,2'), 1.2)
  assert.equal(parseWeightInput('12'), 12)
})

test('more than three decimals are rounded to three, not to one', () => {
  assert.equal(parseWeightInput('1,3594'), 1.359)
  assert.equal(parseWeightInput('1,3596'), 1.36)
})

test('half-typed or invalid text is not a weight yet', () => {
  for (const raw of ['', ' ', ',5', 'abc', '1,2,3', '-1', '0', '0,0004', '1e3']) {
    assert.equal(parseWeightInput(raw), null, raw)
  }
})

test('a trailing separator keeps the number typed so far', () => {
  assert.equal(parseWeightInput('1.'), 1)
})
