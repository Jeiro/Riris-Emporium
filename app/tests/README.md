# Local regression checks

Run `npm test` with Node 22.23+ for 17 tests covering contact drafts, local wishlist storage, order mapping, cart arithmetic, public configuration validation and login destinations. `npm run build` includes TypeScript checking. The repository's existing lint failures remain documented in `../../docs/TASK2-REPORT.md`.

The browser suite uses `playwright-core` and installed Google Chrome, without changing the application's dependency lockfile. In this workspace the driver is already installed separately:

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
# In a second terminal:
PLAYWRIGHT_MODULE=/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs \
TEST_OUTPUT=/home/dragneel/Documents/riris-task2-work/browser-results \
npm run test:browser
```

For a fresh machine, install `playwright-core@1.64.1` in a separate tooling directory and set `PLAYWRIGHT_MODULE` to its `index.mjs`. Set `CHROME_PATH` if Chrome is not `/usr/bin/google-chrome`. `TEST_ORIGIN` defaults to `http://127.0.0.1:5173` and only permits localhost/127.0.0.1. The app needs its usual public Supabase configuration; the harness reads only the URL from `.env.local` to determine the browser auth storage key.

Every non-local browser request is intercepted and fulfilled with synthetic data or inert assets; no real credentials, customers, orders or payments are used. A fresh browser context keeps fixtures separate from normal browsing. Cart mutations operate only on the harness's in-memory map. No order/admin mutation or payment action is invoked. External fonts/images/map/payment scripts are mocked, so their live behavior is outside this suite. Mailto links are inspected without opening or sending them.

The suite captures results, request paths (not authorization headers), console errors and mobile screenshots under `TEST_OUTPUT` (default `/tmp/riris-task2-browser`). Deliberate auth/catalog/cart/order failures produce expected console errors. Unexpected runtime exceptions or remote mutation attempts fail the suite. Direct checkout navigation now waits for cart hydration and is included in the route checks.


## Task 3 suites

Use a freshly started Vite server when running browser suites after source edits. These tests import the service/store modules to inject races; Vite hot-reload URLs can otherwise create a second module instance in the test driver.

```bash
# With Vite running (use TEST_ORIGIN to select another local port):
PLAYWRIGHT_MODULE=/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs \
TEST_ORIGIN=http://127.0.0.1:5180 \
TEST_OUTPUT=/home/dragneel/Documents/riris-task3-work/browser-results \
npm run test:browser:cart

# Starts and closes its own isolated development/production servers:
PLAYWRIGHT_MODULE=/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs \
TEST_OUTPUT=/home/dragneel/Documents/riris-task3-work/config-results \
npm run test:browser:config
```

The cart suite has 13 check groups: direct checkout hydration; matching totals in Cart/CartDrawer/Checkout; quantity/add/remove; refreshed catalog prices; read/write failures and retry; concurrent edit conflicts; delayed reads and writes across account changes; rejection of foreign-owner responses; logout/login destination; catalog failure and stock; empty cart redirect; and removed products. Synthetic writes stay in memory. This does not validate live Supabase schema, RLS, uniqueness constraints, triggers or payment settlement.

The configuration suite has five checks: missing URL/key, missing key, malformed URL, privileged key rejection, and the actual production error screen. It uses an empty temporary environment directory and explicit test settings. It never changes `.env.local`, writes its build/cache to its own temporary directory, and deletes that directory on completion. Missing configuration must stop App/Supabase initialization; production must show a generic message without configuration details. Only synthetic key strings are used.

See `../../docs/TASK3-REPORT.md` for current results and remaining limits. The browser tooling remains separate from application dependencies; no lockfile update is needed.
