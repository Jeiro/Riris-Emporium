import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogQuery } from '../src/lib/catalogQuery.ts';
import { canActivateDevelopmentClerk } from '../src/auth/clerk/activation.ts';
import { resolveStoreIdentity } from '../src/auth/clerk/storeIdentity.ts';
import { createClerkSessionController } from '../src/auth/clerk/sessionController.ts';
const reviewed = { developmentProjectVerified: true, uuidMappingVerified: true, serverAuthorizationVerified: true, replacementFlowsVerified: true };
const source = userId => ({ isLoaded: true, userId, sessionId: `sess_${userId}`, getToken: async () => 'synthetic' });
const id = '00000000-0000-4000-8000-000000000001';
test('catalog normalizes pagination and allowlists sort columns', () => {
  assert.deepEqual(catalogQuery({ page: -1, limit: 999, sort: 'untrusted' }), { page: 1, limit: 100, offset: 0, sort: { column: 'created_at', ascending: false }, searchExpression: undefined });
  assert.equal(catalogQuery({ page: 3, limit: 12 }).offset, 24);
  assert.deepEqual(catalogQuery({ sort: '-price' }).sort, { column: 'price', ascending: false });
});
test('search punctuation stays inside quoted PostgREST values', () => {
  const search = 'bag,price.gt.0)"\\';
  const pattern = JSON.stringify(`%${search}%`);
  assert.equal(catalogQuery({ search }).searchExpression, `name.ilike.${pattern},description.ilike.${pattern}`);
  assert.throws(() => catalogQuery({ search: 'a'.repeat(201) }));
});
test('zero price bounds accepted; invalid ranges fail before a query', () => {
  assert.doesNotThrow(() => catalogQuery({ minPrice: 0, maxPrice: 0 }));
  for (const filters of [{ minPrice: -1 }, { maxPrice: NaN }, { minPrice: 4, maxPrice: 2 }]) assert.throws(() => catalogQuery(filters));
});
test('Clerk activation requires every reviewed dependency and never permits production builds', () => {
  assert.equal(canActivateDevelopmentClerk(true, reviewed), true);
  assert.equal(canActivateDevelopmentClerk(false, reviewed), false);
  assert.equal(canActivateDevelopmentClerk(true), false);
  for (const key of Object.keys(reviewed)) assert.equal(canActivateDevelopmentClerk(true, { ...reviewed, [key]: false }), false);
});
test('mapped Clerk identity preserves a separate UUID and rejects absent or foreign mappings', async () => {
  const session = createClerkSessionController(); session.update(source('user_A'));
  const mapped = await resolveStoreIdentity(session, async subject => ({ id, clerk_subject: subject }));
  assert.equal(mapped.customerId, id); assert.equal(mapped.clerkSubject, 'user_A'); assert.equal(mapped.isCurrent(), true);
  for (const profile of [null, { id, clerk_subject: 'user_B' }, { id: 'user_A', clerk_subject: 'user_A' }]) await assert.rejects(resolveStoreIdentity(session, async () => profile), /not ready/);
});
test('pending UUID lookup cannot restore another account after a switch', async () => {
  const session = createClerkSessionController(); session.update(source('user_A')); let complete;
  const pending = resolveStoreIdentity(session, () => new Promise(resolve => { complete = resolve; }));
  session.update(source('user_B')); complete({ id, clerk_subject: 'user_A' });
  await assert.rejects(pending, /account changed/);
});
test('Vercel app-root config builds Vite and retains SPA fallback', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.equal(config.framework, 'vite'); assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.installCommand, 'npm ci'); assert.equal(config.buildCommand, 'npm run build');
  assert.ok(config.rewrites.some(rule => rule.source === '/(.*)' && rule.destination === '/index.html'));
});
