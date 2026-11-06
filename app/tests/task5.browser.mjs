import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:5185';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
const output = process.env.TEST_OUTPUT || '/tmp/riris-task5-browser';
const passed = [], errors = [], external = [];
const context = await browser.newContext({ serviceWorkers: 'block' });
await context.route('**/*', route => {
  if (new URL(route.request().url()).origin === origin) return route.continue();
  external.push(route.request().url()); return route.abort();
});
const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
const preview = '/tests/fixtures/task5-preview.html';
async function check(name, fn) { await fn(); passed.push(name); console.log('PASS', name); }
let failure;
try {
  await check('Clerk missing-config screen and review gate prevent initialization', async () => {
    await page.goto(origin + preview);
    await page.getByText(/Set VITE_CLERK_PUBLISHABLE_KEY/).waitFor();
    assert.equal(await page.getByText('Initialization allowed', { exact: true }).count(), 0);
    await page.goto(origin + preview + '?configured');
    await page.getByRole('heading', { name: 'Clerk setup requires review' }).waitFor();
    assert.equal(await page.getByText('Initialization allowed', { exact: true }).count(), 0);
    await page.goto(origin + preview + '?production');
    await page.getByRole('heading', { name: 'Store temporarily unavailable' }).waitFor();
    assert.ok(!(await page.locator('body').innerText()).includes('VITE_'));
  });
  await check('loading waits, guest redirect preserves destination, login allows protected page', async () => {
    await page.getByRole('button', { name: 'Protected', exact: true }).click();
    await page.getByRole('status').waitFor();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.getByTestId('login-destination').waitFor();
    assert.deepEqual(JSON.parse(await page.getByTestId('login-destination').innerText()), { pathname: '/protected', search: '?source=test', hash: '#summary' });
    await page.getByRole('button', { name: 'Sign in A', exact: true }).click();
    await page.getByRole('button', { name: 'Protected', exact: true }).click();
    await page.getByTestId('identity').filter({ hasText: 'user_A' }).waitFor();
  });
  await check('Clerk account changes isolate local wishlist IDs and logout hides account data', async () => {
    await page.getByRole('button', { name: 'Save product', exact: true }).click();
    assert.equal(await page.getByTestId('saved').innerText(), 'synthetic-product');
    await page.getByRole('button', { name: 'Sign in B', exact: true }).click();
    assert.equal(await page.getByTestId('saved').innerText(), 'Empty wishlist');
    await page.getByRole('button', { name: 'Sign in A', exact: true }).click();
    assert.equal(await page.getByTestId('saved').innerText(), 'synthetic-product');
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.getByTestId('login-destination').waitFor(); assert.equal(await page.getByTestId('identity').count(), 0);
  });
  await check('admin gate denies missing/foreign/obsolete authority results', async () => {
    await page.getByRole('button', { name: 'Sign in A', exact: true }).click();
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await page.getByText('Admin access required.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Synthetic admin result A', exact: true }).click();
    await page.getByText('Admin fixture allowed', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Sign in B', exact: true }).click();
    await page.getByText('Admin access required.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Sign in A', exact: true }).click();
    await page.getByText('Admin access required.', { exact: true }).waitFor();
    assert.deepEqual(external, []);
  });

  // Existing active admin page, synthetic Supabase Auth only. All API requests
  // intercepted; the new Clerk provider is deliberately NOT active in this app.
  await check('active admin order page reports denied writes and retains recorded status', async () => {
    const ctx = await browser.newContext({ serviceWorkers: 'block' });
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const orderId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const user = { id, email: 'admin@example.invalid', role: 'authenticated', aud: 'authenticated', user_metadata: {}, app_metadata: {} };
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const access_token = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, role: 'authenticated', exp })).toString('base64url')}.synthetic`;
    const environment = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
    const host = new URL(environment.match(/^VITE_SUPABASE_URL=(.+)$/m)[1].trim()).hostname;
    await ctx.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
      key: `sb-${host.split('.')[0]}-auth-token`, session: { access_token, refresh_token: 'synthetic', expires_at: exp, user },
    });
    let denied = true, writes = 0;
    await ctx.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      const reply = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value), headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      if (request.method() === 'OPTIONS') return reply({});
      if (url.pathname === '/auth/v1/user') return reply(user);
      if (url.pathname === '/rest/v1/users') return reply({ id, name: 'Synthetic', last_name: 'Admin', email: user.email, role: 'admin' });
      if (url.pathname === '/rest/v1/orders') {
        const row = { id: orderId, order_number: 'SYNTHETIC-001', user_id: id, status: 'pending', total: 2500, created_at: '2026-01-01T00:00:00Z', items: [] };
        if (request.method() === 'PATCH') { writes++; return denied ? reply({ code: '42501', message: 'Synthetic denied write' }, 403) : reply({ ...row, status: 'shipped' }); }
        return reply([row]);
      }
      if (request.method() !== 'GET') throw new Error(`Unexpected mutation ${url.pathname}`);
      return route.fulfill({ status: 200, body: '' });
    });
    const admin = await ctx.newPage(); admin.on('pageerror', error => errors.push(error.message));
    await admin.goto(origin + '/admin/orders');
    await admin.getByText('SYNTHETIC-001', { exact: false }).waitFor();
    await admin.locator('tbody select').selectOption('shipped');
    await admin.getByText('Could not confirm the order status update.', { exact: false }).waitFor();
    // Existing error rendering may replace the table; reload proves the denied
    // response did not persist a synthetic success.
    await admin.reload(); await admin.locator('tbody select').waitFor();
    assert.equal(await admin.locator('tbody select').inputValue(), 'pending');
    denied = false; await admin.locator('tbody select').selectOption('shipped');
    await admin.waitForFunction(() => document.querySelector('tbody select')?.value === 'shipped');
    assert.equal(writes, 2); await ctx.close();
  });
  assert.deepEqual(errors, []);
} catch (error) { failure = error.stack; throw error; }
finally {
  await mkdir(output, { recursive: true });
  await writeFile(`${output}/results.json`, JSON.stringify({ passed, errors, external, failure }, null, 2));
  await browser.close();
}
