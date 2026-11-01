# Task 2 — cleanup and functional page repairs

Repository: `/mnt/fedora-storage/Riris-Emporium`

Branch: `store-improvements`

Date: 1 November 2026

## Working-tree recovery

At continuation, Git reported a clean working tree. The earlier Task 2 staging directory under `/tmp` no longer existed; the repository still contained both removed pages and the mock wishlist/order implementations. Those intended changes were reconstructed in a durable workspace and applied with original-file hash checks. No existing source changes were overwritten. All changes remain uncommitted for review. No push, deployment, real payment or production record mutation was performed.

## Requirements and implementation

| Phase | Result |
| --- | --- |
| A — Careers / Press | Deleted both page components, lazy imports, routes and footer links. No remaining application references. Removed URLs use the existing SPA 404 screen. This is client routing; Vite's HTML fallback itself still returns HTTP 200. |
| B — Wishlist | Catalog product IDs persist under `riris:wishlist:v1:<verified-user-id>`. Product cards and product details share the same heart control. Wishlist resolves current catalog data, supports removal/clear, handles storage/catalog/auth failures and unavailable products, and calls the real cart store/service before reporting success. Out-of-stock items cannot be added from the wishlist. |
| C — Size Guide | Page content, size specifications and styles unchanged. Added the missing footer navigation link. All three size tabs and mobile overflow checks passed. |
| D — Cookie Policy | Page content and route unchanged; route/navigation/mobile rendering checks passed. Inaccurate policy statements identified below; no tracking or consent mechanism introduced. |
| E — Contact | Uses the user-confirmed `Ririsemporium@gmail.com`. Required fields, trimming, email validation, length limits and encoded mailto body. Explicit “Nothing has been sent” draft screen; user opens their email app and sends it themselves. Copy has pending/success/error states and manual-copy fallback. No message storage, delivery claims or simulated delay. Unverified phone/address/hours/social destinations are marked unconfirmed on the contact page. Existing layout retained. |
| F — Order details | Removed mock order and invoice success toast. Loads through `orderService.getOrder`, validates UUID, verifies current Auth user, filters by both `id` and `user_id`, rechecks session and response ownership, and discards obsolete results after route/account changes. Shows recorded fields only, with missing-data labels; loading/invalid/missing/permission/failure/retry states. Invoice disabled. No claim that order status or a browser callback proves payment. |
| G — Regression checks | See verification results below. All remote requests in functional browser tests are intercepted with synthetic fixtures. |
| H — Report | This report records changed files, test evidence, unresolved backend questions and existing problems. |

Wishlist storage is local to the current browser/device and origin; it does not sync across devices. Clearing browser storage removes it. Account namespacing prevents normal UI mixing, but localStorage is not encrypted and does not protect against someone with access to the same browser profile or malicious same-origin code. Only product IDs are stored, not order/customer snapshots.

The earlier read-only public schema probe returned `PGRST205` / HTTP 404 for `wishlist`, `wishlists`, `wishlist_items`, and `contact_messages`; OpenAPI discovery was unavailable. No suitable exposed table or verified RLS was established. This does not prove no private table exists. Accordingly, this task uses local wishlist storage and an email draft instead of creating production tables or guessing a message API.

## Verification

- `npm run build`: passed (TypeScript and Vite). Existing warning: Browserslist database is old; dependencies were not upgraded.
- `npm test`: six tests passed, covering contact encoding/validation, wishlist storage keys/parsing, UUID validation and order mapping of missing/malformed data.
- `npm run lint`: **85 errors, 7 warnings**, versus **88 errors, 7 warnings** before Task 2. Compared issue messages by file/rule: **zero new lint findings**. Existing failures remain; this was not a lint cleanup.
- `git diff --check`: passed.
- Application dependencies and `package-lock.json` unchanged. Browser tooling was installed separately under `/home/dragneel/Documents/riris-browser-tools`; `playwright-core` 1.64.1 uses installed Google Chrome.
- Functional browser checks use synthetic accounts A/B, two catalog products and an order. All external requests are fulfilled locally; only requests to the localhost Vite server pass through. Cart writes are simulated in the harness while executing the application's real service/store code. This establishes frontend integration, not live database acceptance.

### Browser evidence

**19 check groups passed, covering all 27 configured routes.** No uncaught runtime exceptions or unexpected remote mutation attempts. Eleven console errors were all attributable to deliberately injected HTTP 403/503 or auth/cart failures; none occurred outside those test failure states.

Passed checks:

- Catalog heart saves actual product; survives reload.
- Wishlist uses real cart service/store; cart page displays persisted item.
- Cart failure does not display success.
- Same-page account switch hides A wishlist; B empty; A restored.
- Product detail heart shares wishlist persistence.
- Catalog error/retry and removed product state.
- Storage failure is honest; corrupt storage offers recovery.
- Owned order loads recorded details; owner predicate; invoice disabled.
- Invalid IDs, missing orders, permission and network errors show no fabricated order.
- Unknown status and missing date render safely.
- Foreign-owner response rejected even if API ignores user filter.
- Account switch during pending order fetch never reveals A order to B.
- Contact validates input and prepares encoded draft without sending.
- Every configured route renders; desktop navbar/footer destinations resolve.
- Careers and Press use normal 404; no remaining navigation links.
- Size Guide and Cookie Policy mobile render, no horizontal overflow; wishlist mobile navigation.
- Auth verification failures and logout hide account data.
- Out-of-stock wishlist item cannot be added to cart.
- No runtime exceptions; no unexpected remote mutations; all external requests mocked.

Evidence saved durably at:

- `/home/dragneel/Documents/riris-task2-work/browser-results/results.json`
- `/home/dragneel/Documents/riris-task2-work/browser-results/size-guide-mobile.png`
- `/home/dragneel/Documents/riris-task2-work/browser-results/cookies-mobile.png`
- `/home/dragneel/Documents/riris-task2-work/lint-before.json`
- `/home/dragneel/Documents/riris-task2-work/lint-final.json`

Mobile checks used 390×844; desktop checks used 1440×1000. Both policy/support screenshots were visually reviewed. Size Guide's wide table retains its existing inner horizontal scrolling. External assets were mocked, so these are functional/responsive checks rather than a live-asset visual comparison.

Earlier test attempts identified the existing direct-checkout redirect and a harness click that bypassed the button's loading guard. The harness was corrected to wait for enabled controls and navigate to Checkout through a loaded cart. The final complete run passed; no application behavior was changed to conceal either finding.


## Changed files

Paths below are relative to the repository.

Modified:

- `app/package.json` — add focused unit and browser test commands; no dependency changes.
- `app/src/App.tsx` — remove only Careers and Press imports/routes.
- `app/src/components/layout/Footer.tsx` — remove both links, add Size Guide, use confirmed contact email.
- `app/src/components/layout/Navbar.tsx` — wishlist link in account/mobile menus.
- `app/src/components/product/ProductCard.tsx` — replace ephemeral heart state with shared wishlist action.
- `app/src/pages/ProductDetail.tsx` — wire existing heart button to the same wishlist.
- `app/src/pages/Wishlist.tsx` — replace mock data/actions with per-account local persistence, catalog loading and cart integration.
- `app/src/pages/Contact.tsx` — replace false send success with validated email draft/copy workflow; label unverified contact details.
- `app/src/pages/OrderDetail.tsx` — real loading/error/owner handling and recorded-field display; disable invoice.
- `app/src/services/productService.ts` — fetch saved products by IDs.
- `app/src/services/orderService.ts` — authenticated, owner-filtered single-order lookup and response/session checks; other order methods unchanged.
- `app/src/lib/supabase.ts` — remove indefinitely cached user identity so cart calls do not reuse a previously signed-in account. Client initialization is otherwise unchanged.

Added:

- `app/src/hooks/useVerifiedUser.ts` — shared, verified identity that clears on session changes and ignores obsolete checks.
- `app/src/hooks/useWishlist.ts` — account-scoped storage subscription and authenticated updates.
- `app/src/lib/wishlistStorage.ts` — namespaced keys and validated ID parsing.
- `app/src/components/product/WishlistButton.tsx` — shared saved/pending/error action.
- `app/src/lib/contact.ts` — confirmed destination and draft validation/encoding.
- `app/src/lib/orderDetails.ts` — UUID validation, error types and defensive recorded-field mapping.
- `app/tests/task2.test.mjs` — six unit tests.
- `app/tests/task2.browser.mjs` — isolated browser regression suite.
- `app/tests/README.md` — test setup and safety boundaries.
- `docs/TASK2-REPORT.md` — this report.

Deleted:

- `app/src/pages/Careers.tsx`
- `app/src/pages/Press.tsx`

`app/src/pages/SizeGuide.tsx` and `app/src/pages/Cookies.tsx` are byte-for-byte unchanged.

## Remaining blockers and untested behavior

1. **Live RLS and project ownership remain unverified.** The configured Supabase host matches the repository's public example. That does not establish ownership or whether it is production/development. No real customer accounts or records were used. The query filter and frontend owner checks cannot replace server-enforced RLS. Before real use, verify `orders` SELECT policies and cart policies in an authorized development project, including cross-account direct API attempts. No schema/policy changes were made here.
2. **Live wishlist-to-cart persistence is not exercised.** Browser tests prove the application calls the cart service and renders its response. Whether the live table shape, policies and triggers accept those writes needs a development account/database. Wishlist persistence itself needs no backend.
3. **Existing cart/checkout issues remain.** Cart item writes do not compute totals; the Cart page can show zero totals while Checkout independently computes them. General cart state is not cleared on account changes; removing the cached `getAuthUser` fixes stale identity reuse but does not implement a broader cart/session refactor. Direct navigation to `/checkout` redirects to `/cart` before cart loading completes. Checkout still trusts a browser Flutterwave callback and inserts processing orders without server-side payment verification. This task never invoked that flow. Relevant: `services/cartService.ts`, `store/cartStore.ts`, `hooks/useCart.ts`, `pages/Checkout.tsx`.
4. **Email delivery is intentionally manual.** Actual email-app launching, sending and delivery were not tested. Browser tests inspect the mailto destination/body without opening or sending it; clipboard behavior is checked with controlled success/failure fixtures. No backend messaging service exists in the inspected code.
5. **Missing configuration crash remains a separate baseline issue.** `src/lib/supabase.ts` still calls `createClient` with empty values when public configuration is absent, despite its “non-fatal” comment. Recommended next change: validate public config before dynamically importing App; render an explicit development setup error/generic production unavailable screen. A React error boundary around App cannot catch an earlier static-import exception. Do not invent dummy credentials or report an outage as successful empty data.
6. **Environment:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` are configured in ignored `.env.local`. `VITE_SUPABASE_ANON_KEY` is an alternative and is not required alongside the publishable key. `VITE_FLUTTERWAVE_PUBLIC_KEY` remains absent; payment testing is not enabled. No privileged key was used or placed in frontend configuration.
7. **Other pre-existing placeholders remain outside Task 2:** admin Settings simulates saving (`pages/admin/Settings.tsx`); admin Analytics navigation points to a missing route (`components/layout/AdminLayout.tsx`), and `pages/admin/Analytics.tsx` has static/random data; dashboard growth indicators are hardcoded; newsletter actions in Home/Footer are not connected; auth recovery routes are missing; product share is unwired; checkout's confirmation text claims an email was sent without email delivery code. Phone/address/legal contact details elsewhere and marketing/FAQ claims still need business verification. No unrelated features were rewritten.
8. **Scope of browser coverage:** route rendering, targeted interactions and responsive overflow checks do not prove login/registration/password recovery, admin writes/uploads, real catalog completeness, tax/shipping correctness, printing, invoice generation, payment settlement, email delivery, or database authorization. No manual testing with a real authenticated customer was performed.

## Cookie-policy findings (reported, not rewritten)

`app/src/pages/Cookies.tsx` describes performance analytics/error-tracking cookies, language preferences and advertising partners. No corresponding analytics, advertising, language-preference or consent implementation was found in the app. It instructs users to use opt-out links in a cookie banner/table, but neither supplies those controls. Auth and UI persistence use localStorage, now also including per-user wishlist IDs; the policy needs an accurate storage inventory. The Contact map iframe, external images and fonts mean third-party requests exist, so absence of app analytics does not prove absence of third-party cookies. The policy's update date and contact details also need owner/legal review. Size Guide measurements were preserved, not verified against merchandise.

## Run again

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run build
npm test
npm run lint
```

The development server is available at `http://127.0.0.1:5173/`. See `app/tests/README.md` for the isolated browser suite.
