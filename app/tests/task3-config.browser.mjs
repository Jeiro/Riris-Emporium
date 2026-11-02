// Isolated Vite instances use an empty env directory and explicit synthetic settings.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer, build, preview } from 'vite';
import react from '@vitejs/plugin-react';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright-core');
const root = fileURLToPath(new URL('..', import.meta.url));
const temporary = await mkdtemp(path.join(tmpdir(), 'riris-config-test-'));
const output = process.env.TEST_OUTPUT || '/tmp/riris-task3-config';
await mkdir(output, { recursive: true });
const passed = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true });
const names = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY'];
function config(values, index) {
  return { root, configFile: false, envDir: temporary, plugins: [react()], cacheDir: path.join(temporary, `cache-${index}`),
    resolve: { alias: { '@': path.join(root, 'src') } }, logLevel: 'error',
    define: Object.fromEntries(names.map(name => [`import.meta.env.${name}`, JSON.stringify(values[name] || '')])),
    server: { host: '127.0.0.1', port: 0, strictPort: true },
    build: { outDir: path.join(temporary, 'production'), emptyOutDir: true },
    preview: { host: '127.0.0.1', port: 0, strictPort: true } };
}
async function checkPage(origin, production, expected, forbidden = []) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const runtime = []; const requests = [];
  page.on('pageerror', error => runtime.push(error.message));
  await context.route('**/*', route => {
    const url = route.request().url(); requests.push(url);
    if (new URL(url).origin === origin) return route.continue();
    return route.fulfill({ status: 200, contentType: 'text/plain', body: '' });
  });
  try {
    await page.goto(origin);
    await page.getByRole('heading', { name: production ? 'Store temporarily unavailable' : 'Store configuration required', exact: true }).waitFor();
    const body = await page.locator('body').innerText();
    for (const text of expected) assert.ok(body.includes(text), `Missing setup message: ${text}`);
    for (const text of forbidden) assert.ok(!body.includes(text), 'Sensitive/config value leaked into error page');
    assert.ok(!requests.some(url => /\/src\/(App\.tsx|lib\/supabase\.ts)/.test(url)), 'App was loaded before config validation');
    assert.ok(!requests.some(url => new URL(url).hostname.endsWith('.supabase.co')), 'Unexpected Supabase request');
    assert.deepEqual(runtime, []);
    return body;
  } catch (error) {
    await writeFile(path.join(output, 'failure.json'), JSON.stringify({ body: await page.locator('body').innerText(), runtime, requests }, null, 2));
    throw error;
  } finally { await context.close(); }
}
let failure;
try {
  const cases = [
    ['missing URL and key', {}, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'], []],
    ['missing key only', { VITE_SUPABASE_URL: 'https://fixture.supabase.co' }, ['VITE_SUPABASE_ANON_KEY'], ['https://fixture.supabase.co']],
    ['malformed URL', { VITE_SUPABASE_URL: 'invalid-fixture-url', VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'sb_publishable_synthetic' }, ['valid HTTP(S)'], ['invalid-fixture-url', 'sb_publishable_synthetic']],
    ['privileged key rejected', { VITE_SUPABASE_URL: 'https://fixture.supabase.co', VITE_SUPABASE_ANON_KEY: 'sb_secret_synthetic_not_real' }, ['never a secret'], ['sb_secret_synthetic_not_real']],
  ];
  for (const [index, [name, values, expected, forbidden]] of cases.entries()) {
    const server = await createServer(config(values, index));
    try {
      await server.listen();
      const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
      await checkPage(origin, false, expected, forbidden);
      passed.push(`Development ${name}: setup screen, no App initialization, no value leak`);
      console.log('PASS', passed.at(-1));
    } finally { await server.close(); }
  }
  // Vite's development instances set NODE_ENV in this process; reset it for a real production build.
  process.env.NODE_ENV = 'production';
  const productionConfig = { ...config({}, 'production'), mode: 'production' };
  await build(productionConfig);
  const server = await preview(productionConfig);
  try {
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    await checkPage(origin, true, ['Please try again later.'], ['VITE_', '.env.local', 'Supabase']);
    passed.push('Actual production build with missing config shows generic safe error');
    console.log('PASS', passed.at(-1));
  } finally { await new Promise(resolve => server.httpServer.close(resolve)); }
} catch (error) { failure = error; console.error(error); }
finally {
  await browser.close();
  await writeFile(path.join(output, 'results.json'), JSON.stringify({ passed, failure: failure?.message }, null, 2));
  await rm(temporary, { recursive: true, force: true });
}
if (failure) process.exitCode = 1;
