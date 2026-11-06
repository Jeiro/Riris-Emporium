# Customer beta readiness

6 November 2026 · `/mnt/fedora-storage/Riris-Emporium` · `store-improvements`

**Release decision: not ready for real customer registration or a public beta.** Local storefront and WhatsApp regressions pass, but the active app still uses Supabase Auth. Clerk is staged, not activated. The configured Supabase project's purpose, schema, permissions and identity mapping remain unverified. Do not deploy this working tree or invite customers until the gates below pass.

## Preserved baseline and scope

Reviewed the working tree, Task 5 changes, `TASK5-REPORT.md` and `CLERK-SUPABASE-MIGRATION.md`. Task 4 remains committed at `4b669b0`; Task 3 is `f8d5be5`, Task 2 is `de46a49`. Task 5 and this continuation remain uncommitted. No branch switch, reset, commit, push, deployment, account creation, SQL execution or live application-service request was performed. No environment values were copied into this report or changed in the repository.

Implementation and tests used `/home/dragneel/Documents/riris-beta-work`, a durable copy of the existing tree with synthetic public settings. Selected changes are applied to the repository only after original-file checks. Existing Task 5 adapters, dependency lockfile, service fixes, policy proposals and regression coverage are preserved. No dependencies were added or upgraded in beta preparation. Size Guide and Cookie Policy remain unchanged.

## Local improvements

- **Catalog:** one filtered request now returns rows and their matching count. Category, featured, stock, zero price bounds and supported sorts apply consistently. Stable ID tie-breaking prevents ambiguous ordering for equal values. Search values are quoted for PostgREST punctuation; wildcard semantics remain supported. Pagination and price ranges are validated. Filters reset pagination. A delayed old Shop response cannot replace the newest search result.
- **Clerk preparation:** activation now requires explicit evidence of a verified development project, UUID mapping, server authorization and replacement-flow testing. Production builds always remain denied in the staged root, including Vercel preview builds. No environment switch or supplied key bypasses this gate. An injected identity resolver keeps the Clerk text subject separate from the store UUID, rejecting absent, foreign, malformed or stale mappings. It deliberately does not guess a database table/RPC.
- **Honest unfinished features:** disabled simulated admin Settings saves and inputs; removed missing Analytics navigation and hardcoded dashboard growth percentages. Newsletter fields/actions and the unwired product Share button are disabled. Saved-address controls and false empty-address claims are replaced with an unavailable notice; checkout delivery fields remain intact. Broken recovery/password links show setup notices. Unknown email-verification state no longer says “No.” Home and FAQ no longer promise Flutterwave payment, automated returns or tracking emails. Footer links now accurately identify featured products and recorded orders.
- **Vercel preparation:** retained the existing SPA rewrite and made Vite, `npm ci`, `npm run build` and `dist` explicit in `app/vercel.json`. No project/dashboard setting was changed.

The current catalog is still based on the repository's assumed flat product schema. These fixes do not establish live database acceptance or permissions. Search quoting follows the [PostgREST URL grammar](https://docs.postgrest.org/en/stable/references/api/url_grammar.html).

## Launch blockers, in order

| Gate | Required evidence before customer use |
| --- | --- |
| Development target | Owner confirms the authorized Supabase project and Clerk development instance/issuer. The currently configured project must not be assumed to be development. No access to it was attempted. |
| Schema and RLS | Obtain an authorized metadata export and review constraints, FKs, grants, policies, triggers, RPCs, views and Storage. Test cross-account access directly against the development API. Frontend filters and mocked tests do not prove RLS. |
| Clerk cutover | Implement reviewed provisioning, identity mapping and trusted role lookup; replace all active Supabase Auth dependencies together. Test real signup/verification/login/logout/recovery/profile and expired/multi-tab sessions using synthetic development accounts. |
| Safe store access | Verify public catalog publication rules; customer isolation; admin-only product/Storage writes; customer inability to edit roles, owner IDs, orders or payment state. Confirm admin revocation blocks the next request. |
| Real store operations | Verify add/edit/inventory/image round trips, cart conflicts/uniqueness, current pricing, supported profile fields and manual order operations against the development schema. |
| WhatsApp business review | Owner manually checks complete message and destination on phone and laptop; confirms products, quantities, delivery details, pricing language, final charges and how staff record confirmed orders. No message delivery was tested here. |
| Content and release approval | Review shipping/return/refund promises and contact/legal details, supply accurate product assets, inspect live Clerk UI and mobile devices, review Vercel settings and approve the release. Existing lint failures remain. |

Privileged credentials previously shared in the conversation must be rotated/revoked by the owner if this has not already happened. They were not used, tested or embedded in frontend files. Never reuse them to unblock this work.

## Clerk activation and UUID preservation

The code in `app/src/auth/clerk/` uses the existing `@clerk/react` integration. Staged `SignIn`, `SignUp` and `UserProfile` components cover the intended signup, login, account and recovery UI. They are **not mounted by `main.tsx` or `App.tsx`**. The active singleton, Auth store, service predicates and account hooks still use Supabase Auth. This phase has not completed replacement authentication or migrated all data services.

Before activating the replacement:

1. Review the additive design in `CLERK-SUPABASE-MIGRATION.md`. Preserve existing UUIDs and FKs; add a unique Clerk text subject linked to a stable store UUID and an optional approved legacy identity. Never put `user_…` into UUID fields, cast subjects to UUID, or merge identities by email alone.
2. Approve profile provisioning/linking and admin authority. Clerk's native Supabase integration validates tokens but does not automatically synchronize database user records. The backend must derive identity from the verified JWT. [Clerk Supabase integration](https://clerk.com/docs/guides/development/integrations/databases/supabase).
3. Connect the native Clerk token callback and reviewed UUID resolver to **every** account data path: Auth/profile stores, verified-session hooks, cart queue, wishlist, orders/history, user/address services, product/admin/Storage requests. Migrate query/payload ownership fields with the reviewed schema, not independently.
4. Keep UI role results bound to account/session revisions, but enforce admin authority in RLS/privileges using trusted memberships or reviewed immutable claims. The new UI gate is not server authorization. Do not use editable client metadata or the old development `DEV_FORCE_ADMIN` override as authority.
5. Mount the provider inside the single router, add `/login/*` and `/register/*` routes, preserve safe login destinations and implement recovery. Retire legacy credentials, token storage and Supabase Auth subscriptions only after replacement tests pass. Never clear all localStorage or merge wishlist namespaces without an approved identity link.
6. Run a synthetic development rehearsal with explicit approval. The current activation checklist is a code-review prerequisite, not a security mechanism. Production activation needs a separate reviewed change; a normal Vercel preview build currently remains blocked by this guard.

Actual hosted Clerk signup, verification email, recovery, password changes, MFA/provider settings, cross-tab expiry and live profile provisioning remain **untested and unavailable in the active app**. The existing Supabase confirmation-required signup defect and failed-sign-out behavior are still captured by characterization tests. Those passing tests reproduce defects; they are not successful customer-flow validation.

## Supabase verification checklist

Use `docs/task5/inspect-development.sql` only after target and read-only inspection approval. The existing RLS proposal is commented, unexecuted guidance; no migration is ready to apply blindly.

- Confirm `products`, `users`, `user_addresses`, `carts`, `orders`, `payments`, `coupons`, `reviews` and the `product-images` bucket. Current cart/order contents are JSON arrays; do not assume normalized item tables exist.
- Verify numeric/JSON types, allowed fields, defaults and timestamps; unique cart owner; optimistic revision behavior; product prices/stock and SKU constraints; identity FK compatibility for new Clerk-only customers.
- Review public product visibility (`isActive` is currently mapped true), private customer/profile fields, issuer validation and the owner-to-UUID lookup. Evaluate both `USING` and `WITH CHECK`, grants and permissive policy combinations.
- Test guest, customer A, customer B and admin with synthetic fixtures. A must not read, mutate, reassign or infer B's private records. Reject wrong-issuer/expired/revoked tokens, role elevation, customer catalog writes, arbitrary order status/totals and payment writes. Include direct REST/Storage requests that bypass the UI.
- Verify Storage public retrieval, admin-only upload/delete, MIME/size rules and abandoned upload cleanup. Current forms persist only the first image and not a configurable low-stock threshold; do not assume gallery changes are saved. SKU/compare-price column support is still unknown.
- Validate returning-user ownership, first-cart creation races, quantity conflicts, catalog changes and deleted products. No inventory reservation or trusted server quote exists.
- Agree on manual WhatsApp order recording and payment/delivery status transitions. Opening WhatsApp must never create a confirmed order. No manual-order backend was invented here.

## Test results and limits

| Check | Result |
| --- | --- |
| `npm run build` | Passed TypeScript and Vite production build; existing stale Browserslist warning remains. |
| `npm test` | 7 test files passed; **61 individual checks** verified separately: prior 54 plus 7 beta checks. |
| Task 2 browser suite | **19 groups**, all 27 configured routes; wishlist, contact, order isolation, 404 and mobile support/policy checks retained. |
| Cart browser suite | **13 groups**; arithmetic, errors, account switching, delayed reads/writes and direct checkout retained. |
| WhatsApp browser suite | **10 groups**; draft validation, encoding, totals, popup fallback, account isolation, cart/form preservation, mobile and blocked legacy payments. |
| Configuration browser suite | **5 checks**, including generic production failure and invalid-config initialization prevention. |
| Task 5 browser suite | **5 groups**; staged Clerk gates/session fixtures and admin-order error handling. |
| New beta browser suite | **6 groups**; synthetic admin upload/create/edit round trip, catalog filters/counts/errors/races, disabled controls, local refresh and mobile overflow. |
| Total browser coverage | **58 groups/checks**; no uncaught runtime exceptions or unexpected application mutations. |
| `npm run lint` | **63 errors, 4 warnings**, versus **66 errors, 4 warnings** at Task 5 (Task 2: 85/7). Zero new findings when comparing file/rule/severity/message. No mass cleanup. |
| `git diff --check` | Passed after application to the repository. |

All application external requests are intercepted or mocked. Admin product/image writes exist only in the harness; the real service/form code executes. This proves frontend request/response integration, not live schema, Storage or RLS acceptance. Deliberate 403/503 failures generate expected console errors. No ClerkProvider was initialized against a real instance, and no real customer account was used.

WhatsApp `window.open` is recorded, never used to send a message. No real WhatsApp navigation, manual app launch, email, payment, invoice or backend order creation occurred. The existing payment initialization, verification, refunds and order-creation guards remain disabled even with a Flutterwave key configured. No Flutterwave key is required.

Mobile checks use 390×844; desktop checks use 1440×1000. Shop/product/profile local refresh and overflow passed. The new profile screenshot was visually reviewed; existing cart/checkout/policy mobile coverage remains. External assets are mocked, so this is not a live-asset/device certification. Local Vite refresh does not prove Vercel production routing.

Evidence: `/home/dragneel/Documents/riris-beta-work/{beta,task2,cart,whatsapp,task5,config}-browser/`, `build.log`, `unit.log`, `unit-individual.log`, `lint-before.json`, `lint-final.json`. An initial beta harness run used the wrong newsletter selector; corrected and rerun successfully. An introduced hook-cleanup warning was removed before final lint comparison.

## Required environment settings

| Name | Scope / status |
| --- | --- |
| `VITE_SUPABASE_URL` | Public. Present locally, but current target is unverified. Preview must use the explicitly authorized development project after approval. |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Public. Present locally; use the key belonging to the selected project. |
| `VITE_SUPABASE_ANON_KEY` | Alternative public key, not required alongside publishable key. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public. Owner-provided test key present locally; only format was checked. Provider ownership, domain settings and native integration are unverified. Key alone does not activate Clerk. |
| `VITE_FLUTTERWAVE_PUBLIC_KEY` | Not required; payment processing remains disabled. Do not enable a gateway for beta. |

No secret/service-role, Clerk secret or database password belongs in `VITE_`, committed files, test fixtures or reports. Any future privileged backend provisioning settings belong only in the reviewed server environment. No new backend secret is required for the prepared frontend adapters. Keep `.env.local` ignored; do not reuse the current unverified project for preview. Production values must be separately approved and scoped.

## Vercel audit and production checklist

**Local configuration reviewed; remote project settings unverified.** No `.vercel/project.json` association was found and no Vercel connector was available. No account/project/API was accessed. Local Git has `main` and `store-improvements`; `origin/HEAD` points to `origin/main`. This does not prove Vercel's production-branch setting.

Before a separately authorized preview:

1. Confirm repository/project ownership in Vercel. Set Root Directory to **`app`**, Framework to **Vite**, install `npm ci`, build `npm run build`, output `dist`. Pin a supported Node version compatible with the lockfile and test runner (these checks used Node 22.23.1).
2. Confirm Production Branch **`main`**; treat **`store-improvements`** as preview only. Do not change Git defaults or promote a preview during this task. Keep customer access restricted until release gates pass.
3. Scope preview variables to the approved development Supabase/Clerk pair, preferably the specific preview branch. Scope production variables to separately approved production services. Do not inherit production credentials/data access into previews. Vite variables are embedded at build time; rebuild after approved environment changes. [Vercel environment variables](https://vercel.com/docs/environment-variables).
4. Configure approved Clerk origins/redirects and Supabase third-party issuer settings for the selected environment. A preview deployment uses a production bundle: the current Clerk activation guard intentionally will not activate there. Review and test the future preview/production activation design before cutover.
5. Retain the existing rewrite in `app/vercel.json`. Vercel documents the SPA fallback for React Router/Vite; confirm asset responses, hard refresh of `/shop`, `/product/<id>`, `/login/...`, `/register/...`, `/profile`, `/cart`, `/checkout`, and unknown URLs after an authorized deployment. SPA 404 content may return HTTP 200 under this fallback. [Vercel Vite guide](https://vercel.com/docs/frameworks/frontend/vite).
6. Verify production missing-config output, no exposed secrets, intended public catalog, authorized customer/admin behavior and manual WhatsApp experience. Check privacy/cookie disclosures and accurate shipping/refund policies. Resolve or explicitly review lint/quality findings; do not describe lint as passing.
7. Capture the approved commit/artifact, environment scope and policy/schema version. Complete backup and rollback rehearsal; obtain explicit release approval before merging, deploying or inviting customers.

## Rollback

Nothing was deployed or migrated, so no live rollback is needed now. Preserve Task 5 and beta diffs and review them before creating a checkpoint. Do not use `git reset --hard`, blanket restore or directory deletion. To undo a local beta change, revert only its reviewed hunk/file after preserving subsequent edits. Task 4's checkpoint does not contain Task 5 or the new preparation work.

For a future approved release, record the last validated deployment and matching commit/config/schema. If customer access fails, first stop registrations/account writes or show maintenance, then restore the reviewed artifact and matching environment settings. An old frontend that expects Supabase Auth is not automatically compatible with a Clerk-migrated database. Keep legacy UUID relationships and additive mapping exports; reconcile Clerk-only profiles/carts/orders before any schema rollback. Restore only reviewed permissions, never broaden RLS to make rollback appear successful. Do not delete customers or order records. Test rollback in the authorized development environment before release.

## Files changed by this continuation

Task 5's existing changes remain in the overall diff. The additional beta changes are:

- `app/src/lib/catalogQuery.ts` (new), `services/productService.ts`, `pages/Shop.tsx`, `components/product/ProductFilter.tsx` — catalog correctness and response isolation.
- `app/src/auth/clerk/activation.ts`, `storeIdentity.ts` (new), `ClerkMigrationRoot.tsx` — reviewed activation and UUID boundary, still inactive.
- `app/src/pages/Profile.tsx`, `Login.tsx`, `Home.tsx`, `FAQ.tsx`, `ProductDetail.tsx`, `pages/admin/Settings.tsx`, `Dashboard.tsx`, `components/layout/AdminLayout.tsx`, `Footer.tsx` — unavailable controls, accurate notices and navigation.
- `app/vercel.json` — explicit app-root Vite build settings and retained SPA rewrite.
- `app/tests/beta.test.mjs`, `beta.browser.mjs` (new), `task5-audit.test.mjs`, `fixtures/task5-supabase.mjs`, `tests/README.md`, `app/package.json` — focused regressions and commands; no dependency changes.
- `docs/CLERK-SUPABASE-MIGRATION.md` — activation-checklist amendment; `docs/BETA-READINESS.md` (new) — this report.

## Reproduce locally

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run build
npm test
npm run lint
git diff --check
```

Browser instructions and isolated fixtures are in `app/tests/README.md`. This session's Vite server runs from the synthetic workspace on `http://127.0.0.1:5186/` while its process remains running; the browser harness supplies the test data. It is not a configured live customer demo. Do not manually use the repository's unverified backend settings for integration testing.
