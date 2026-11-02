# Task 3 — shopping cart and checkout reliability

Repository: `/mnt/fedora-storage/Riris-Emporium`
Branch: `store-improvements`
Date: 2 November 2026

## Continuation and scope

Inspected Git status/diff and read `docs/TASK2-REPORT.md` before editing. Task 2 is preserved at checkpoint `de46a49` (`feat: clean up store pages and repair wishlist contact and orders`). At continuation the repository was clean, while partial Task 3 source existed in `/home/dragneel/Documents/riris-task3-work`. That work was reviewed and continued. Changes were applied with original-file hash checks so concurrent edits would not be overwritten.

Task 3 remains uncommitted for local review. Task 2's report, Size Guide and Cookie Policy are unchanged. No dependencies or lockfile were changed. No production API requests, database changes, payment actions, push or deployment were performed. Existing visual layout and styling are retained, with necessary loading/error/stock notices and accessible cart button labels.

## Root causes and fixes

| Area | Root cause | Implemented behavior |
| --- | --- | --- |
| Totals | Item mutations persisted item arrays without consistently recomputing totals. Cart consumed stale fields, Drawer calculated its own amounts, and Checkout sometimes treated the stored total as subtotal and added tax/shipping again. | One calculation utility normalizes current catalog prices and computes all estimates. Cart, Drawer and Checkout consume the same resolved cart. Mutations persist an updated display total and refresh the result. |
| Duplicated/stale items | Stored product snapshots could contain duplicate lines and obsolete prices. | Product/variant identity merges quantities; current catalog supplies price/name/image. Removed products are excluded with a notice. Catalog failures block checkout rather than fall back to stale prices. |
| Empty versus failure | Read errors were converted into a default empty cart. | Explicit loading, ready, guest and error states. Failed reads/writes produce retryable errors. Only a successful empty response is an empty cart. A failed write requires a fresh read because the server may already have accepted it. |
| Account isolation | Global cart state outlived Auth transitions, and old async results could publish after another account signed in. | Shared verified identity clears the cart and count synchronously on session changes/logout. Each request captures an account generation; old reads, mutation results and queued operations cannot populate a newer account's state. Queries and responses are owner-checked. Returning users reload their stored carts. |
| Concurrent mutations | Overlapping operations could overwrite each other's snapshots. | Mutations serialize within the current account; older reads cannot overwrite mutation results. Updates include the previously read `updated_at` value and owner predicate. A conflict requires reload instead of silently overwriting the newer row. |
| Checkout navigation | An initial empty item array was treated as a resolved empty cart. Login also discarded the destination. | Checkout waits for verified identity and successful cart hydration. Only a resolved empty cart redirects to Cart; failures show retry. Protected routes retain a safe local path, query and hash through login. |
| Startup | Static App imports constructed Supabase with empty settings before React could display an error. | The entry point validates public settings before dynamically importing App. Development lists missing/invalid variable names; production shows a generic unavailable message. Direct client initialization has the same validation guard. Values are never printed in error messages. |

### Calculation contract

Amounts are display estimates, calculated in currency minor units and rounded to two decimal places. Existing Checkout assumptions are retained: **7.5% of merchandise subtotal**, **₦2,500 shipping**, and **free shipping strictly above ₦10,000**. An empty cart has zero subtotal, tax, shipping, discount and total. Existing flat coupon discounts are clamped to merchandise subtotal and included once; tax/shipping thresholds still use the pre-discount subtotal.

Example: two ₦2,500 products plus one ₦1,500 product give subtotal ₦6,500, tax ₦487.50, shipping ₦2,500 and total **₦9,487.50** in all three views, even if the saved row says total zero.

Quantities must be whole numbers from 1 to 9,999; invalid prices/amounts fail explicitly. Insufficient known stock blocks checkout. Unverified variant pricing fails with a support message rather than guessing a base price. Reads do not create cart rows or repair production records. Missing products are removed from the estimate; a later user-initiated mutation persists the normalized items.

These assumptions are not verified business tax/shipping policy. Browser amounts, inventory checks, coupon checks and saved cart totals are not payment authority. The Flutterwave callback and order-creation flow were not rewritten or exercised.

## Changed files

All paths below are relative to the repository.

| Files | Purpose |
| --- | --- |
| `app/src/lib/cartCalculations.ts` (new) | Validated quantities/prices, duplicate normalization, current catalog pricing, common estimates and cart mapping. |
| `app/src/services/cartService.ts` | Owner-scoped reads/mutations, error propagation, repricing, populated initial cart insert, updated totals, optimistic concurrent-edit checks. |
| `app/src/store/cartStore.ts` | Account generations, stale-result rejection, mutation queue, deduplicated reads and explicit cart status. |
| `app/src/hooks/useCart.ts` | Shared resolved totals, account-safe selectors, initial hydration and retry. |
| `app/src/lib/verifiedSession.ts` (new), `app/src/hooks/useVerifiedUser.ts` | Shared verified Auth identity and obsolete-verification rejection; preserves Task 2 hook consumers. |
| `app/src/store/authStore.ts`, `app/src/hooks/useAuth.ts` | Clear persisted UI identity on Auth transitions; guard delayed profile fetches; immediate local logout clearing. |
| `app/src/pages/Cart.tsx`, `app/src/components/cart/CartDrawer.tsx`, `app/src/pages/Checkout.tsx` | Consume shared totals and loading/error/empty/stock states; defer Checkout redirect; preserve layout. |
| `app/src/App.tsx`, `app/src/pages/Login.tsx`, `app/src/lib/loginDestination.ts` (new) | Verified route loading/error handling and safe return destination after login. |
| `app/src/main.tsx`, `app/src/lib/supabase.ts`, `app/src/lib/publicConfig.ts` (new) | Validate before App/client initialization; development and production unavailable screens. |
| `app/tests/task3.test.mjs` (new) | Eleven focused unit tests. |
| `app/tests/task3.browser.mjs` (new) | Thirteen synthetic cart/checkout browser check groups. |
| `app/tests/task3-config.browser.mjs` (new) | Five isolated configuration browser checks, including a production build. |
| `app/tests/task2.browser.mjs` | Adapt fixtures to populated cart creation, Auth-driven switching and direct Checkout behavior; retain Task 2 coverage. |
| `app/tests/README.md`, `app/package.json` | Reproduction instructions and two browser test commands; no dependencies changed. |
| `docs/TASK3-REPORT.md` (new) | This report. |

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed TypeScript and Vite production build. Existing stale Browserslist database warning remains; no dependency update. |
| `npm test` | **17 passed**: six Task 2 tests plus eleven Task 3 tests. |
| `npm run lint` | **74 errors, 4 warnings** remain, compared with **85 errors, 7 warnings** at Task 2. Compared issue counts by file/rule/severity/message: **zero new findings**. Existing lint problems were not mass-cleaned. |
| `git diff --check` | Passed. |
| Cart browser suite | **13 groups passed**, zero uncaught runtime errors, zero unexpected mutation attempts. Three console errors were expected injected HTTP 503 failures. |
| Existing Task 2 browser suite | **19 groups passed**, all **27 configured routes** checked, zero runtime errors or unexpected mutation attempts. Eleven console errors were attributable to deliberate failure fixtures. Wishlist/contact/order details and removed-page 404 behavior passed. |
| Configuration browser suite | **5 checks passed**: missing URL/key, missing key only, malformed URL, privileged key rejection, generic production error screen. No App/Supabase initialization when configuration is invalid and no configuration-value disclosure in screen messages. |

Browser tests use fresh Chrome contexts, synthetic accounts A/B, products and cart rows. Every external request is intercepted and fulfilled locally. The application's service/store code executes, but writes modify only the test harness's in-memory map. No real Auth sessions, customer records, payment callbacks or order writes were used. Task 2 mobile checks remain 390×844; functional desktop checks use 1440×1000. This is functional regression evidence, not a live asset/design comparison.

Race checks cover delayed A reads after switching to B, a delayed A mutation response and cancelled queued A mutation, returning to A, rejected foreign-owner payloads, and immediate cart clearing on logout. A synthetic login preserves `/checkout?source=cart#summary`. Empty-checkout navigation waits for the delayed successful cart read before redirecting.

During testing, the account-switch fixture was corrected to change Auth through its SDK rather than assigning the UI store directly. Vite was restarted after source changes to avoid duplicate test-imported modules caused by hot-reload URLs. The configuration driver explicitly selects production mode after its development cases; the initial same-process build had inherited development mode. Final complete runs passed after these test-harness corrections.

Evidence is saved at:

- `/home/dragneel/Documents/riris-task3-work/browser-results/results.json`
- `/home/dragneel/Documents/riris-task3-work/task2-regression/results.json`
- `/home/dragneel/Documents/riris-task3-work/config-results/results.json`
- `/home/dragneel/Documents/riris-task3-work/lint-before.json`
- `/home/dragneel/Documents/riris-task3-work/lint-final.json`

## Configuration and remaining limits

1. **Live payments remain blocked for release.** The existing Checkout flow still trusts a browser Flutterwave callback and creates an order without trusted server verification. Task 3 does not fix settlement, make the callback trustworthy, disable all possible real-payment paths, or validate delivery/confirmation email claims. Do not enable real customer payments until an authorized backend independently verifies transaction identity, currency, amount, ownership and idempotency. No payment was initiated during this work.
2. **Live Supabase behavior remains unverified.** No production requests were made. Confirm project ownership and use an authorized development project to test cart columns, JSON item shape, owner RLS and direct cross-account API rejection. Frontend owner checks cannot replace RLS. Concurrent initial cart creation also needs a database uniqueness constraint on `user_id`; existing uniqueness/triggers are not established. The optimistic update relies on `updated_at` changing with each edit and is not a substitute for an atomic backend cart API.
3. **In-flight writes cannot be undone by client cancellation.** An A write already submitted may finish for A after switching to B. Its response cannot restore A's data into B's UI; queued old operations are rejected. Real database acceptance and concurrent multi-client behavior need development-database testing.
4. **Pricing is refreshed, not reserved.** Catalog values are refreshed on cart reads/mutations, but stock/prices can change again. There is no inventory reservation or trusted checkout quote. Variant pricing has no verified schema and is blocked. Malformed saved cart records show errors; automatic production data repair was not performed. Coupon expiry, usage limits and server-side eligibility are not implemented here.
5. **Public frontend settings:** ignored `app/.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. `VITE_SUPABASE_ANON_KEY` is an alternative and is not needed alongside the publishable key. `VITE_FLUTTERWAVE_PUBLIC_KEY` remains absent. No configuration or key values were changed or copied into this report. Never place secret/service-role keys in any `VITE_` variable; validation is a guard against accidental use, not protection for a secret already embedded by a frontend build.
6. **Untested live workflows:** actual login/registration/recovery, failed server sign-out behavior, live cart persistence, RLS, triggers, coupon acceptance, admin writes, payments, settlement, invoices and email delivery. Synthetic SDK Auth transitions and login were tested; actual multi-tab token refresh and database authorization were not. Guest cart merging has no backend implementation; its old empty-cart stub now reloads the account cart rather than erasing a returning user's items.
7. **Existing issues remain:** lint failures, the old Browserslist database and other placeholders listed in Task 2. This work did not redesign the site, repair unrelated admin/auth flows, change RLS or add a backend.

## Run again

The development server for this task is at **http://127.0.0.1:5180/** while its process remains running.

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
npm run build
npm test
npm run lint
git diff --check
```

Stop an existing listener before starting another on that port. See `app/tests/README.md` for isolated browser commands. Normal manual browsing uses the configured Supabase project; the browser suites provide the synthetic, intercepted test environment.
