import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotals, readCartLines, priceCartLines, resolveCart, quantity } from '../src/lib/cartCalculations.ts';
import { validatePublicConfig } from '../src/lib/publicConfig.ts';
import { loginDestination } from '../src/lib/loginDestination.ts';
const line = (price, quantity = 1) => ({ price, quantity });

test('shared totals retain checkout tax and shipping estimates', () => {
  assert.deepEqual(calculateCartTotals([line(2500, 2), line(1500)]), { subtotal: 6500, tax: 487.5, shipping: 2500, discount: 0, total: 9487.5 });
});
test('empty cart has no shipping, tax, discount or total', () => {
  assert.deepEqual(calculateCartTotals([], 500), { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 });
});
test('quantity changes and removal recalculate from line items', () => {
  assert.equal(calculateCartTotals([line(2500)]).total, 5187.5);
  assert.equal(calculateCartTotals([line(2500, 3)]).total, 10562.5);
  assert.equal(calculateCartTotals([line(2500, 3), line(1500)]).subtotal, 9000);
});
test('rounding uses currency minor units and preserves existing shipping boundary', () => {
  assert.equal(calculateCartTotals([line(0.1, 3), line(0.2)]).subtotal, 0.5);
  assert.equal(calculateCartTotals([line(10000)]).shipping, 2500);
  assert.equal(calculateCartTotals([line(10000.01)]).shipping, 0);
  assert.equal(calculateCartTotals([line(19.99, 3)]).tax, 4.5);
});
test('invalid prices, quantities and unsafe sums fail rather than display zero', () => {
  for (const count of [0, -1, 1.2, NaN, Infinity, '2', 10000]) assert.throws(() => quantity(count));
  for (const price of [NaN, Infinity, -1, Number.MAX_SAFE_INTEGER]) assert.throws(() => calculateCartTotals([line(price)]));
});
test('legacy duplicate lines merge quantities; catalog refresh replaces stored prices', () => {
  const lines = readCartLines([{ productId: 'a', quantity: 2, price: 1 }, { productId: { _id: 'a' }, quantity: 1, price: 9999 }]);
  assert.equal(lines.length, 1); assert.equal(lines[0].quantity, 3);
  const priced = priceCartLines(lines, [{ id: 'a', name: 'Current name', price: 200, stock: 5 }]);
  const cart = resolveCart({ id: 'cart', total: 99999 }, 'user', priced);
  assert.equal(cart.items[0].name, 'Current name'); assert.equal(cart.subtotal, 600);
});
test('missing products and insufficient stock are explicit; variants never use guessed prices', () => {
  const lines = readCartLines([{ productId: 'a', quantity: 2 }, { productId: 'gone', quantity: 1 }]);
  const priced = priceCartLines(lines, [{ id: 'a', name: 'Bag', price: 200, stock: 1 }]);
  assert.equal(priced.items.length, 1); assert.equal(priced.notices.length, 2); assert.equal(priced.canCheckout, false);
  assert.throws(() => priceCartLines([{ ...lines[0], variantId: 'unknown' }], [{ id: 'a', name: 'Bag', price: 200 }]));
});
test('discount fields normalize once, clamp to merchandise amount, and need an active coupon', () => {
  const priced = priceCartLines(readCartLines([{ productId: 'a', quantity: 1 }]), [{ id: 'a', name: 'Bag', price: 100 }]);
  assert.equal(resolveCart({ coupon: 'TEST', discount_amount: 500 }, 'user', priced).discount, 100);
  assert.equal(resolveCart({ discount_amount: 500 }, 'user', priced).discount, 0);
  assert.throws(() => resolveCart({ coupon: 'TEST', discount_amount: 'bad' }, 'user', priced));
});
test('public config accepts modern publishable and legacy anon keys', () => {
  const env = { VITE_SUPABASE_URL: 'https://fixture.supabase.co', VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'sb_publishable_synthetic' };
  assert.deepEqual(validatePublicConfig(env).issues, []);
  const jwt = `e30.${Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url')}.synthetic`;
  assert.deepEqual(validatePublicConfig({ VITE_SUPABASE_URL: env.VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY: jwt }).issues, []);
});
test('missing/malformed config and privileged keys report names without values', () => {
  assert.equal(validatePublicConfig({}).issues.length, 2);
  const secret = 'sb_secret_synthetic_not_a_real_key';
  const privileged = `e30.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.synthetic`;
  for (const key of [secret, privileged, 'invalid']) {
    const result = validatePublicConfig({ VITE_SUPABASE_URL: 'https://fixture.supabase.co', VITE_SUPABASE_ANON_KEY: key });
    assert.ok(result.issues.length); assert.ok(!result.issues.join(' ').includes(key));
  }
  for (const url of ['', 'invalid', 'javascript:alert(1)', 'https://user:password@example.test', 'https://example.test/?token=secret']) {
    assert.ok(validatePublicConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'sb_publishable_synthetic' }).issues.length);
  }
});
test('login keeps checkout destination and rejects external redirect paths', () => {
  assert.equal(loginDestination({ pathname: '/checkout', search: '?source=cart', hash: '#summary' }, ''), '/checkout?source=cart#summary');
  assert.equal(loginDestination(undefined, '?redirect=checkout'), '/checkout');
  for (const pathname of ['https://evil.test', '//evil.test', '/\\evil.test', '/\nevil.test']) assert.equal(loginDestination({ pathname }, ''), '/');
});
