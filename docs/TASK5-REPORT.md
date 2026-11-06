# Task 5 — local Clerk preparation and store integration audit

Date: 6 November 2026. Repository: `/mnt/fedora-storage/Riris-Emporium`. Branch: `store-improvements`.

**Local implementation and audit only. Clerk is not active and live database integration remains blocked pending review.** No accounts, customer records, database policies, migrations, Clerk/Supabase settings, payments, WhatsApp messages, push or deployment were performed.

## Recovery and checkpoints

Reviewed Git status/diff and prior reports. Task 2 is preserved at `de46a49`, Task 3 at `f8d5be5`, and Task 4 was reviewed and committed as **`4b669b0 feat: implement WhatsApp checkout`**, as requested. The repository was clean after that checkpoint.

Initial Task 5 work was staged in `/home/dragneel/Documents/riris-task5-work`. When the Clerk brief arrived, its audit tests and Supabase-Auth-only SQL draft were preserved in `pre-clerk-audit/` before being adapted. Unfinished earlier Task 4 backend work was not applied. Repository edits are guarded by original-file hashes. Task 5 remains uncommitted for review.

The new brief authorizes isolated Clerk preparation and confirmed local fixes, while requiring review before replacing the existing authentication. Accordingly, the active app still uses Supabase Auth. The new provider/client/route adapters are disconnected from `main.tsx` and `App.tsx`; setting a key alone cannot activate them. This is not a completed authentication migration or a second active login flow.

## Completed local fixes

| Finding | Change and evidence | Remaining limit |
| --- | --- | --- |
| Product create/edit disagree | `lib/productPayload.ts` is used by both service methods. Edits now send flat `stock`, `image`, `featured`, `compare_at_price` and `sku`, rather than nested `inventory`, `images`, `isFeatured`, `compareAtPrice`. Create retains supported SKU/compare-price fields. Invalid prices and fractional/negative stock fail before writes. Synthetic create → catalog → cart and update-payload tests pass. | Flat columns are inferred from the existing mapper, not a live schema export. Confirm SKU/compare-price columns in the development DB. Extra images and low-stock threshold still have no verified persistence contract. |
| Profile omits phone | Shared whitelisted profile payload sends trimmed phone and only explicitly supplied name fields; auth/profile reads and update results return phone. A phone-only update no longer blanks Auth name metadata. Role, ID and email are not accepted by this payload. | Contact phone is not a verified identity claim. Address hydration, confirmation indicators and atomic Auth/profile synchronization remain unfinished. |
| Admin status update ignores error | `pages/admin/Orders.tsx` uses `orderService.updateOrderStatus`, which checks returned errors and requires a recorded result. UI status changes only after success; failures show refresh/retry guidance. Browser denial and success fixtures pass. | Real RLS and allowed status transitions still require review; the existing direct admin update is not a trusted manual-order API. No order creation or payment behavior added. |

No cart calculation, wishlist, checkout message, payment-disable logic, Size Guide, Cookie Policy or visual layout was redesigned. The official WhatsApp destination remains `2348072105878`.

## Clerk integration progress

Investigated `@clerk/react-router`. The current project uses declarative routing, for which Clerk documents `@clerk/react`; the framework SDK quickstart uses middleware/root loaders. Installed **`@clerk/react@6.18.6`** with six additional lockfile package entries and **no version changes to existing dependencies**. React remains 19.2.3 as locked. [Official declarative-mode guide](https://clerk.com/docs/react/guides/development/declarative-mode).

Prepared provider, SignIn/SignUp/UserProfile wrappers, missing-config/review gates, identity controller and protected/admin gates. The native Supabase factory supplies Clerk session tokens through `accessToken`, without JWT templates, manual token storage or Supabase Auth session refresh. The prepared adapter rejects tokens resolved after an account/session change and clears identity before logout finishes. Admin UI decisions default to denial and must match the current account and revision; no pretend backend role API was implemented. [Supabase native Clerk integration](https://supabase.com/docs/guides/auth/third-party/clerk).

**Not completed:** active-app Clerk cutover, profile provisioning/linking, trusted role lookup, actual Clerk login/registration/recovery, SDK multi-tab behavior, database owner mapping and live RLS. These require the authorized development project identity, schema and reviewed migration. The staged components compile and are tested locally; that does not establish hosted-provider behavior.

Full dependency inventory, SDK rationale, user-ID design, cutover gates and rollback: [`CLERK-SUPABASE-MIGRATION.md`](CLERK-SUPABASE-MIGRATION.md).

## Database dependencies and contracts

No version-controlled authoritative schema was found. `server/` has only `.env.example`, not a runnable application backend. Existing REST requests are real Supabase service code, but live acceptance and permissions were not tested.

| Resource | Current code contract | Inspection/integration requirements |
| --- | --- | --- |
| `products` | `id,name,description,price,image,category,stock,featured,created_at,updated_at`; mapper also expects `compare_at_price,sku,subcategory,tags,ratings,reviews` | Confirm exact types/defaults; publication flag; price/stock constraints; SKU uniqueness; categories; image gallery; admin write policies. `isActive` is currently hardcoded true. |
| `users` | Auth UUID-like `id`, email, `name,last_name,phone,role,avatar_url,bio`, timestamps | Verify Auth FK, signup triggers, role protection, profile grants, mappings and error behavior. Client `role` is never authorization. |
| `user_addresses` | Service explicitly assumes this table; writes UI keys plus `user_id` | Confirm existence, camelCase/snake_case fields, defaults, owner RLS, default-address uniqueness and ID mapping. |
| `carts` | `id,user_id,items` JSON array, `total,coupon,discount_amount`, timestamps | Unique owner, JSON structure, numeric types, monotonic revision/timestamp, owner SELECT/INSERT/UPDATE, first-write races and multi-tab conflicts. No verified reservation/atomic cart API. |
| `orders` | `id,user_id,order_number,items,total,status,shipping_address,billing_address,notes,tracking_number`, timestamps | Owner/admin reads, denied customer mutations, separate payment/fulfillment state, status transitions and manual recording contract. |
| `payments` | Historical reads use broad `select('*')`; processing/refunds disabled | Verify ownership via user or order, safe projection and denied browser writes. No payment authority restored. |
| `coupons` | `code,discount`; client assumes a flat amount | Expiry/usage/eligibility/currency semantics and private-code access. Current lookup cannot establish final entitlement. |
| `reviews` | Insert `product_id,rating,comment,created_at`, no author supplied | Owner/default/trigger, author policy, rating bounds, moderation and rating aggregates. |
| Storage `product-images` | Upload to `products/<generated-name>`, then public URL | Bucket existence/publicness, admin-only writes, size/MIME rules, object ownership and cleanup. Add validates MIME/size; Edit lacks equivalent validation. Removed form images and abandoned uploads are not deleted. |
| `cart_items`, `order_items` | No application queries found; items are currently JSON snapshots | Inspect whether tables exist before proposing normalized schema or migration. |

The proposed identity migration preserves existing UUID relationships, adds a Clerk text subject through a separate store-profile mapping, and introduces reviewed owner links rather than converting UUID columns. Policies resolve the verified `auth.jwt()->>'sub'` under the approved issuer. No automatic email matching, fake Supabase Auth accounts or deletion of legacy customers is proposed.

`docs/task5/rls-policy-proposal.sql` contains fully commented SQL examples, policy matrix, migration prerequisites and rollback notes. It is deliberately **not an executable migration**. `inspect-development.sql` is a proposed read-only metadata checklist; it was not run. Neither file proves live schema compatibility or secure policies.

## Remaining findings, ordered by priority

1. **Authorization and identity cutover:** current project status, schema, grants, RLS, Storage and admin role authority remain unverified. The future Clerk owner mapping and role/provisioning commands must be reviewed before any cutover. Application filters do not secure direct API access. Audit all existing permissive policies and table/column grants, not only new policies.
2. **Customer isolation outside the repaired cart/detail flow:** `UserOrders.tsx` has no stale-result/owner-response guard; `authStore.updateProfile` lacks request-generation checks. `userService.updateAddress/deleteAddress`, `orderService.cancelOrder`, and legacy `paymentService` reads lack explicit owner predicates. Some are not active UI paths, but all require RLS and appropriate service hardening. No cross-customer live vulnerability was asserted or tested.
3. **Registration/profile gaps:** confirmation-required signup still tries a browser `users` insert without a session and can fail after Auth signup. Other profile errors are sometimes suppressed. Legacy signOut ignores returned errors. Recovery routes are absent. Profiles do not load saved addresses; successful address mutations do not refresh profile state. Verification indicators lack authoritative mapping. These should be resolved through the reviewed Clerk replacement rather than a second parallel login system.
4. **Catalog correctness:** `productService.getProducts` counts unfiltered products; sort/featured/inStock are ignored and zero price bounds are skipped. `Shop`/product hooks can publish out-of-order fetch results. Extra images/threshold fields are offered but not persisted. Product/archive/publication and Storage cleanup need an approved data contract. No realtime refresh is implemented; a new product appears on the next successful catalog fetch if visibility policies permit it.
5. **Inventory:** stock is read for cart availability, not reserved. WhatsApp opening neither decrements stock nor creates an order. Concurrent admin edits and eventual manual-order stock adjustments need transaction/revision rules. Client quantity checks cannot enforce inventory against direct API requests.
6. **Orders/reporting:** admin changes now check failures, but manual WhatsApp order creation is absent. Dashboard revenue sums order totals regardless of payment/cancellation; service statistics are limited to 50 orders. Admin user display reads `firstName/lastName` instead of stored `name/last_name`, substitutes current time for unknown activity, and shows default zero spend/order counts. These are not verified business metrics.
7. **Placeholders:** admin Settings delays then claims configuration saved without persistence; Analytics has random/static metrics and missing navigation route; dashboard growth is hardcoded; newsletter/product-share actions are unwired; Home/FAQ still mention Flutterwave. Task 2's policy/contact/marketing claims still need owner review. No unrelated redesign or mass cleanup was performed.

Manual order recording should remain a separate reviewed feature: owner enters confirmed items/customer details, records payment and fulfillment independently, and applies explicit inventory adjustments with an actor audit trail. Merely opening WhatsApp must never create a confirmed/paid order.

## Tests and evidence

Validation results are recorded below after the final checks. Every functional test uses synthetic identities and data; no live backend or Auth credentials are used. Service tests replace the Supabase boundary; Clerk client tests inject fetch; browser tests intercept every external request. The isolated workspace contains only synthetic public environment strings.

Tests named **known gap** reproduce unresolved findings. Passing such a test confirms the audit observation, not correct feature behavior; change its expectation when the corresponding defect is repaired. The fixtures are not a PostgreSQL/RLS emulator.

| Check | Result |
| --- | --- |
| `npm run build` in the repository | Passed TypeScript and Vite; existing old Browserslist warning remains. |
| `npm test` | Passed all six test files; each was also run separately to verify **54 individual checks** (26 retained + 19 service audit + 9 Clerk). |
| `npm run lint` | **66 errors, 4 warnings**, versus Task 4's **71 errors, 4 warnings**; normalized file/rule/severity/message comparison found **zero new findings**. No mass cleanup. |
| `git diff --check` | Passed; separate whitespace check also covered all new/untracked files. |
| New Task 5 browser suite | **5 groups passed**, zero uncaught runtime errors. Clerk setup/route/identity tests make no external requests; admin-page requests are intercepted. |
| Task 4 WhatsApp browser suite | **10 groups passed**, zero uncaught runtime errors; no real WhatsApp navigation, payments or order writes. |
| Retained Task 2 browser suite | **19 groups passed**, all **27 configured routes** checked, zero uncaught runtime errors. |
| Retained Task 3 cart browser suite | **13 groups passed**, zero uncaught runtime errors; account races, failure/retry and totals retained. |
| Retained configuration browser suite | **5 checks passed**, including an actual production build with missing Supabase config. |

Total browser coverage: **52 groups/checks**. Expected injected API failures are not live service outages. Browser suites ran against the isolated workspace; applied source files were hash-compared to it. Final build, unit and lint checks ran in the actual repository after `npm ci --ignore-scripts --no-audit --no-fund`. No existing dependency version changed. The SDK's staged TypeScript was checked, but it is intentionally absent from the active application import graph.

Evidence: `/home/dragneel/Documents/riris-task5-work/` contains `lint-before.json`, `lint-final.json`, unit logs, `browser-results/`, `whatsapp-regression/`, `task2-regression/`, `task3-regression/` and `config-regression/`. Prior test files are preserved unchanged. New browser fixtures do not mount a real ClerkProvider; actual provider forms, email/SMS/recovery, device handoff and database permissions remain untested.

## Files changed

Modified:

- `app/package.json`, `app/package-lock.json` — pinned Clerk React SDK and Task 5 browser command; existing dependency versions unchanged.
- `app/src/services/productService.ts` — common flat create/edit payload.
- `app/src/services/authService.ts`, `app/src/services/userService.ts` — whitelisted phone/profile payloads and returned phone values.
- `app/src/pages/admin/Orders.tsx` — confirmed status response and visible failure handling.
- `app/tests/README.md` — new checks and explicit limits.

Added:

- `app/.env.clerk.example` — public setting names only, no credentials.
- `app/src/lib/productPayload.ts`, `app/src/lib/profilePayload.ts`.
- `app/src/auth/clerk/config.ts`, `sessionController.ts`, `supabaseClient.ts`, `ClerkAccess.tsx`, `ClerkMigrationRoot.tsx`.
- `app/tests/task5-audit.test.mjs`, `clerk.test.mjs`, `task5.browser.mjs`.
- `app/tests/fixtures/task5-supabase.mjs`, `task5-preview.html`, `task5-preview.tsx`.
- `docs/TASK5-REPORT.md`, `docs/CLERK-SUPABASE-MIGRATION.md`.
- `docs/task5/inspect-development.sql`, `docs/task5/rls-policy-proposal.sql`.

No tracked files deleted. Existing Supabase settings, previous reports and all previous test files remain unchanged. The subsequently supplied public Clerk key was added only to ignored `app/.env.local`. No active Clerk integration or migration has been silently enabled.

## Configuration, blockers and next review

The existing configured Supabase project remains unverified; it must not be assumed to be development. Required future public settings are `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (compatible public `VITE_SUPABASE_ANON_KEY` alternative retained). The owner subsequently supplied a public Clerk development key; it is configured in ignored `app/.env.local` and its format was validated locally. This does not verify instance ownership, native integration or live login, and does not activate Clerk. No secret values were read into the report or placed in frontend code.

Before live development testing: confirm project/issuer identities and synthetic test scope; authorize schema-only inspection; review mappings, role authority and SQL; plan backups/rollback; then separately authorize fixture account creation and controlled CRUD tests. No such authorization or operations were inferred from the general architecture decision.

The manual phone/laptop WhatsApp handoff check remains for the owner. Automated tests inspect the generated draft and intercept window opening; they never send messages.

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm ci
npm run build
npm test
npm run lint
git diff --check
```

See `app/tests/README.md` for isolated browser commands. Normal manual browsing uses configured services; it is not the intercepted test environment. Do not treat the staged Clerk modules or local SQL as ready for deployment.
