// Run against local Vite only. Every non-local request is fulfilled with fixtures.
// No live API calls, customer data, email delivery, order writes or payments.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const driver = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(driver ? pathToFileURL(driver).href : 'playwright-core');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5173';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Only local servers are allowed');
const output = process.env.TEST_OUTPUT || '/tmp/riris-whatsapp-browser';
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
const providerRequests = [];
const unexpectedWrites = [];
const consoleErrors = [];
const runtimeErrors = [];
const passed = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
await context.addInitScript(() => { window.fixtureOpens = []; window.fixturePopupMode = 'open'; window.open = (...args) => { window.fixtureOpens.push(args); if (window.fixturePopupMode === 'throw') throw new Error('Synthetic popup block'); return window.fixturePopupMode === 'blocked' ? null : {}; }; window.fixturePaymentCalls = 0; window.FlutterwaveCheckout = () => { window.fixturePaymentCalls++; throw new Error('Payment SDK must never be invoked'); }; });
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
  if (/(^|\.)flutterwave\.com$/.test(url.hostname)) providerRequests.push(url.pathname);
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
const fields = { firstName: 'Synthetic', lastName: 'Customer', email: 'fixture@example.test', phone: '+234 800 000 0000', address: 'Synthetic street & flat #2', city: 'Synthetic city', state: 'Synthetic state', zipCode: '000000' };
async function fill() { for (const [name, value] of Object.entries(fields)) await page.locator(`#${name}`).fill(value); }
async function submit() { await page.getByRole('button', { name: 'Order via WhatsApp', exact: true }).click(); }
async function draft() { return new URL(await page.getByRole('link', { name: 'Open WhatsApp if it did not open automatically' }).getAttribute('href')); }
async function opens() { return page.evaluate(() => window.fixtureOpens); }
let failure;
try {
  await check('Loaded checkout retains actual items and shows merchandise-only estimates with manual payment explanation', async () => {
    await go('/checkout'); await contains('Our team will confirm the final amount'); await contains('₦6,500');
    assert.equal(await page.getByRole('button', { name: 'Order via WhatsApp', exact: true }).isEnabled(), true);
    await noText('VAT (7.5%)'); await noText('Grand Total'); await noText('Flutterwave / Card Payment');
  });
  await check('Missing and invalid customer/delivery details block WhatsApp with helpful errors', async () => {
    await submit(); await contains('Please enter your phone number'); assert.equal((await opens()).length, 0);
    await fill(); await page.locator('#phone').fill('abc'); await submit(); await contains('valid phone number');
    await fill(); await page.locator('#address').fill('   '); await submit(); await contains('Please enter your delivery address');
    await fill(); await page.locator('#city').fill(''); await submit(); await contains('Please enter your city');
    await fill(); await page.locator('#state').fill(''); await submit(); await contains('Please enter your state');
    await fill(); await page.locator('#email').fill('invalid'); await submit(); await contains('valid email address');
    assert.equal((await opens()).length, 0);
  });
  await check('Multiple-product draft is encoded, opens a new tab safely and preserves cart and shipping without sending', async () => {
    await fill(); const cartBefore = JSON.stringify(carts.get(A)); const before = writesStarted;
    await submit(); await contains('Nothing has been sent');
    const url = await draft(); assert.equal(url.origin + url.pathname, 'https://wa.me/2348072105878');
    const message = url.searchParams.get('text');
    assert.ok(message.includes('Quantity: 2')); assert.ok(message.includes('Fixture Cotton Scarf'));
    assert.ok(message.includes('Estimated Total (items only): ₦6,500.00'));
    assert.ok(message.includes('Delivery: To be confirmed')); assert.ok(message.includes(fields.address));
    const call = (await opens()).at(-1); assert.deepEqual(call, [url.href, '_blank', 'noopener,noreferrer']);
    assert.equal(JSON.stringify(carts.get(A)), cartBefore); assert.equal(writesStarted, before);
    for (const [name, value] of Object.entries(fields)) assert.equal(await page.locator(`#${name}`).inputValue(), value);
    assert.equal(new URL(page.url()).pathname, '/checkout'); await noText('Order Placed!');
  });
  await check('Blocked/throwing popup keeps a usable fallback; editing fields invalidates the older draft', async () => {
    await page.evaluate(() => { window.fixturePopupMode = 'blocked'; }); await submit();
    let url = await draft(); assert.equal(url.hostname, 'wa.me');
    await page.locator('#address').fill('New synthetic address');
    assert.equal(await page.getByRole('link', { name: 'Open WhatsApp if it did not open automatically' }).count(), 0);
    await page.evaluate(() => { window.fixturePopupMode = 'throw'; }); await submit(); await contains('Your browser could not open WhatsApp');
    url = await draft(); assert.ok(url.searchParams.get('text').includes('New synthetic address'));
    await page.evaluate(() => { window.fixturePopupMode = 'open'; });
  });
  await check('Quantity changes and a single remaining product use fresh prices and safely encode special characters', async () => {
    await go('/cart'); await totals(9487.5);
    await page.getByRole('button', { name: `Increase quantity of ${products[0].name}`, exact: true }).click(); await totals(12175);
    await page.getByRole('button', { name: `Remove ${products[1].name} from cart`, exact: true }).click(); await totals(10562.5);
    products[0].name = 'Bag & scarf #1 + 50% 👜';
    await go('/checkout'); await contains(products[0].name); await fill(); await submit();
    const message = (await draft()).searchParams.get('text');
    assert.ok(message.includes(products[0].name)); assert.ok(message.includes('Quantity: 3'));
    assert.ok(message.includes('Estimated Total (items only): ₦7,500.00')); assert.ok(!message.includes('Fixture Cotton Scarf'));
  });
  await check('Mobile checkout fits the viewport and retains the order form and fallback', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await submit(); await draft();
    assert.ok((await page.getByRole('button', { name: 'Order via WhatsApp', exact: true }).boundingBox()).height >= 44);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.screenshot({ path: `${output}/checkout-mobile.png`, fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
  });
  await check('Account switching removes the previous draft and shipping details; returning A retains its cart', async () => {
    await switchUser(B); await totals(7337.5); await contains('Fixture Cotton Scarf'); await noText('Bag & scarf');
    assert.equal(await page.locator('#address').inputValue(), '');
    assert.equal(await page.getByRole('link', { name: 'Open WhatsApp if it did not open automatically' }).count(), 0);
    await switchUser(A); await totals(10562.5); await contains(products[0].name);
  });
  await check('Out-of-stock and empty carts cannot produce a WhatsApp order', async () => {
    products[0].stock = 0; await go('/checkout'); await contains('does not have enough stock'); await fill();
    assert.equal(await page.getByRole('button', { name: 'Order via WhatsApp', exact: true }).isDisabled(), true);
    await page.locator('form').evaluate(form => form.requestSubmit()); await contains('review any unavailable products');
    assert.equal((await opens()).length, 0);
    seedCart(A, []); await go('/checkout'); await contains('Your Cart is Empty'); assert.equal(new URL(page.url()).pathname, '/cart');
    assert.equal((await opens()).length, 0);
  });
  await check('Legacy initialize/verify/refund and direct order creation reject without network calls', async () => {
    const start = requests.length;
    const result = await page.evaluate(async () => {
      const { paymentService } = await import('/src/services/paymentService.ts'); const { orderService } = await import('/src/services/orderService.ts');
      const actions = [() => paymentService.initializePayment('fixture'), () => paymentService.verifyPayment({ status: 'successful' }), () => paymentService.refundPayment('fixture'), () => orderService.createOrder({ street: 'fixture' })];
      return Promise.all(actions.map(async action => { try { await action(); return 'unexpected-success'; } catch (error) { return error.code; } }));
    });
    assert.deepEqual(result, Array(4).fill('PAYMENTS_UNAVAILABLE')); assert.deepEqual(requests.slice(start), []);
  });
  await check('No Flutterwave calls, WhatsApp navigation, order/payment writes or uncaught runtime errors', async () => {
    assert.equal(await page.evaluate(() => window.fixturePaymentCalls), 0);
    assert.deepEqual(providerRequests, []); assert.deepEqual(runtimeErrors, []); assert.deepEqual(unexpectedWrites, []); assert.deepEqual(consoleErrors, []);
    assert.ok(!requests.some(r => /transactions|payments|orders|functions/.test(r.path)));
  });
} catch (error) { failure = error; console.error(error); await page.screenshot({ path: `${output}/failure.png`, fullPage: true }); }
finally { await writeFile(`${output}/results.json`, JSON.stringify({ passed, failure: failure?.message, runtimeErrors, consoleErrors, unexpectedWrites, providerRequests, requests }, null, 2)); await browser.close(); }
if (failure) process.exitCode = 1;
