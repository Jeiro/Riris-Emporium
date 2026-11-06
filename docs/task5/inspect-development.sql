-- PROPOSED READ-ONLY INSPECTION. Not executed during Task 5.
-- Run only after the owner confirms the development project identity and scope.
-- No customer rows, Auth identities, tokens or function bodies are selected.
begin transaction read only;

select n.nspname as schema_name, c.relname, c.relkind,
       c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'storage', 'private')
  and c.relkind in ('r', 'p', 'v', 'm')
order by 1, 2;

select table_schema, table_name, column_name, data_type, udt_name,
       is_nullable, is_generated, is_identity
from information_schema.columns
where table_schema = 'public'
  and table_name in ('products', 'users', 'user_addresses', 'carts', 'orders', 'payments', 'coupons', 'reviews', 'cart_items', 'order_items', 'customer_profiles')
order by table_name, ordinal_position;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage', 'private')
order by schemaname, tablename, policyname;

select table_schema, table_name, grantee, privilege_type
from information_schema.table_privileges
where table_schema in ('public', 'storage', 'private')
  and grantee in ('anon', 'authenticated', 'PUBLIC')
order by 1, 2, 3, 4;

select table_schema, table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema in ('public', 'storage', 'private')
  and grantee in ('anon', 'authenticated', 'PUBLIC')
order by 1, 2, 3, 4;

select n.nspname as schema_name, c.relname as table_name, con.conname,
       con.contype, pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'private')
order by 1, 2, 3;

select schemaname, tablename, indexname, indexdef
from pg_indexes where schemaname in ('public', 'private') order by 1, 2, 3;

select n.nspname as schema_name, c.relname as table_name, t.tgname,
       t.tgenabled, pn.nspname as function_schema, p.proname
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
join pg_namespace pn on pn.oid = p.pronamespace
where not t.tgisinternal and n.nspname in ('public', 'auth', 'storage')
order by 1, 2, 3;

-- Inspect callable functions and bypass capabilities; review bodies separately
-- in an authorized environment, without copying embedded credentials into logs.
select n.nspname as schema_name, p.proname,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as customer_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private') order by 1, 2;

select rolname, rolsuper, rolbypassrls
from pg_roles where rolname in ('anon', 'authenticated', 'service_role', 'postgres');

-- Bucket configuration only; no storage.objects rows or file contents.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'product-images';

rollback;
