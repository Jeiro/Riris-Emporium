import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL) {
    const candidate = new URL(`${specifier}.ts`, context.parentURL);
    if (existsSync(candidate)) return next(candidate.href, context);
  }
  return next(specifier, context);
} });
const { createClerkSessionController, accessDecision } = await import('../src/auth/clerk/sessionController.ts');
const { validateClerkConfig } = await import('../src/auth/clerk/config.ts');
const { createClerkSupabaseClient } = await import('../src/auth/clerk/supabaseClient.ts');
const { wishlistKey } = await import('../src/lib/wishlistStorage.ts');
hooks.deregister();
const env = { VITE_SUPABASE_URL: 'https://database.invalid', VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'sb_publishable_synthetic',
  VITE_CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from('clerk.invalid$').toString('base64')}` };
const source = (userId, sessionId = `sess_${userId}`, getToken = async () => 'synthetic-token') => ({ isLoaded: true, userId, sessionId, getToken });

test('Clerk config requires public settings and never includes values in errors', () => {
  assert.equal(validateClerkConfig(env).issues.length, 0);
  assert.ok(validateClerkConfig({}).issues.some(issue => issue.includes('VITE_CLERK_PUBLISHABLE_KEY')));
  for (const key of ['sk_test_synthetic', 'pk_test_not_base64', 'pk_live_']) {
    const result = validateClerkConfig({ ...env, VITE_CLERK_PUBLISHABLE_KEY: key });
    assert.ok(result.issues.length); assert.ok(!result.issues.join().includes(key));
  }
  assert.ok(validateClerkConfig({ ...env, VITE_SUPABASE_ANON_KEY: 'sb_secret_synthetic' }).issues.length);
});
test('loading, signed out, login, account switch and logout invalidate request ownership', async () => {
  const controller = createClerkSessionController();
  assert.equal(accessDecision(controller.getSnapshot()), 'loading');
  await assert.rejects(controller.accessToken());
  controller.update(source(null, null)); assert.equal(accessDecision(controller.getSnapshot()), 'login');
  assert.equal(await controller.accessToken(), null);
  controller.update(source('user_A')); const request = controller.capture();
  assert.equal(accessDecision(controller.getSnapshot()), 'allow'); assert.equal(request.isCurrent(), true);
  controller.update(source('user_B')); assert.equal(request.isCurrent(), false);
  await controller.logout(async () => {}); assert.equal(controller.getSnapshot().userId, null);
});
test('pending token from account A is rejected after B signs in', async () => {
  const controller = createClerkSessionController(); let complete;
  controller.update(source('user_A', 'sess_A', () => new Promise(resolve => { complete = resolve; })));
  const pending = controller.accessToken(); controller.update(source('user_B')); complete('old-token');
  await assert.rejects(pending, /account changed/);
});
test('session rotation for the same user invalidates old work; missing tokens fail closed', async () => {
  const controller = createClerkSessionController(); controller.update(source('user_A', 'first'));
  const request = controller.capture(); controller.update(source('user_A', 'second', async () => null));
  assert.equal(request.isCurrent(), false); await assert.rejects(controller.accessToken(), /verify your session/);
});
test('logout clears identity before remote completion and reports failure without restoring it', async () => {
  const controller = createClerkSessionController(); controller.update(source('user_A'));
  let fail; const logout = controller.logout(() => new Promise((_, reject) => { fail = reject; }));
  assert.equal(controller.getSnapshot().userId, null);
  controller.update(source('user_A')); assert.equal(controller.getSnapshot().userId, null);
  fail(new Error('synthetic failure'));
  await assert.rejects(logout, /could not be confirmed/); assert.equal(accessDecision(controller.getSnapshot()), 'error');
});
test('admin UI defaults to denied, rejects another account or an obsolete role result', () => {
  const controller = createClerkSessionController(); controller.update(source('user_A'));
  const identity = controller.getSnapshot();
  assert.equal(accessDecision(identity, true), 'deny');
  assert.equal(accessDecision(identity, true, { userId: 'user_A', revision: identity.revision, role: 'admin' }), 'allow');
  assert.equal(accessDecision(identity, true, { userId: 'user_B', revision: identity.revision, role: 'admin' }), 'deny');
  assert.equal(accessDecision(identity, true, { userId: 'user_A', revision: identity.revision - 1, role: 'admin' }), 'deny');
});
test('Clerk wishlist keys remain local, account-separated and stable for returning users', () => {
  assert.notEqual(wishlistKey('user_A'), wishlistKey('user_B'));
  assert.equal(wishlistKey('user_A'), 'riris:wishlist:v1:user_A');
});
test('native Supabase accessToken callback uses current Clerk token; requests are intercepted', async () => {
  const controller = createClerkSessionController(); const requests = [];
  controller.update(source('user_A', 'sess_A', async () => 'token_A'));
  const client = createClerkSupabaseClient(env, controller, async (url, options) => {
    requests.push({ url: String(url), authorization: new Headers(options.headers).get('authorization') });
    return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } });
  });
  assert.equal((await client.from('carts').select('*').eq('user_id', 'user_A')).error, null);
  controller.update(source('user_B', 'sess_B', async () => 'token_B'));
  assert.equal((await client.from('carts').select('*').eq('user_id', 'user_B')).error, null);
  assert.deepEqual(requests.map(request => request.authorization), ['Bearer token_A', 'Bearer token_B']);
  assert.ok(requests.every(request => request.url.startsWith('https://database.invalid/rest/v1/carts')));
});
test('invalid configuration never constructs a usable Supabase client', () => {
  assert.throws(() => createClerkSupabaseClient({}, createClerkSessionController()), /configuration is unavailable/);
});
