-- Read-only checks; every row should be PASS.
select 'private bucket' as check_name, case when public=false then 'PASS' else 'FAIL' end as result
from storage.buckets where id='paid-originals'
union all
select '5 tables with RLS', case when count(*)=5 then 'PASS' else 'FAIL' end
from pg_class where relname in ('commerce_products','commerce_orders','commerce_assets','commerce_limits','commerce_audit') and relrowsecurity
union all
select 'anonymous order access denied', case when not has_table_privilege('anon','public.commerce_orders','SELECT') then 'PASS' else 'FAIL' end
union all
select 'customer payment RPC denied', case when not has_function_privilege('authenticated','public.commerce_update_payment(text,text,text)','EXECUTE') then 'PASS' else 'FAIL' end;
