import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hasPermission } from './permissions.ts'

test('the owner can do everything, even without a permissions list', () => {
  assert.equal(hasPermission({ role: 'owner' }, 'catalog.manage'), true)
  assert.equal(hasPermission({ role: 'owner', permissions: [] }, 'catalog.manage'), true)
})

test('an employee needs the permission in the list', () => {
  assert.equal(hasPermission({ role: 'employee', permissions: ['pdv.manage', 'catalog.manage'] }, 'catalog.manage'), true)
  assert.equal(hasPermission({ role: 'employee', permissions: ['pdv.manage'] }, 'catalog.manage'), false)
})

test('a stored user from before permissions existed gets no permission, so the quick create stays hidden', () => {
  assert.equal(hasPermission({ role: 'employee' }, 'catalog.manage'), false)
  assert.equal(hasPermission({ role: 'employee', permissions: undefined }, 'catalog.manage'), false)
})

test('no user means no permission', () => {
  assert.equal(hasPermission(null, 'catalog.manage'), false)
  assert.equal(hasPermission(undefined, 'catalog.manage'), false)
})

test('does not match a permission by prefix', () => {
  assert.equal(hasPermission({ role: 'employee', permissions: ['catalog.manage.all'] }, 'catalog.manage'), false)
  assert.equal(hasPermission({ role: 'employee', permissions: ['catalog'] }, 'catalog.manage'), false)
})
