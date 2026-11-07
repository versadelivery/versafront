import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NO_NUMBER, isNoNumber, normalizeAddressNumber, hasAddressNumber } from './address-number.ts'

test('typed variations of "sem número" become S/N', () => {
  for (const raw of ['S/N', 's/n', 'sn', 'SN', ' s/n ', 'S.N.', 's n']) {
    assert.equal(normalizeAddressNumber(raw), NO_NUMBER, raw)
    assert.equal(isNoNumber(raw), true, raw)
  }
})

test('real numbers are kept as typed, only trimmed', () => {
  assert.equal(normalizeAddressNumber(' 1300 '), '1300')
  assert.equal(normalizeAddressNumber('12A'), '12A')
  assert.equal(isNoNumber('1300'), false)
  assert.equal(isNoNumber('snow'), false)
})

test('an empty number is missing, S/N is present', () => {
  assert.equal(hasAddressNumber(''), false)
  assert.equal(hasAddressNumber('   '), false)
  assert.equal(hasAddressNumber(null), false)
  assert.equal(hasAddressNumber('S/N'), true)
  assert.equal(hasAddressNumber('0'), true)
})

test('legacy "Rua, 123" is split, a filled number is never overwritten', async () => {
  const { splitStreetNumber } = await import('./address-number.ts')
  assert.deepEqual(splitStreetNumber('Av. Brasil, 656', null), { street: 'Av. Brasil', number: '656' })
  assert.deepEqual(splitStreetNumber('Rua A , 12B', ''), { street: 'Rua A', number: '12B' })
  assert.deepEqual(splitStreetNumber('Rua A, s/n', ''), { street: 'Rua A', number: 'S/N' })
  assert.deepEqual(splitStreetNumber('Rua A, 12', '99'), { street: 'Rua A, 12', number: '99' })
  assert.deepEqual(splitStreetNumber('Rua Sem Numero', ''), { street: 'Rua Sem Numero', number: '' })
  assert.deepEqual(splitStreetNumber('Rua 7 de Setembro', ''), { street: 'Rua 7 de Setembro', number: '' })
})
