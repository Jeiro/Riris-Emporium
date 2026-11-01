# Task 2 checks

Run `npm test` with Node 22.23+ for the six dependency-free tests of contact drafts, local wishlist storage and order mapping. `npm run build` includes TypeScript checking. The repository's existing lint failures remain documented in `../../docs/TASK2-REPORT.md`.

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

The suite captures results, request paths (not authorization headers), console errors and mobile screenshots under `TEST_OUTPUT` (default `/tmp/riris-task2-browser`). Deliberate auth/catalog/cart/order failures produce expected console errors. Unexpected runtime exceptions or remote mutation attempts fail the suite. Checkout is reached through a loaded cart because its existing direct-navigation redirect occurs before cart hydration.
