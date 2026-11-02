// Run against local Vite only. Every non-local request is fulfilled with fixtures.
// No live API calls, customer data, email delivery, order writes or payments.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const driver = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(driver ? pathToFileURL(driver).href : 'playwright-core');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5173';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Only local servers are allowed');
const output = process.env.TEST_OUTPUT || '/tmp/riris-task2-browser';
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
page.on('console', m => { if (m.type() === 'error') consoleErrors.push({ text: m.text(), url: page.url(), expectedFailure: authFails || cartFails || productMode !== 'ok' || orderMode !== 'ok' }); });
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
      if (method === 'GET' || method === 'HEAD') rows = carts.has(eq('user_id')) ? [carts.get(eq('user_id'))] : [];
      else {
        if (cartFails) return reply({ message: 'Fixture cart write failed' }, 503);
        const payload = request.postDataJSON();
        if (method === 'POST') {
          assert.equal(payload.user_id, userId);
          const cart = { ...payload, id: `cart-${userId}` }; carts.set(userId, cart); rows = [cart];
        } else if (method === 'PATCH') {
          const cart = [...carts.values()].find(c => c.id === eq('id'));
          assert.ok(cart); assert.equal(cart.user_id, userId);
          Object.assign(cart, payload); rows = [cart];
        } else unexpectedWrites.push({ table, method });
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
let failure;
try {
  await check('Catalog heart saves actual product; survives reload', async () => {
    await go('/shop'); await contains(products[0].name);
    await page.getByRole('button', { name: 'Add to wishlist', exact: true }).first().click();
    await contains('Saved to your wishlist on this device');
    await go('/wishlist'); await contains(products[0].name);
    await page.reload(); await contains(products[0].name);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), `riris:wishlist:v1:${A}`), [P]);
  });
  await check('Wishlist uses real cart service/store; cart page displays persisted item', async () => {
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    await contains(`${products[0].name} added to cart`);
    assert.equal(carts.get(A).items[0].productId, P);
    await go('/cart'); await contains('Shopping Cart'); await contains(products[0].name);
    assert.ok(requests.some(r => r.path === '/rest/v1/carts' && ['POST', 'PATCH'].includes(r.method)));
  });
  await check('Cart failure does not display success', async () => {
    await go('/wishlist'); await contains(products[0].name); cartFails = true;
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    await contains('Could not save your cart');
    await noText(`${products[0].name} added to cart`); cartFails = false;
  });
  await check('Same-page account switch hides A wishlist; B empty; A restored', async () => {
    await switchUser(B); await contains('Your Wishlist is Empty'); await noText(products[0].name);
    await switchUser(A); await contains(products[0].name);
    await page.getByRole('button', { name: `Remove ${products[0].name} from wishlist`, exact: true }).click();
    await contains('Your Wishlist is Empty');
  });
  await check('Product detail heart shares wishlist persistence', async () => {
    await go(`/product/${P}`); await contains(products[0].name);
    await page.getByRole('button', { name: 'Add to wishlist', exact: true }).click();
    await contains('Saved to your wishlist on this device');
    await go('/wishlist'); await contains(products[0].name);
  });
  await check('Catalog error/retry and removed product state', async () => {
    productMode = 'error'; await page.reload(); await contains('Could not load saved products');
    productMode = 'ok'; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await contains(products[0].name);
    productMode = 'missing'; await page.reload(); await contains('A saved product is no longer available');
    await page.getByRole('button', { name: 'Remove unavailable item' }).click(); await contains('Your Wishlist is Empty'); productMode = 'ok';
  });
  await check('Storage failure is honest; corrupt storage offers recovery', async () => {
    await go(`/product/${P}`); await contains(products[0].name);
    await page.evaluate(() => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key.startsWith('riris:wishlist:')) throw new Error('Fixture quota'); return original.call(this, key, value); }; });
    await page.getByRole('button', { name: 'Add to wishlist', exact: true }).click(); await contains('Could not save your wishlist');
    await noText('Saved to your wishlist on this device');
    await page.reload(); await contains(products[0].name);
    await page.evaluate(key => localStorage.setItem(key, '{broken'), `riris:wishlist:v1:${A}`);
    await go('/wishlist'); await contains('Unable to read your saved wishlist');
    await page.getByRole('button', { name: 'Clear saved wishlist' }).click(); await contains('Your Wishlist is Empty');
  });
  await check('Owned order loads recorded details; owner predicate; invoice disabled', async () => {
    await go(`/orders/${O}`); await contains('Order FIXTURE-ORDER-001');
    await contains('Fixture street'); await contains('8,250'); await contains('Not recorded');
    assert.equal(await page.getByRole('button', { name: 'Invoice', exact: true }).isDisabled(), true);
    assert.ok(requests.some(r => r.path === '/rest/v1/orders' && new URLSearchParams(r.query).get('id') === `eq.${O}` && new URLSearchParams(r.query).get('user_id') === `eq.${A}`));
    await contains('Order status alone is not proof of payment');
  });
  await check('Invalid IDs, missing orders, permission and network errors show no fabricated order', async () => {
    const count = requests.filter(r => r.path === '/rest/v1/orders').length;
    await go('/orders/invalid'); await contains('This order link is invalid');
    assert.equal(requests.filter(r => r.path === '/rest/v1/orders').length, count);
    for (const [mode, text] of [['missing', 'Order Not Found'], ['permission', 'You do not have permission'], ['error', 'Could not load this order']]) {
      orderMode = mode; await go(`/orders/${O}`); await contains(text); await noText('FIXTURE-ORDER-001');
    }
    orderMode = 'ok'; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await contains('Order FIXTURE-ORDER-001');
  });
  await check('Unknown status and missing date render safely', async () => {
    orderMode = 'unknown'; await page.reload(); await contains('Status reported by the store'); await contains('Order date not recorded'); orderMode = 'ok';
  });
  await check('Foreign-owner response rejected even if API ignores user filter', async () => {
    orderMode = 'foreign'; await switchUser(B); await contains('Order Not Found'); await noText('FIXTURE-ORDER-001');
    orderMode = 'ok'; await switchUser(A); await contains('Order FIXTURE-ORDER-001');
  });
  await check('Account switch during pending order fetch never reveals A order to B', async () => {
    orderDelay = 800; await go(`/orders/${O}`);
    await switchUser(B); await contains('Order Not Found'); await noText('FIXTURE-ORDER-001');
    orderDelay = 0; await switchUser(A); await contains('Order FIXTURE-ORDER-001');
  });
  await check('Contact validates input and prepares encoded draft without sending', async () => {
    await go('/contact'); await contains('How Can We Help?');
    await page.getByRole('button', { name: 'Prepare Email', exact: true }).click();
    assert.equal(await page.getByRole('link', { name: 'Open email app' }).count(), 0);
    await page.getByLabel('Your Name', { exact: true }).fill(' ');
    await page.getByLabel('Email Address', { exact: true }).fill('fixture@example.test');
    await page.getByLabel('Subject', { exact: true }).selectOption('general');
    await page.getByLabel('Message', { exact: true }).fill('A & B?\ncc=someone@example.test');
    await page.getByRole('button', { name: 'Prepare Email', exact: true }).click(); await contains('Please complete your name');
    await page.getByLabel('Your Name', { exact: true }).fill('Fixture Customer');
    await page.getByRole('button', { name: 'Prepare Email', exact: true }).click(); await contains('Nothing has been sent');
    const href = new URL(await page.getByRole('link', { name: 'Open email app' }).getAttribute('href'));
    assert.equal(href.pathname, 'Ririsemporium@gmail.com'); assert.equal(href.searchParams.get('cc'), null);
    assert.match(href.searchParams.get('body'), /A & B/); await noText('Message sent successfully');
    await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Fixture denied'); } }); });
    await page.getByRole('button', { name: 'Copy draft', exact: true }).click(); await contains('Could not copy the draft');
    await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async text => { window.fixtureCopied = text; } }); });
    await page.getByRole('button', { name: 'Copy draft', exact: true }).click(); await contains('Draft copied');
    assert.match(await page.evaluate(() => window.fixtureCopied), /Fixture Customer/);
  });
  await check('Every configured route renders; desktop navbar/footer destinations resolve', async () => {
    await switchUser(A, 'admin');
    const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
    const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*');
    const valid = path => routes.some(r => new RegExp('^' + r.replace(':id', '[^/]+') + '$').test(path));
    for (const path of routes) {
      await go(path.replace(':id', path.startsWith('/orders/') ? O : P));
      await page.locator('h1, h2').first().waitFor();
      await noText('Page Not Found');
      assert.equal(new URL(page.url()).pathname, path.replace(':id', path.startsWith('/orders/') ? O : P), `Unexpected redirect from ${path}`);
      const links = await page.locator('header a[href], footer a[href]').evaluateAll(els => els.map(e => e.getAttribute('href')));
      for (const href of links.filter(h => h?.startsWith('/') && !h.startsWith('//'))) assert.ok(valid(new URL(href, origin).pathname), `Broken navbar/footer route ${href}`);
    }
    console.log(`Verified ${routes.length} configured routes (including direct checkout)`);
  });
  await check('Careers and Press use normal 404; no remaining navigation links', async () => {
    for (const path of ['/careers', '/press']) { await go(path); await contains('Page Not Found'); assert.equal(await page.locator('a[href="/careers"], a[href="/press"]').count(), 0); }
  });
  await check('Size Guide and Cookie Policy mobile render, no horizontal overflow; wishlist mobile navigation', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/size-guide', '/cookies']) {
      await go(path); await page.locator('h1').waitFor(); await noText('Page Not Found');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Overflow on ${path}`);
      if (path === '/size-guide') {
        for (const tab of ["Men's Clothing", 'Shoes', "Women's Clothing"]) {
          await page.getByRole('button', { name: tab, exact: true }).click();
          assert.ok(await page.locator('table tbody tr').count() > 0);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
        }
      }
      await page.screenshot({ path: `${output}/${path.slice(1)}-mobile.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click();
    await page.getByRole('link', { name: 'My Wishlist', exact: true }).click();
    await contains('Your Wishlist is Empty');
  });
  await check('Auth verification failures and logout hide account data', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    authFails = true; await go('/wishlist'); await contains('Could not verify your account');
    authFails = false; await page.getByRole('button', { name: 'Retry', exact: true }).click(); await contains('Your Wishlist is Empty');
    await go(`/orders/${O}`); await contains('Order FIXTURE-ORDER-001');
    await page.evaluate(async () => { const { supabase } = await import('/src/lib/supabase.ts'); await supabase.auth.signOut(); });
    await contains('Welcome back'); await noText('FIXTURE-ORDER-001');
    await go('/shop');
    await switchUser(A);
  });
  await check('Out-of-stock wishlist item cannot be added to cart', async () => {
    products[0].stock = 0;
    await page.evaluate(({ key, id }) => localStorage.setItem(key, JSON.stringify([id])), { key: `riris:wishlist:v1:${A}`, id: P });
    await go('/wishlist'); await contains(products[0].name);
    assert.equal(await page.getByRole('button', { name: 'Out of stock', exact: true }).isDisabled(), true);
    products[0].stock = 8;
  });
  assert.deepEqual(unexpectedWrites, []);
  assert.deepEqual(runtimeErrors, []);
  passed.push('No runtime exceptions; no unexpected remote mutations; all external requests mocked');
} catch (error) {
  failure = error;
  console.error(error);
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {});
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify({ passed, failure: failure?.message, runtimeErrors, consoleErrors, unexpectedWrites, requests }, null, 2));
  await browser.close();
}
if (failure) process.exitCode = 1;
