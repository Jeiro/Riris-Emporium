# Clerk + Supabase migration — local review draft

6 November 2026. Baseline: Task 4 commit `4b669b0`, branch `store-improvements`.

**Clerk is prepared but not activated.** The existing application still uses Supabase Auth. No Clerk instance, account, database, integration setting or policy was accessed or changed. Adding public keys alone will not enable the staged provider. Review and development-database verification must precede cutover.

## SDK and connection decision

The app uses React 19.2.3 from the lockfile, Vite and a declarative `BrowserRouter`. Clerk's current declarative-mode guide uses `@clerk/react`; the `@clerk/react-router` quickstart uses middleware and a root loader for framework mode. We investigated both and installed **`@clerk/react@6.18.6`**, whose peer range supports the locked React version. No existing dependency version was changed. There is no reason to convert the app to framework mode for authentication. [Clerk declarative-mode guide](https://clerk.com/docs/react/guides/development/declarative-mode), [React Router quickstart](https://clerk.com/docs/react-router/getting-started/quickstart).

Use Supabase's native third-party integration: register the reviewed Clerk issuer with Supabase, enable Clerk's Supabase compatibility, and supply the current session token through `createClient(..., { accessToken })`. The staged factory uses `session.getToken()` without a JWT template and disables Supabase session persistence/refresh/URL detection. Supabase must validate the issuer/signature; a browser-decoded subject is not authentication. [Supabase Clerk integration](https://supabase.com/docs/guides/auth/third-party/clerk).

Clerk's older Supabase JWT template is deprecated. Native integration supplies the authenticated database-role claim; that claim does **not** make a customer a store administrator. [Clerk Supabase integration](https://clerk.com/docs/guides/development/integrations/databases/supabase).

## Staged components and boundaries

`app/src/auth/clerk/` contains:

- `config.ts`: public-only settings validation with errors containing names, not values.
- `sessionController.ts`: loading/guest/authenticated/error identity, monotonic account/session revisions, captured request ownership, stale-token rejection, immediate logout clearing and fail-closed admin UI decisions.
- `supabaseClient.ts`: native token-callback factory; no connection or client construction on import, no manual token persistence.
- `ClerkAccess.tsx`: setup/review gate and isolated protected/admin route gates. Missing configuration shows developer guidance or generic production text. Admin requires a current-account/current-revision backend-role decision; no role integration is fabricated.
- `ClerkMigrationRoot.tsx`: provider inside a single existing router, SDK session bridge, and staged SignIn/SignUp/UserProfile components. The bridge hides account children while SDK and controller identities disagree. Prebuilt Clerk flows are intended to handle recovery, verification and account sessions at cutover.

`main.tsx` and `App.tsx` do **not** import these components. The activation review defaults to denied, including when settings exist. Beta preparation replaced the root boolean with an explicit development-project, UUID-mapping, server-authorization and replacement-flow checklist; production builds remain denied. They are not a second running login system. Existing Supabase Auth remains until all replacements and schema migration are reviewed. Full storefront authentication replacement, profile provisioning and role lookup are explicitly incomplete.

Tests exercise synthetic controller events and route components, not Clerk's hosted sign-in forms. No live Clerk SDK initialization, email, SMS, recovery flow or multi-tab refresh has been verified. The staged UI colors use the store's primary brown; a visual comparison of real Clerk forms is still pending.

## Existing Auth dependency inventory

Paths are relative to `app/src/`.

| Dependency | Current behavior | Required cutover change |
| --- | --- | --- |
| `services/authService.ts` | Supabase signup/password login/logout/refresh/getUser/OTP/recovery/password/profile metadata; browser `users` insert | Replace credentials/session/recovery with Clerk; reviewed profile provisioning rather than anonymous profile insertion |
| `store/authStore.ts` | Persists `auth-storage`, Supabase profile/user, intent/request guards; profile mutation lacks the same account guard | Keep UI session transition guarantees; remove persisted identity as authority; protect profile writes/results across account changes |
| `hooks/useAuth.ts` | Combines store and verified identity, development `DEV_FORCE_ADMIN` override | One Clerk-derived identity plus server-backed store role; remove the override from the new adapter |
| `lib/verifiedSession.ts`, `hooks/useVerifiedUser.ts` | `auth.getUser`, `onAuthStateChange`, shared revision/clearing | Replace with Clerk bridge in one reviewed cutover; never run two independent identity subscriptions |
| `pages/Login.tsx`, `Register.tsx`, `Profile.tsx` | Existing forms and Supabase service calls; phone/address/account display | Replace auth forms with Clerk; retain contact/delivery data as store data; distinguish verified account phone from delivery contact phone |
| `App.tsx` ProtectedRoute/AdminRoute | Verified session and UI role; login return destination | ClerkAccess equivalent, `/login/*` and `/register/*` paths for Clerk flows; keep one BrowserRouter and safe return paths |
| `lib/loginDestination.ts` | Safe local pathname/query/hash | Preserve and wire to successful Clerk sign-in; never allow external return URLs |
| `lib/supabase.ts`, `utils/supabase.ts` | Singleton plus getUser/getSession/signOut helpers | Inject one Clerk-token client; remove calls to Supabase Auth on that client |
| `services/cartService.ts` | getAuthUser, user_id filters, owner recheck | Resolve Clerk subject to reviewed store owner identity; retain captured generation and optimistic revision checks |
| `store/cartStore.ts`, `hooks/useCart.ts` | Verified-session subscriber, synchronous clearing, queue, stale-result rejection | Wire to the same Clerk transition source; keep all Task 3 arithmetic/stock/queue behavior |
| `hooks/useWishlist.ts`, `pages/Wishlist.tsx` | getUser rechecks; per-identity localStorage | Use Clerk session revision checks and subject namespace; never infer ownership from a stored profile |
| `services/orderService.ts` | getUser for history/detail; owner-filtered detail rechecks | New owner mapping and RLS predicates; retain UUID **order ID** validation (distinct from user ID) |
| `pages/UserOrders.tsx` | Direct Supabase user_id query, no obsolete-result guard | Mapped owner lookup and cancellation/clear on every account change |
| `services/userService.ts` | getUser, password updates, users and assumed addresses table | Clerk password/account actions; reviewed store profile/address mapping and owner filters |
| Admin pages, `services/productService.ts`, `imageService.ts`, `paymentService.ts` | Direct database/storage requests using singleton; client role gates | Clerk-token client and independently enforced DB/Storage permissions; no browser role elevation |
| Token storage | `accessToken`, `refreshToken`, `auth-storage`, SDK `sb-…-auth-token` | Retire only these app-owned legacy keys at controlled cutover; do not clear all browser storage or wishlist/cart data |

`lib/wishlistStorage.ts` accepts string IDs and remains compatible with Clerk subjects. The new adapter tests prove distinct `user_A` / `user_B` keys. This does not authorize migrating a legacy UUID wishlist to a Clerk subject. Offer any local-data transfer only after a trusted identity link, with explicit ownership checks; do not scan/merge other account keys automatically.

## User IDs and database strategy

The repository has no authoritative schema or migrations. TypeScript interfaces and REST payloads reveal assumptions, not actual column types, keys or policies. Current products/cart/order IDs use strings in code; OrderDetail specifically validates UUID order IDs. Current cart and order contents are JSON arrays. There are no application queries to `cart_items` or `order_items`; inspect whether those tables exist before proposing changes to them. No current SQL implementing `auth.uid()` or `auth.jwt()` exists in the repository.

Clerk subjects such as `user_…` must never be cast into UUID columns. The preferred **proposal**, pending inspection, is additive:

1. Preserve `auth.users`, `public.users`, existing UUIDs and foreign keys.
2. Introduce a store profile identity with a UUID primary key, unique Clerk text subject, and optional unique legacy-user link. Keep profile existence independent of `auth.users` so new Clerk-only users need no fake Supabase Auth account.
3. Approve one-to-one legacy mappings using trusted identity proof. Matching email strings alone is insufficient; quarantine ambiguous links and document the evidence. No mapping is created in this task.
4. Add nullable `customer_id` relationships to owned resources, retaining legacy `user_id`. Backfill only approved links, compare counts/references, reconcile duplicates, then plan constraints and cutover. Existing `user_id NOT NULL`/Auth FKs may require a reviewed compatibility change before new Clerk-only writes.
5. Use `auth.jwt()->>'sub'` to find the current profile under the approved Clerk issuer. Owner policies compare stable `customer_id` to that mapping. For a verified greenfield schema, direct text owner subjects are an alternative; do not mix the two contracts accidentally.
6. Change service predicates/payloads and auth adapters together. Current prepared cart tests accepting text contexts demonstrate client compatibility only; they do not make a UUID database column accept Clerk IDs. A reviewed mapping client/RPC is still required.

Products need no Auth ID rewrite. Reviews need an author relationship; payment ownership may follow orders rather than a direct user column. Storage `owner_id`, public-bucket behavior and existing object paths must be inspected, not rewritten automatically.

SQL examples and rollback notes: [`task5/rls-policy-proposal.sql`](task5/rls-policy-proposal.sql). The entire proposal is commented out; it cannot accidentally execute as a migration. [`task5/inspect-development.sql`](task5/inspect-development.sql) is a proposed read-only metadata inspection script and was **not run**. It selects no customer/Auth rows or token values.

## Authorization design

Use a private administrator-membership table with owner-approved assignments and a narrowly scoped, fixed-search-path helper. End users must not edit memberships, profile identity links, issuer, roles, verified contact claims or payment state. A current-role API can inform UI navigation, but RLS/privileges independently enforce authorization. Membership revocation must invalidate current UI role results and block the next database operation.

The proposed matrix permits public published catalog reads; owner-only carts/addresses; owner/admin order reads; admin-only catalog/Storage writes; and narrowly scoped future commands for manual orders, fulfillment and cancellation. There is no blanket customer order update or client payment write. Review both `USING` and `WITH CHECK`, table and column grants, existing permissive policies, security-definer RPCs, views, Storage and Realtime exposure. [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

Do not introduce a fake role RPC or treat editable Clerk metadata as administrator authority. Existing `DEV_FORCE_ADMIN` can open development UI, not grant database privileges; it is absent from the prepared Clerk gate.

## Required public configuration

- `VITE_CLERK_PUBLISHABLE_KEY` — subsequently supplied by the owner and configured in ignored `app/.env.local`; format validated locally. Instance ownership and native integration remain unverified.
- `VITE_SUPABASE_URL` — must identify the authorized development project, not the currently unverified configured project.
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — or the existing compatible `VITE_SUPABASE_ANON_KEY` public alternative.

See `app/.env.clerk.example`. No secret/service-role/Clerk secret key belongs in a `VITE_` variable. Only the subsequently supplied public Clerk key was added to ignored `.env.local`; existing Supabase settings were preserved. The isolated test workspace uses synthetic public strings and intercepted requests. No Flutterwave key is required.

Missing Clerk settings affect only the staged setup gate. The active application continues using its existing Supabase setup screen until cutover. No fabricated credentials are inserted into the real repository configuration.

## Gates before authorized development integration

1. Owner confirms the development Supabase project ID/URL and Clerk development issuer/application; retain the explicit no-production boundary.
2. Approve metadata inspection, obtain schema/grants/policy/function/trigger/bucket export and establish backup/rollback. Confirm API exposed schemas, data types, indexes, ownership FKs and JWT claim verification.
3. Agree on synthetic accounts A/B/admin/guest and synthetic catalog/cart/order fixtures, provisioning method, allowed operations and cleanup. No real people or customer records.
4. Review schema proposals, profile linking/provisioning, admin membership authority, issuer restrictions and migration rollback before executing anything.
5. Test anon/customer/admin direct REST/Storage access, not just UI: A cannot read/write B; owner changes and role escalation fail; customers cannot alter catalog/payment/order totals; old/revoked/wrong-issuer/expired tokens fail. Verify empty response versus denied response behavior.
6. Test actual admin create/edit product round trip, stock/price changes, image upload/retrieval, cart first-write races/revisions and profile phone refresh. Validate expected SKU/compare-price columns before relying on them.
7. Complete and review one authentication cutover covering all dependencies above. Rehearse missing config, recovery, sign-out failure, multi-tab/session expiry, delayed account requests, admin revocation and returning legacy customers.
8. Rerun all regressions with synthetic Clerk sessions and intercepted external requests, then separately authorized development integration. Confirm WhatsApp still only creates a draft for `2348072105878` and preserves the cart.

## Rollback

Task 4 remains at `4b669b0`. Task 5 is uncommitted. No production/data rollback is needed now: no services or schema changed. To discard local Task 5 later, review the exact file diff and preserve any subsequent work; do not run a broad reset.

For a future database cutover, keep original IDs, links, policy/grant exports and the prior frontend artifact. Stop new writes before rollback, reconcile Clerk-only records, and restore reviewed policies/frontend together. Do not delete Clerk users or new store records to simulate rollback. Do not revert to old insecure broad grants. A reversible development rehearsal and explicit review are required before any live migration.

Beta continuation and current release status: [`BETA-READINESS.md`](BETA-READINESS.md). The injected UUID-mapping boundary is prepared only; no database mapping RPC or policy was invented or executed.
