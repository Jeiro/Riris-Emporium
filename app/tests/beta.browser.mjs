import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5186';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
const output = process.env.TEST_OUTPUT || '/tmp/riris-beta-browser';
const passed = [], errors = [], unexpected = [], mutations = [];
const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', productId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const user = { id, email: 'admin@example.invalid', role: 'authenticated', aud: 'authenticated', user_metadata: {}, app_metadata: {} };
const exp = Math.floor(Date.now() / 1000) + 3600;
const access_token = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, role: 'authenticated', exp })).toString('base64url')}.synthetic`;
const environment = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
const host = new URL(environment.match(/^VITE_SUPABASE_URL=(.+)$/m)[1].trim()).hostname;
await ctx.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key: `sb-${host.split('.')[0]}-auth-token`, session: { access_token, refresh_token: 'synthetic', expires_at: exp, user } });
const rows = [{ id: productId, name: 'Synthetic Bag', description: 'Synthetic catalog', price: 2500, category: 'bags', stock: 8, featured: true, image: 'https://assets.invalid/bag.png', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }];
let releaseOld, oldStarted, oldFinished;
let oldStart = new Promise(resolve => { oldStarted = resolve; });
let oldDone = new Promise(resolve => { oldFinished = resolve; });
await ctx.route('**/*', async route => {
  const request = route.request(), url = new URL(request.url()), q = url.searchParams, method = request.method();
  if (url.origin === origin) return route.continue();
  const reply = (value, status = 200, count) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value), headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': 'content-range', ...(count === undefined ? {} : { 'content-range': `0-${Math.max(count - 1, 0)}/${count}` }) } });
  if (method === 'OPTIONS') return reply({});
  if (url.pathname === '/auth/v1/user') return reply(user);
  if (url.pathname === '/rest/v1/users') return reply({ id, name: 'Synthetic', last_name: 'Admin', email: user.email, role: 'admin' });
  if (url.pathname === '/rest/v1/carts') return reply(null);
  if (url.pathname === '/rest/v1/products') {
    if (method === 'POST') { const data = request.postDataJSON(); mutations.push({ method, table: 'products' }); const row = { ...data, id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' }; rows.push(row); return reply(row); }
    if (method === 'PATCH') { const row = rows.find(row => `eq.${row.id}` === q.get('id')); assert.ok(row); Object.assign(row, request.postDataJSON()); mutations.push({ method, table: 'products' }); return reply(row); }
    const match = q.get('or')?.match(/name\.ilike\.("(?:\\.|[^"\\])*")/);
    const search = match ? JSON.parse(match[1]).slice(1, -1) : '';
    if (search === 'offline') return reply({ message: 'Synthetic offline' }, 503);
    if (search === 'Old') { oldStarted(); await new Promise(resolve => { releaseOld = resolve; }); await reply([{ ...rows[0], name: 'Obsolete result' }], 200, 1); oldFinished(); return; }
    let result = rows.filter(row => (!q.has('id') || q.get('id') === `eq.${row.id}`)
      && (!q.has('category') || q.get('category') === `eq.${row.category}`)
      && (!q.has('featured') || row.featured)
      && (!q.has('stock') || row.stock > 0)
      && (!search || row.name.toLowerCase().includes(search.toLowerCase())));
    for (const bound of q.getAll('price')) { const [op, value] = bound.split('.'); result = result.filter(row => op === 'gte' ? row.price >= +value : row.price <= +value); }
    const [column, order] = (q.get('order') || 'created_at.desc').split(',')[0].split('.');
    result.sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (order === 'desc' ? -1 : 1));
    if (q.get('select') === 'category') return reply(result.map(row => ({ category: row.category })));
    if (request.headers().accept?.includes('object+json')) return reply(result[0] ?? null);
    const count = result.length;
    return reply(result.slice(+(q.get('offset') || 0), +(q.get('offset') || 0) + +(q.get('limit') || 100)), 200, count);
  }
  if (url.pathname.startsWith('/storage/v1/object/product-images/') && method === 'POST') { mutations.push({ method, table: 'synthetic-storage' }); return reply({ Key: 'synthetic-image' }); }
  if (!['GET', 'HEAD'].includes(method)) { unexpected.push(`${method} ${url.pathname}`); return route.abort(); }
  if (request.resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP0cAAAAASUVORK5CYII=', 'base64') });
  return route.fulfill({ status: 200, body: '' });
});
const page = await ctx.newPage(); page.on('pageerror', error => errors.push(error.message));
async function check(name, fn) { await fn(); passed.push(name); console.log('PASS', name); }
const field = label => page.locator('label').filter({ hasText: label }).locator('..').locator('input');
let failure;
try {
  await check('admin creates product with image/stock and storefront shows persisted synthetic record', async () => {
    await page.goto(origin + '/admin/products/add');
    await page.getByPlaceholder('E.g. Vintage Leather Messenger Bag').fill('New Synthetic Item');
    await page.getByPlaceholder('Tell the story behind this piece...').fill('Synthetic only');
    await page.getByPlaceholder('50,000').fill('3500');
    await page.getByPlaceholder('Accessories').fill('bags');
    await field('Quantity').fill('6');
    await page.locator('input[type=file]').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP0cAAAAASUVORK5CYII=', 'base64') });
    await page.locator('img[alt="Product"]').waitFor();
    await page.getByRole('button', { name: 'Publish Product' }).click();
    await page.waitForURL('**/admin/products');
    assert.equal(rows[1].stock, 6); assert.equal(rows[1].price, 3500); assert.ok(rows[1].image);
    await page.goto(origin + '/shop'); await page.getByRole('heading', { name: 'New Synthetic Item' }).waitFor();
  });
  await check('admin edits price and inventory; catalog and details reflect saved values', async () => {
    await page.goto(origin + `/admin/products/edit/${rows[1].id}`);
    await field('Product Name').fill('New Edited Item');
    await field('Retail Price (₦)').fill('4500');
    await field('In Stock').fill('4');
    await page.getByRole('button', { name: 'Update Record' }).click();
    await page.waitForURL('**/admin/products');
    assert.equal(rows[1].price, 4500); assert.equal(rows[1].stock, 4);
    await page.goto(origin + `/product/${rows[1].id}`); await page.getByRole('heading', { name: 'New Edited Item' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Sharing unavailable', exact: true }).isDisabled(), true);
  });
  await check('search, sorting, filtered counts and failed catalog reads render honestly', async () => {
    await page.goto(origin + '/shop?search=New&sort=-price');
    await page.getByRole('heading', { name: 'New Edited Item' }).waitFor();
    await page.getByText('Showing 1 of 1', { exact: true }).waitFor();
    await page.goto(origin + '/shop?featured=true&inStock=true');
    await page.getByRole('heading', { name: 'Synthetic Bag' }).waitFor();
    await page.getByText('Showing 1 of 1', { exact: true }).waitFor();
    await page.goto(origin + '/shop?maxPrice=0'); await page.getByText('No products found matching your criteria', { exact: true }).waitFor();
    await page.goto(origin + '/shop?search=offline'); await page.getByText('Products are temporarily unavailable.', { exact: false }).waitFor();
    assert.equal(await page.getByText('No products found matching your criteria', { exact: true }).count(), 0);
  });
  await check('obsolete search response cannot overwrite the newest query', async () => {
    await page.goto(origin + '/shop'); await page.getByRole('heading', { name: 'Synthetic Bag' }).waitFor();
    await page.getByPlaceholder('Search products...').fill('Old'); await oldStart;
    await page.getByPlaceholder('Search products...').fill('New');
    await page.getByRole('heading', { name: 'New Edited Item' }).waitFor();
    releaseOld(); await oldDone;
    await page.waitForTimeout(200);
    assert.equal(await page.getByRole('heading', { name: 'Obsolete result' }).count(), 0);
    assert.equal(await page.getByRole('heading', { name: 'New Edited Item' }).count(), 1);
  });
  await check('unfinished settings, addresses and newsletter cannot report a save', async () => {
    await page.goto(origin + '/admin/settings');
    assert.equal(await page.getByRole('button', { name: 'Settings Unavailable' }).isDisabled(), true);
    assert.equal(await page.locator('a[href="/admin/analytics"]').count(), 0);
    await page.goto(origin + '/profile'); assert.equal(await page.getByRole('button', { name: 'Add Address' }).isDisabled(), true);
    await page.getByText('Saved addresses are unavailable.', { exact: false }).waitFor();
    assert.equal(await page.locator('a[href="/change-password"]').count(), 0);
    await page.goto(origin + '/'); assert.equal(await page.getByRole('button', { name: 'Subscribe', exact: true }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: 'Newsletter subscriptions unavailable' }).isDisabled(), true);
  });
  await check('SPA deep links survive local refresh and customer pages fit mobile viewport', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [path, heading] of [['/shop', 'The Store'], [`/product/${productId}`, 'Synthetic Bag'], ['/profile', 'My Profile']]) {
      await page.goto(origin + path); await page.getByRole('heading', { name: heading, exact: true }).waitFor();
      await page.reload(); await page.getByRole('heading', { name: heading, exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} overflows`);
    }
    await mkdir(output, { recursive: true }); await page.screenshot({ path: `${output}/profile-mobile.png`, fullPage: true });
  });
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, []);
  assert.deepEqual(mutations.map(item => item.table), ['synthetic-storage', 'products', 'products']);
} catch (error) { failure = error.stack; throw error; }
finally { await mkdir(output, { recursive: true }); await writeFile(`${output}/results.json`, JSON.stringify({ passed, errors, unexpected, mutations, failure }, null, 2)); await browser.close(); }
