// Run against local Vite only. Every non-local request is fulfilled with fixtures.
// No live API calls, customer data, email delivery, order writes or payments.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const driver = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(driver ? pathToFileURL(driver).href : 'playwright-core');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5173';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Only local servers are allowed');
const output = process.env.TEST_OUTPUT || '/tmp/riris-task3-browser';
await mkdir(output, { recursive: true });
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const P = '11111111-1111-4111-8111-111111111111';
const Q = '22222222-2222-4222-8222-222222222222';
const O = '33333333-3333-4333-8333-333333333333';
const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#D4C4A8"/></svg>');
const products = [{ id: P, name: 'Fixture Linen Bag', price: 2500, stock: 8 }, { id: Q, name: 'Fixture Cotton Scarf', price: 1500, stock: 3 }].map(p => ({ ...p, description: 'Synthetic test catalog item', category: 'Accessories', image, featured: true, created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z' }));
const order = { id: O, user_id: A, order_number: 'FIXTURE-ORDER-001', status: 'pending', total: 8250, created_at: '2026-01-01T10:00:00Z', items: [{ productId: P, name: products[0].name, price: 2500, quantity: 2, image }], shipping_address: { address: 'Fixture street', city: 'Fixture city', state: 'Fixture state', zipCode: '000000' }, payment_method: 'flutterwave' };
let userId = A;
let role = 'customer';
let productMode = 'ok';
let orderMode = 'ok';
let orderDelay = 0;
let cartFails = false;
let authFails = false;
const carts = new Map();
let cartMode = 'ok';
let readDelay = 0;
let writeDelay = 0;
let readsStarted = 0;
let writesStarted = 0;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const seedCart = (id, items) => carts.set(id, { id: `cart-${id}`, user_id: id, items, total: 0, updated_at: '2026-01-01T00:00:00Z' });
seedCart(A, [{ productId: P, name: 'Stale name', quantity: 1, price: 1 }, { productId: P, name: 'Duplicate', quantity: 1, price: 999 }, { productId: Q, quantity: 1, price: 0 }]);
seedCart(B, [{ productId: Q, quantity: 3, price: 99 }]);
const requests = [];
const unexpectedWrites = [];
const consoleErrors = [];
const runtimeErrors = [];
const passed = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
const page = await context.newPage();
page.setDefaultTimeout(12000);
page.on('pageerror', e => runtimeErrors.push(e.message));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push({ text: m.text(), url: page.url(), expectedFailure: authFails || cartFails || cartMode !== 'ok' || productMode !== 'ok' || orderMode !== 'ok' }); });
page.on('dialog', dialog => dialog.accept());
const user = () => ({ id: userId, email: 'fixture@example.test', aud: 'authenticated', role: 'authenticated', created_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: { name: 'Fixture', role } });
function session(id) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: id, aud: 'authenticated', role: 'authenticated', exp })).toString('base64url'), Buffer.alloc(32, 1).toString('base64url')].join('.');
  return { access_token: token, refresh_token: 'synthetic-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: exp, user: { ...user(), id } };
}
await context.route('**/*', async route => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.origin === origin) return route.continue();
  const method = request.method();
  const reply = (body, status = 200, extra = {}) => route.fulfill({ status, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': 'content-range', 'content-type': 'application/json', ...extra }, body: JSON.stringify(body) });
  if (method === 'OPTIONS') return reply({});
  requests.push({ path: url.pathname, query: url.search, method });
  if (url.pathname === '/auth/v1/token') {
    userId = request.postDataJSON().email.startsWith('b@') ? B : A;
    return reply(session(userId));
  }
  if (url.pathname === '/auth/v1/user') return authFails ? reply({ message: 'Fixture auth failure' }, 503) : reply(user());
  if (url.pathname === '/auth/v1/logout') return reply({});
  if (url.pathname.startsWith('/rest/v1/')) {
    const table = url.pathname.split('/').pop();
    const eq = name => url.searchParams.get(name)?.replace(/^eq\./, '');
    let rows = [];
    if (table === 'products') {
      if (productMode === 'error') return reply({ message: 'Fixture catalog failure' }, 503);
      rows = productMode === 'missing' ? [] : products;
      if (eq('id') && !eq('id').startsWith('in.')) rows = rows.filter(p => p.id === eq('id'));
      if (url.searchParams.get('id')?.startsWith('in.')) rows = rows.filter(p => url.searchParams.get('id').includes(p.id));
    } else if (table === 'carts') {
      if (method === 'GET' || method === 'HEAD') {
        readsStarted++;
        if (cartMode === 'error') return reply({ message: 'Fixture cart read failure' }, 503);
        const owner = cartMode === 'foreign' ? A : eq('user_id');
        rows = carts.has(owner) ? [structuredClone(carts.get(owner))] : [];
        if (readDelay && eq('user_id') === A) await sleep(readDelay);
      } else {
        writesStarted++;
        if (cartFails) return reply({ message: 'Fixture cart write failed' }, 503);
        const payload = request.postDataJSON();
        if (method === 'POST') {
          assert.equal(payload.user_id, userId);
          const cart = { ...payload, id: `cart-${userId}` }; carts.set(userId, cart); rows = [structuredClone(cart)];
        } else if (method === 'PATCH') {
          const cart = [...carts.values()].find(c => c.id === eq('id'));
          assert.ok(cart); assert.equal(cart.user_id, eq('user_id')); assert.equal(cart.user_id, userId);
          const matches = cartMode !== 'conflict' && (eq('updated_at') === cart.updated_at || url.searchParams.get('updated_at') === 'is.null' && !cart.updated_at);
          if (matches) { Object.assign(cart, payload); rows = [structuredClone(cart)]; }
        } else unexpectedWrites.push({ table, method });
        if (writeDelay) await sleep(writeDelay);
      }
    } else if (table === 'orders') {
      if (!['GET', 'HEAD'].includes(method)) unexpectedWrites.push({ table, method });
      if (orderDelay) await new Promise(resolve => setTimeout(resolve, orderDelay));
      if (orderMode === 'permission') return reply({ code: '42501', message: 'Fixture permission denial' }, 403);
      if (orderMode === 'error') return reply({ message: 'Fixture order load failure' }, 503);
      rows = orderMode === 'missing' ? [] : [{ ...order, ...(orderMode === 'unknown' ? { status: 'constructor', created_at: null } : {}) }];
      if (eq('id')) rows = rows.filter(o => o.id === eq('id'));
      if (eq('user_id') && orderMode !== 'foreign') rows = rows.filter(o => o.user_id === eq('user_id'));
    } else if (table === 'users') rows = [{ ...user(), name: 'Fixture', last_name: 'Customer', role, shipping_addresses: [] }];
    else if (!['GET', 'HEAD'].includes(method)) unexpectedWrites.push({ table, method });
    if (method === 'HEAD') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range', 'content-range': `0-${Math.max(0, rows.length - 1)}/${rows.length}` }, body: '' });
    return reply(request.headers().accept?.includes('vnd.pgrst.object') ? (rows[0] ?? null) : rows);
  }
  if (!['GET', 'HEAD'].includes(method)) unexpectedWrites.push({ path: url.pathname, method });
  // Valid placeholder images avoid existing image fallback retry loops.
  if (request.resourceType() === 'image') return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#D4C4A8"/></svg>' });
  return route.fulfill({ status: 200, contentType: request.resourceType() === 'script' ? 'text/javascript' : 'text/plain', body: '' });
});
// Discover only the public project URL; never print/read secret values into reports.
const env = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
const host = new URL(env.match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)[1]).hostname;
const storageKey = `sb-${host.split('.')[0]}-auth-token`;
function uiUser() { return { id: userId, firstName: 'Fixture', lastName: 'Customer', email: 'fixture@example.test', role, shippingAddresses: [] }; }
await context.addInitScript(({ storageKey, session, uiUser }) => {
  if (!localStorage.getItem('fixture-seeded')) {
    localStorage.setItem(storageKey, JSON.stringify(session));
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user: uiUser, isAuthenticated: true }, version: 0 }));
    localStorage.setItem('accessToken', 'synthetic');
    localStorage.setItem('fixture-seeded', 'true');
  }
}, { storageKey, session: session(A), uiUser: uiUser() });
async function go(path) {
  await page.goto(origin + path);
  await page.locator('#root').waitFor();
}
async function contains(text) { await page.getByText(text, { exact: false }).first().waitFor(); }
async function noText(text) { assert.ok(!(await page.locator('body').innerText()).includes(text), `Unexpected text: ${text}`); }
async function switchUser(id, nextRole = 'customer') {
  userId = id; role = nextRole;
  await page.evaluate(async ({ session }) => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const { error } = await supabase.auth.setSession(session);
    if (error) throw error;
  }, { session: session(id), uiUser: uiUser() });
}
async function check(name, fn) { await fn(); passed.push(name); console.log('PASS', name); }
async function store() { return page.evaluate(async () => { const { useCartStore } = await import('/src/store/cartStore.ts'); const s = useCartStore.getState(); return { cart: s.cart, status: s.status, ownerId: s.ownerId, isLoading: s.isLoading, error: s.error }; }); }
async function until(fn) { for (let n = 0; n < 120; n++) { if (await fn()) return; await sleep(100); } throw new Error('Condition timed out'); }
async function totals(expected) { await until(async () => { const s = await store(); return s.status === 'ready' && !s.isLoading && s.cart.total === expected; }); }
async function refreshCart() { await page.evaluate(async () => { const { useCartStore } = await import('/src/store/cartStore.ts'); await useCartStore.getState().fetchCart(); }); }
let failure;
try {
  await check('Direct checkout waits for cart hydration and uses catalog prices, not stale stored totals', async () => {
    readDelay = 1500; await go('/checkout');
    await contains('Loading cart'); assert.equal(new URL(page.url()).pathname, '/checkout');
    await totals(9487.5); await contains('₦9,487.5');
    const s = await store(); assert.equal(s.cart.items.length, 2); assert.equal(s.cart.items[0].quantity, 2); assert.equal(s.cart.subtotal, 6500);
    readDelay = 0;
  });
  await check('Cart, drawer and checkout show the same totals', async () => {
    await go('/cart'); await totals(9487.5); await contains('₦9,487.5');
    await page.getByRole('button', { name: 'Cart', exact: true }).click(); await contains('Your Cart (2)');
    assert.equal(await page.getByText('₦9,487.5', { exact: true }).count(), 2);
    await page.getByRole('button', { name: 'Close cart', exact: true }).click();
    await page.getByRole('button', { name: 'Proceed to Checkout', exact: true }).click();
    await contains('₦9,487.5'); assert.equal(new URL(page.url()).pathname, '/checkout');
  });
  await check('Quantity changes, removal, and repeated add merge lines and update saved estimates', async () => {
    await go('/cart'); await totals(9487.5);
    await page.getByRole('button', { name: `Increase quantity of ${products[0].name}`, exact: true }).click();
    await totals(12175); assert.equal(carts.get(A).items.length, 2); assert.equal(carts.get(A).total, 12175);
    await page.getByRole('button', { name: `Remove ${products[1].name} from cart`, exact: true }).click();
    await totals(10562.5);
    await page.evaluate(async id => { const { useCartStore } = await import('/src/store/cartStore.ts'); await useCartStore.getState().addItem(id, { name: 'Tampered name', price: 0.01, image: '', quantity: 1 }); }, P);
    await totals(13250); assert.equal(carts.get(A).items.length, 1); assert.equal(carts.get(A).items[0].price, 2500);
    await page.getByRole('button', { name: `Decrease quantity of ${products[0].name}`, exact: true }).click(); await totals(10562.5);
  });
  await check('A catalog price change is reflected after reload in every estimate', async () => {
    products[0].price = 2000; await refreshCart(); await totals(8950); await contains('₦8,950');
    products[0].price = 2500; await refreshCart(); await totals(10562.5);
  });
  await check('Failed reads and writes are errors, not empty carts; retry restores data', async () => {
    cartMode = 'error'; await refreshCart(); await contains('Could not load your cart'); await noText('Your Cart is Empty');
    cartMode = 'ok'; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await totals(10562.5);
    cartFails = true; await page.getByRole('button', { name: `Increase quantity of ${products[0].name}` }).click(); await contains('Could not save your cart');
    assert.equal(carts.get(A).items[0].quantity, 3); cartFails = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click(); await totals(10562.5);
  });
  await check('Concurrent-tab conflict rejects the write rather than overwriting the newer row', async () => {
    cartMode = 'conflict'; await page.getByRole('button', { name: `Increase quantity of ${products[0].name}` }).click(); await contains('Your cart changed elsewhere');
    assert.equal(carts.get(A).items[0].quantity, 3); cartMode = 'ok'; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await totals(10562.5);
  });
  await check('Delayed A read cannot restore cart after switching to B; returning A retains its cart', async () => {
    readDelay = 1500; const before = readsStarted;
    await page.evaluate(async () => { const { useCartStore } = await import('/src/store/cartStore.ts'); window.fixtureRead = useCartStore.getState().fetchCart(); });
    await until(() => readsStarted > before);
    await switchUser(B); await totals(7337.5); await noText(products[0].name);
    await page.evaluate(() => window.fixtureRead); await totals(7337.5); await noText(products[0].name);
    readDelay = 0; await switchUser(A); await totals(10562.5);
  });
  await check('Delayed A mutation result cannot overwrite B state and queued A mutations are cancelled', async () => {
    writeDelay = 1500; const before = writesStarted;
    await page.evaluate(async id => { const { useCartStore } = await import('/src/store/cartStore.ts'); const s = useCartStore.getState(); window.fixtureWrites = Promise.allSettled([s.updateQuantity(id, 2), s.updateQuantity(id, 5)]); }, P);
    await until(() => writesStarted > before);
    await switchUser(B); await totals(7337.5);
    const result = await page.evaluate(() => window.fixtureWrites);
    assert.ok(result.every(r => r.status === 'rejected')); assert.equal(writesStarted, before + 1);
    await noText(products[0].name); assert.equal((await store()).ownerId, B);
    writeDelay = 0; await switchUser(A); await totals(7875); assert.equal(carts.get(A).items[0].quantity, 2);
  });
  await check('Foreign cart payload is rejected even if API ignores owner filter', async () => {
    cartMode = 'foreign'; await switchUser(B); await contains('This cart is not available for your account'); await noText(products[0].name);
    cartMode = 'ok'; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await totals(7337.5);
    await switchUser(A); await totals(7875);
  });
  await check('Logout clears visible state immediately and login preserves direct-checkout destination', async () => {
    await page.evaluate(async () => { const { useAuthStore } = await import('/src/store/authStore.ts'); await useAuthStore.getState().logout(); });
    await contains('Welcome back'); assert.equal((await store()).cart, null);
    await go('/checkout?source=cart#summary'); await contains('Welcome back');
    await page.getByPlaceholder('you@example.com').fill('a@example.test');
    await page.getByPlaceholder('Enter your password').fill('synthetic-password-only');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await totals(7875); await contains('₦7,875');
    assert.equal(new URL(page.url()).pathname, '/checkout'); assert.equal(new URL(page.url()).search, '?source=cart'); assert.equal(new URL(page.url()).hash, '#summary');
  });
  await check('Catalog failure blocks checkout with retry; insufficient stock disables proceeding', async () => {
    productMode = 'error'; await page.reload(); await contains('Could not refresh cart prices'); assert.equal(new URL(page.url()).pathname, '/checkout');
    productMode = 'ok'; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await totals(7875);
    products[0].stock = 1; await go('/cart'); await contains('does not have enough stock');
    assert.equal(await page.getByRole('button', { name: 'Proceed to Checkout', exact: true }).isDisabled(), true);
    products[0].stock = 8;
  });
  await check('Removing the final item clears all totals; resolved empty checkout redirects to cart', async () => {
    await refreshCart(); await totals(7875);
    await page.getByRole('button', { name: `Remove ${products[0].name} from cart` }).click(); await contains('Your Cart is Empty');
    const s = await store(); assert.equal(s.cart.total, 0); assert.equal(s.cart.shipping, 0); assert.equal(s.cart.tax, 0); assert.equal(carts.get(A).total, 0);
    readDelay = 1000; await go('/checkout'); await contains('Loading cart'); assert.equal(new URL(page.url()).pathname, '/checkout');
    await contains('Your Cart is Empty'); assert.equal(new URL(page.url()).pathname, '/cart'); readDelay = 0;
  });
  await check('Removed catalog product is excluded from totals without writes during reads', async () => {
    seedCart(A, [{ productId: P, quantity: 1, price: 500 }]);
    productMode = 'missing'; const before = writesStarted; await refreshCart(); await contains('Your Cart is Empty');
    assert.equal((await store()).cart.total, 0); assert.equal(writesStarted, before); productMode = 'ok';
  });
  assert.deepEqual(runtimeErrors, []); assert.deepEqual(unexpectedWrites, []);
} catch (error) {
  failure = error; console.error(error);
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ passed, failure: failure?.message, runtimeErrors, consoleErrors, unexpectedWrites, requests }, null, 2));
  await browser.close();
}
if (failure) process.exitCode = 1;
