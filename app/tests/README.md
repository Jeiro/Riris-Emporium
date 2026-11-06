# Local regression checks

Run `npm test` with Node 22.23+ for the existing unit tests and Task 5 service audit checks covering contact drafts, local wishlist storage, order mapping, cart arithmetic, public configuration validation and login destinations. `npm run build` includes TypeScript checking. The repository's existing lint failures remain documented in `../../docs/TASK2-REPORT.md`.

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


## WhatsApp checkout

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run dev -- --host 127.0.0.1 --port 5181 --strictPort
# In another terminal:
PLAYWRIGHT_MODULE=/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs \
TEST_ORIGIN=http://127.0.0.1:5181 \
TEST_OUTPUT=/home/dragneel/Documents/riris-task4a-work/whatsapp-browser \
npm run test:browser:whatsapp
```

The ten check groups cover customer/delivery validation, actual cart amounts, single/multiple products, quantity changes, URL encoding, popup fallback, cart/form preservation, mobile layout, account changes, unavailable/empty carts and rejection of legacy payment/order actions. `window.open` is replaced with a recorder (normal, blocked and throwing cases). Fallback links are inspected without navigation. Every external request is intercepted. No WhatsApp message, payment or live database write is made.

Seven WhatsApp unit tests and two payment-disable unit tests supplement the original 17 tests. The Task 3 browser suite still checks cart arithmetic and account races; its checkout assertions now expect the same merchandise subtotal, while delivery/tax/discount are awaiting confirmation. Cart and drawer retain their old calculations with explicit estimate labels.

No Flutterwave key is required. Actual WhatsApp app launch and message delivery are outside automated coverage. See `../../docs/TASK4-REPORT.md` for the current scope and limitations.


## Task 5 local service audit

`npm test` includes `tests/task5-audit.test.mjs`. To see its individual checks directly:

```bash
node --experimental-strip-types tests/task5-audit.test.mjs
```

Nineteen checks execute the actual product, Auth, profile, cart, order and payment services with the Supabase module replaced by `fixtures/task5-supabase.mjs`. The fixture contains synthetic UUIDs and reserved `.invalid` domains; it imports no SDK and reads no environment files. Unexpected queries fail, and fetch is blocked. No server, Auth account creation, SQL execution, browser session or network access is needed.

Tests named **known gap** deliberately reproduce unresolved defects, including unsupported gallery/threshold persistence, confirmation-required registration and absent owner predicates. A passing characterization test confirms the finding; it does **not** mean the behavior is fixed or acceptable. Convert these into desired-behavior regression tests when implementing each approved fix. Other checks preserve the current cart and payment-disabled safeguards.

The synthetic boundary is not a Postgres/RLS emulator. It cannot establish permissions, constraints, triggers, Storage access, email delivery or live persistence. See `../../docs/TASK5-REPORT.md` and `../../docs/task5/` for proposed database inspection and policies. No SQL is run by this suite.


### Staged Clerk migration

Nine `clerk.test.mjs` checks cover configuration, session/token races, logout, current-account admin decisions, string wishlist keys and native Supabase `accessToken` requests using an injected fetch implementation. Clerk initialization and live login are deliberately inactive. The 19 service audit checks include the local product/profile/status fixes and Clerk string-owner contexts. Total individual unit checks: **54**, including the original 26.

```bash
PLAYWRIGHT_MODULE=/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs \
TEST_ORIGIN=http://127.0.0.1:5185 \
TEST_OUTPUT=/tmp/riris-task5-browser \
npm run test:browser:task5
```

The five browser groups exercise isolated Clerk setup/route components with synthetic session events, account-separated wishlist keys, denied/stale admin decisions, and the active admin order page with intercepted denial/success responses. The fixture entry `/tests/fixtures/task5-preview.html` is test-only; it is not a production build entry. It does not mount a live ClerkProvider. There is no claim of full application Clerk integration or server authorization coverage.

In this environment, Node's default isolated test reporter reports passing files rather than individual subtests. To inspect individual unit evidence without changing the package command, run each `*.test.mjs` directly with `node --experimental-strip-types` in a separate process. Do not combine the audit fixtures into a shared process: their module hooks and mocks are intentionally isolated.


## Customer beta readiness

`npm test` also includes seven `beta.test.mjs` checks for catalog query bounds/quoting,
Clerk activation review, UUID mapping and stale identity lookups, and Vercel SPA configuration.
The old catalog characterization now asserts corrected filter/count/sort behavior.

```bash
PLAYWRIGHT_MODULE=/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs \
TEST_ORIGIN=http://127.0.0.1:5186 \
TEST_OUTPUT=/tmp/riris-beta-browser \
npm run test:browser:beta
```

Six groups exercise the actual admin add/edit forms with intercepted Storage/product writes,
storefront search/counts/failures/races, disabled unfinished controls, local deep-link refresh,
and 390×844 mobile overflow. Synthetic database rows exist only in the driver process.
Clerk hosted registration/recovery and deployed Vercel rewrites are **not** verified by this suite.
Use a disposable local copy with synthetic public settings for tests; do not manually browse
an app configured for the unverified project. Preserve the five earlier browser suites.
See `../../docs/BETA-READINESS.md` for results, release gates and activation requirements.
