import test, { beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { ids, product, profile, state, reset, reply } from './fixtures/task5-supabase.mjs';

// Load the real service code with only its Supabase boundary replaced. Never load
// the application client or .env files. Unexpected calls fail closed.
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.endsWith('/lib/supabase')) return { url: new URL('./fixtures/task5-supabase.mjs', import.meta.url).href, shortCircuit: true };
    if (specifier.includes('supabase-js') || (context.parentURL?.includes('/src/') && /^(node:)?(https?|net|tls|dgram)$/.test(specifier))) throw new Error('Network modules forbidden in Task 5 audit');
    if (specifier.startsWith('.') && context.parentURL) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(candidate)) return next(candidate.href, context);
    }
    return next(specifier, context);
  },
});
const { productService } = await import('../src/services/productService.ts');
const { authService } = await import('../src/services/authService.ts');
const { userService } = await import('../src/services/userService.ts');
const { cartService } = await import('../src/services/cartService.ts');
const { orderService } = await import('../src/services/orderService.ts');
const { paymentService } = await import('../src/services/paymentService.ts');
after(() => hooks.deregister());

beforeEach(t => {
  reset();
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Network forbidden in Task 5 audit'); });
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), getItem: key => values.get(key) ?? null,
  } });
  // Expected error branches are asserted below, without logging fixture payloads.
  t.mock.method(console, 'error', () => {});
  t.mock.method(console, 'debug', () => {});
});
afterEach(() => {
  assert.equal(state.replies.length, 0, 'Every expected query must execute');
  delete globalThis.localStorage;
});
const queries = table => state.calls.filter(call => call.table === table);
const payload = (call, method) => call.steps.find(step => step[0] === method)?.[1];
const hasOwner = (call, id = ids.a) => call.steps.some(step => step[0] === 'eq' && step[1] === 'user_id' && step[2] === id);
const context = () => ({ userId: ids.a, isCurrent: () => true });

test('synthetic add -> catalog -> cart uses the same flat product contract', async () => {
  let saved;
  reply(call => ({ data: saved = { id: ids.product, ...payload(call, 'insert') }, error: null }));
  const created = await productService.createProduct({ name: product.name, description: product.description, price: 2500, category: 'bags', images: [product.image], inventory: { quantity: 8 }, isFeatured: true });
  reply(() => ({ data: [saved], count: 1, error: null }));
  const catalog = await productService.getProducts();
  assert.equal(catalog.data[0]._id, created._id);
  assert.equal(catalog.data[0].inventory.quantity, 8);
  reply({ data: null, error: null }); reply(() => ({ data: [saved], error: null }));
  reply(call => ({ data: { id: ids.cart, ...payload(call, 'insert') }, error: null }));
  reply(() => ({ data: [saved], error: null }));
  const cart = await cartService.addItem(created._id, { name: 'obsolete', price: 1, image: '', quantity: 2 }, context());
  assert.equal(cart.subtotal, 5000); assert.equal(cart.items[0].price, 2500);
  assert.equal(payload(queries('carts')[1], 'insert').user_id, ids.a);
});

// Characterization tests intentionally reproduce unresolved defects. Passing
// means the audit evidence is reproducible, not that these behaviors are correct.
test('product creation persists supported flat fields; gallery and threshold remain unsupported', async () => {
  reply({ data: product, error: null });
  await productService.createProduct({ sku: 'SYNTHETIC', compareAtPrice: 3000, images: [product.image, 'https://assets.invalid/second.png'], inventory: { quantity: 8, lowStockThreshold: 2 } });
  const sent = payload(queries('products')[0], 'insert');
  assert.equal(sent.image, product.image); assert.equal(sent.stock, 8);
  assert.equal(sent.sku, 'SYNTHETIC'); assert.equal(sent.compare_at_price, 3000);
  for (const field of ['images', 'low_stock_threshold']) assert.equal(Object.hasOwn(sent, field), false);
});
test('product edit uses the same flat stock/image/price fields as creation', async () => {
  reply({ data: product, error: null });
  await productService.updateProduct(ids.product, { inventory: { quantity: 3 }, isFeatured: false, images: ['https://assets.invalid/new.png'], compareAtPrice: 2800 });
  const sent = payload(queries('products')[0], 'update');
  assert.equal(sent.inventory, undefined); assert.equal(sent.stock, 3);
  assert.equal(sent.featured, false); assert.equal(sent.image, 'https://assets.invalid/new.png'); assert.equal(sent.compare_at_price, 2800);
});
test('catalog rows and counts share filters, zero bounds and stable sort', async () => {
  reply({ data: [product], count: 1, error: null });
  const result = await productService.getProducts({ category: 'bags', featured: true, inStock: true, sort: 'price', maxPrice: 0 });
  assert.equal(result.meta.total, 1);
  assert.equal(queries('products').length, 1);
  const steps = queries('products')[0].steps;
  for (const expected of [['select', '*', { count: 'exact' }], ['eq', 'category', 'bags'], ['eq', 'featured', true], ['gt', 'stock', 0], ['lte', 'price', 0], ['order', 'price', { ascending: true }], ['order', 'id', { ascending: true }]]) {
    assert.ok(steps.some(step => JSON.stringify(step) === JSON.stringify(expected)));
  }
});
test('product read and write permission errors propagate from services', async () => {
  const denied = { code: '42501', message: 'Synthetic denial' };
  reply({ data: null, error: denied }); await assert.rejects(productService.getProduct(ids.product), error => error === denied);
  reply({ data: null, error: denied }); await assert.rejects(productService.updateProduct(ids.product, { price: 2000 }), error => error === denied);
});
test('synthetic login maps database role/name; missing profile defaults to customer', async () => {
  state.authReplies.signInWithPassword = { data: { user: { id: ids.a, email: profile.email }, session: { access_token: 'synthetic', refresh_token: 'synthetic' } }, error: null };
  reply({ data: profile, error: null });
  const result = await authService.login({ email: profile.email, password: 'not-a-real-password' });
  assert.equal(result.user.firstName, 'Synthetic'); assert.equal(result.user.role, 'customer');
  reply({ data: null, error: { code: 'PGRST116' } });
  assert.equal((await authService.login({ email: profile.email, password: 'not-a-real-password' })).user.role, 'customer');
});
test('known gap: confirmation-required signup still attempts a browser profile insert', async () => {
  state.authReplies.signUp = { data: { user: { id: ids.a, email: profile.email }, session: null }, error: null };
  reply({ data: null, error: { code: '42501', message: 'permission denied' } });
  await assert.rejects(authService.register({ email: profile.email, password: 'synthetic-password', firstName: 'Synthetic', lastName: 'A' }), /Database permission error/);
  assert.equal(payload(queries('users')[0], 'insert')[0].id, ids.a);
});
test('profile phone is persisted and returned; unrelated identity fields are not writable', async () => {
  state.authReplies.updateUser = { data: {}, error: null };
  reply({ data: { ...profile, phone: 'synthetic-phone' }, error: null });
  const result = await authService.updateProfile({ firstName: 'Synthetic', lastName: 'A', phone: ' synthetic-phone ', role: 'admin' });
  assert.equal(payload(queries('users')[0], 'update').phone, 'synthetic-phone');
  assert.equal(payload(queries('users')[0], 'update').role, undefined);
  assert.equal(result.phone, 'synthetic-phone');
  for (const field of ['shippingAddresses', 'emailVerified']) assert.equal(result[field], undefined);
});
test('known gap: returned sign-out error is ignored by service', async () => {
  state.authReplies.signOut = { error: { message: 'Synthetic offline failure' } };
  await assert.doesNotReject(authService.logout());
});
test('cart read failure is not empty, foreign owner rejected, stale context makes no query', async () => {
  reply({ data: null, error: { code: '503' } }); await assert.rejects(cartService.getCart(context()), /Could not load/);
  reply({ data: { user_id: ids.b, items: [] }, error: null }); await assert.rejects(cartService.getCart(context()), /not available/);
  const before = state.calls.length;
  await assert.rejects(cartService.getCart({ userId: ids.a, isCurrent: () => false }), /account changed/);
  assert.equal(state.calls.length, before);
});
test('cart quantity save uses owner and revision predicates and refreshed catalog totals', async () => {
  const row = { id: ids.cart, user_id: ids.a, items: [{ productId: ids.product, quantity: 1 }], updated_at: product.updated_at };
  reply({ data: row, error: null }); reply({ data: [product], error: null });
  reply(call => ({ data: { ...row, ...payload(call, 'update') }, error: null })); reply({ data: [product], error: null });
  const cart = await cartService.updateItem(ids.product, 3, undefined, context());
  assert.equal(cart.subtotal, 7500);
  const saved = queries('carts')[1]; assert.ok(hasOwner(saved));
  assert.ok(saved.steps.some(step => step[0] === 'eq' && step[1] === 'updated_at' && step[2] === row.updated_at));
  assert.equal(payload(saved, 'update').total, cart.total);
});
test('cart conflict fails rather than inventing persistence', async () => {
  reply({ data: { id: ids.cart, user_id: ids.a, items: [], updated_at: product.updated_at }, error: null });
  reply({ data: null, error: null });
  await assert.rejects(cartService.clearCart(context()), /changed elsewhere/);
});
test('known gap: address update and order cancellation have no owner query predicate', async () => {
  reply({ data: [], error: null }); await userService.updateAddress('synthetic-address', { city: 'Synthetic city' });
  assert.equal(hasOwner(queries('user_addresses')[0]), false);
  reply({ data: { id: 'synthetic-order', user_id: ids.a }, error: null }); await orderService.cancelOrder('synthetic-order');
  assert.equal(hasOwner(queries('orders')[0]), false);
});
test('known gap: legacy payment history has no owner query predicate', async () => {
  reply({ data: [], count: 0, error: null }); await paymentService.getPayments();
  assert.equal(hasOwner(queries('payments')[0]), false);
});
test('WhatsApp-era order creation, payment verification and refunds remain disabled without any query', async () => {
  for (const operation of [orderService.createOrder, paymentService.initializePayment, paymentService.verifyPayment, paymentService.refundPayment]) {
    await assert.rejects(operation(), error => error.code === 'PAYMENTS_UNAVAILABLE');
  }
  assert.deepEqual(state.calls, []);
});


test('profile service also sends phone without granting role changes', async () => {
  reply({ data: { ...profile, phone: 'synthetic-phone' }, error: null });
  const result = await userService.updateProfile({ phone: 'synthetic-phone', role: 'admin' });
  assert.equal(payload(queries('users')[0], 'update').phone, 'synthetic-phone');
  assert.equal(payload(queries('users')[0], 'update').role, undefined);
  assert.equal(result.phone, 'synthetic-phone');
});
test('admin status service rejects returned Supabase error rather than reporting success', async () => {
  const error = { code: '42501', message: 'Synthetic denial' };
  reply({ data: null, error });
  await assert.rejects(orderService.updateOrderStatus('synthetic-order', 'shipped'), actual => actual === error);
});
test('invalid inventory and prices fail before any database write', async () => {
  for (const data of [{ price: -1 }, { inventory: { quantity: 1.5 } }, { price: NaN }]) {
    await assert.rejects(productService.updateProduct(ids.product, data));
  }
  assert.deepEqual(state.calls, []);
});
test('synthetic Clerk string identities work with cart request ownership and stale checks', async () => {
  const { createClerkSessionController } = await import('../src/auth/clerk/sessionController.ts');
  const session = createClerkSessionController();
  state.userId = 'user_synthetic_A';
  session.update({ isLoaded: true, userId: state.userId, sessionId: 'sess_A', getToken: async () => 'synthetic' });
  reply({ data: { user_id: state.userId, items: [] }, error: null });
  assert.equal((await cartService.getCart(session.capture())).userId, state.userId);
  const stale = session.capture();
  state.userId = 'user_synthetic_B';
  session.update({ isLoaded: true, userId: state.userId, sessionId: 'sess_B', getToken: async () => 'synthetic' });
  await assert.rejects(cartService.getCart(stale), /account changed/);
});
