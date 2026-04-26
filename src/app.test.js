import test from 'node:test';
import assert from 'node:assert/strict';
import { hasRequiredRole, Role } from './common/roles.js';

test('role hierarchy works', () => {
  assert.equal(hasRequiredRole(Role.ADMINISTRATEUR, Role.CITOYEN), true);
  assert.equal(hasRequiredRole(Role.CITOYEN, Role.AGENT), false);
});
