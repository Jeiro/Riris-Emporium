/*
TASK 5 CLERK MIGRATION REVIEW DRAFT — ENTIRE FILE IS COMMENTED OUT.
No executable SQL. Not a migration; no statements have been applied or DB-tested.
Supersedes the initial Supabase-Auth-only draft, preserved outside the repository
under riris-task5-work/pre-clerk-audit.

PRECONDITIONS
Confirm authorized development project and Clerk issuer, export schema/grants/RLS,
inspect triggers/functions/views/Storage, approve explicit account links and backup.
Reconcile ALL prior policies and table/column/inherited grants. Permissive policies
combine; adding these examples without removing incompatible grants/policies is unsafe.
Do not trust user_metadata, unsafeMetadata, localStorage or the UI role flag.

PREFERRED STRATEGY: ADDITIVE PROFILE LINKS, PRESERVE LEGACY UUID RELATIONSHIPS
Clerk subjects are text. Never cast auth.jwt()->>'sub' to uuid or rewrite user_id.
Existing public.users may reference auth.users; a new profile table avoids requiring
fake Supabase Auth accounts for new Clerk users. Actual schema must be inspected first.

-- Candidate DDL only; names/types subject to reviewed schema export.
create table public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_subject text not null unique,
  legacy_user_id uuid unique references public.users(id),
  name text not null default '',
  last_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;
revoke all on public.customer_profiles from public, anon, authenticated;
grant select on public.customer_profiles to authenticated;
grant update (name, last_name, phone) on public.customer_profiles to authenticated;

-- Replace the issuer marker only after an explicit project/issuer review.
-- Token signature/issuer validation is configured in native Supabase third-party auth.
create policy profile_read_self on public.customer_profiles for select to authenticated
using (clerk_subject = (select auth.jwt()->>'sub')
  and (select auth.jwt()->>'iss') = '<REVIEWED_CLERK_ISSUER>');
create policy profile_update_self on public.customer_profiles for update to authenticated
using (clerk_subject = (select auth.jwt()->>'sub')
  and (select auth.jwt()->>'iss') = '<REVIEWED_CLERK_ISSUER>')
with check (clerk_subject = (select auth.jwt()->>'sub')
  and (select auth.jwt()->>'iss') = '<REVIEWED_CLERK_ISSUER>');

No browser insert/linking grant: profile creation/linking needs a trusted, idempotent
onboarding command. Verify identity from the token; never accept a requested legacy
UUID or admin flag. Do not automatically link on email equality. Plan and test that
command only once schema and identity proof requirements have been reviewed.

-- Private helper returns one stable application profile ID, no arbitrary inputs.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create function private.current_customer_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.customer_profiles p
  where p.clerk_subject = (select auth.jwt()->>'sub')
    and (select auth.jwt()->>'iss') = '<REVIEWED_CLERK_ISSUER>';
$$;
revoke all on function private.current_customer_id() from public, anon;
grant execute on function private.current_customer_id() to authenticated;

Helper owner must be trusted with sufficient table access. Private schema must not be
exposed through the Data API. Review every SECURITY DEFINER function and search_path.

-- Candidate additional columns; retain old user_id and all current FKs unchanged.
alter table public.carts add column customer_id uuid references public.customer_profiles(id);
alter table public.orders add column customer_id uuid references public.customer_profiles(id);
alter table public.user_addresses add column customer_id uuid references public.customer_profiles(id);

Backfill only via approved, verified one-to-one profile links. Audit counts, ambiguous
matches, duplicate carts and orphan records before setting NOT NULL or uniqueness.
No backfill UPDATE statements provided: no actual schema or mappings were authorized.
Legacy user_id NOT NULL / auth.users FK constraints may block new Clerk-only rows;
that compatibility decision is a cutover blocker. Do not drop them blindly.
Payments/reviews/cart_items/order_items get equivalent additions only IF inspection
confirms the tables and ownership relations. Current app uses JSON carts.items and
orders.items, not cart_items/order_items tables. Product/order IDs may remain UUIDs.

-- Illustrative carts policies AFTER reconciled grants/policies and column migration.
alter table public.carts enable row level security;
revoke all on public.carts from public, anon, authenticated;
grant select, insert, update on public.carts to authenticated;
create policy clerk_cart_read on public.carts for select to authenticated
using (customer_id = (select private.current_customer_id()));
create policy clerk_cart_insert on public.carts for insert to authenticated
with check (customer_id = (select private.current_customer_id()));
create policy clerk_cart_update on public.carts for update to authenticated
using (customer_id = (select private.current_customer_id()))
with check (customer_id = (select private.current_customer_id()));
-- No DELETE grant needed for current clear-cart operation (items becomes []).
create unique index carts_customer_unique on public.carts(customer_id) where customer_id is not null;

Owner checks protect both old and new row images. Explicit editable-column grants
should replace broad grants once columns are verified. Prevent changing legacy owner
links and audit timestamps through the client. Add JSON-array/quantity checks and
nonnegative numeric totals after validating rows. Unique-conflict reload and a trusted
revision/updated_at change on every write are required by current optimistic updates.
For concurrent tabs prefer an atomic mutation API. Cart totals never authorize payment.

TRUSTED ADMIN AUTHORITY
create table private.store_admins (
  customer_id uuid primary key references public.customer_profiles(id)
);
alter table private.store_admins enable row level security;
revoke all on private.store_admins from public, anon, authenticated;
create function private.is_store_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.store_admins
    where customer_id = (select private.current_customer_id()));
$$;
revoke all on function private.is_store_admin() from public, anon;
grant execute on function private.is_store_admin() to authenticated;

Admin assignments require separate owner approval, never signup metadata or client
profile updates. A future current-role API can return only the caller's role for UI
navigation; database policies independently enforce authority on every operation.
Do not blindly copy existing public.users.role values. Do not use Clerk org:admin as
global store admin without a reviewed organization/tenant design.

RESOURCE POLICY MATRIX (complete before migration)
- customer_profiles: self read/whitelisted update; admin read for verified support
  needs through a constrained view/command. No browser identity/link/role edits.
- addresses: self SELECT/INSERT/UPDATE/DELETE, both USING and WITH CHECK for updates.
- products: public read only published catalog fields; trusted admins write. Inspect
  publication field before using it (current mapper assumes active=true). Candidate
  is_active requires explicit backfill/publication review, never automatic publication.
  Unify flat image/stock/featured/compare_at_price/sku contract first. Decide gallery,
  low-stock threshold, archival/deletion, price/stock constraints and SKU uniqueness.
- orders: owner SELECT via customer_id, admin SELECT via private.is_store_admin().
  No customer INSERT/UPDATE/DELETE, including arbitrary cancellation or amount/status
  changes. Later narrow customer-cancel/admin-record/admin-fulfill commands validate
  transitions, idempotency, actor/time and allowed columns. Browser WhatsApp open
  cannot insert an order or mark paid. No such RPC is implemented in this proposal.
- payments: no client writes/refunds. If historical reads are needed, verify ownership
  through customer_id/order relationship and expose safe fields only. No raw provider
  payloads or secrets. Manual payment records must not pretend to be provider settlement.
- coupons: currently flat client lookup; replace with narrow validation before treating
  a discount as confirmed. Review enumeration, expiry, limits and currency semantics.
- reviews: author identity default/command, product FK, rating 1..5 and moderation.
  Current insert omits owner. No anonymous blanket insert to compensate.

STORAGE
Inspect product-images bucket configuration and all storage.objects policies. Public
bucket downloads remain public regardless of object SELECT policies; no customer data
belongs there. Object INSERT/UPDATE/DELETE must require trusted admin AND bucket_id =
'product-images' AND (storage.foldername(name))[1] = 'products'. UPDATE needs USING
and WITH CHECK; admin listing needs SELECT. Review bucket file-size/MIME limits.
Do not assume owner_id stores a UUID: inspect Clerk compatibility before relying on
storage ownership. Do not alter provider-managed Storage schemas/grants blindly.

MANUAL WHATSAPP ORDERS (future design only)
Stable id/reference, source=manual_whatsapp, optional customer link, restricted
contact/delivery snapshot, catalog/item quantity/price snapshot, currency, confirmed
subtotal/discount/delivery/tax/total, separate payment and fulfillment statuses,
recorded_by/time, audit events, idempotency and inventory adjustment policy.
No automatic confirmed/paid record on handoff. No migrations or payment commands now.

ROLLBACK
Keep original Auth users, columns and relationships. Retain original policy/grant
export and deployment checkpoint. Gate cutover until reversible development rehearsal.
Disable Clerk routes/writes and restore prior reviewed frontend/policies if needed;
never drop new records/columns as an automatic rollback. Reconcile Clerk-only orders
and users before any return to legacy-only writes. Mappings must be auditable and
reversible; quarantine ambiguous links, do not guess or erase them.
*/
