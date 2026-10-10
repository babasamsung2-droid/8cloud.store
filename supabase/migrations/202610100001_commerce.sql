-- Server-only commerce data. No customer/anonymous direct table or RPC access.
create table public.commerce_products (id text primary key, data jsonb not null);
create table public.commerce_orders (
  id text primary key, uid text not null, gateway_order_id text not null unique,
  created_at timestamptz not null, data jsonb not null
);
create index commerce_orders_buyer_date on public.commerce_orders(uid, created_at desc);
create table public.commerce_assets (object_path text primary key, generation text not null, object_id text not null, last_modified text not null, sha256 text not null);
create table public.commerce_limits (id text primary key, window_id bigint not null, count integer not null);
create table public.commerce_audit (id bigint generated always as identity primary key, created_at timestamptz not null default now(), data jsonb not null);
alter table public.commerce_products enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_assets enable row level security;
alter table public.commerce_limits enable row level security;
alter table public.commerce_audit enable row level security;
revoke all on public.commerce_products, public.commerce_orders, public.commerce_assets, public.commerce_limits, public.commerce_audit from anon, authenticated;
grant all on public.commerce_products, public.commerce_orders, public.commerce_assets, public.commerce_limits, public.commerce_audit to service_role;
grant usage, select on sequence public.commerce_audit_id_seq to service_role;

create function public.commerce_save_product(p_id text, p_data jsonb, p_revision text, p_existing boolean, p_uid text)
returns void language plpgsql security invoker set search_path = '' as $$
declare old_data jsonb; exists_before boolean;
begin
  perform pg_advisory_xact_lock(hashtextextended('product:' || p_id, 0));
  select data into old_data from public.commerce_products where id = p_id for update;
  exists_before := found;
  if exists_before <> p_existing or (old_data->>'revision') is distinct from p_revision then
    raise exception 'Product changed. Reload before saving.' using errcode = 'P0002';
  end if;
  insert into public.commerce_products(id, data) values(p_id, p_data)
  on conflict(id) do update set data = excluded.data;
  insert into public.commerce_audit(data) values(jsonb_build_object('action','product.save','productId',p_id,'uid',p_uid,'revision',p_data->>'revision','active',p_data->'active'));
end;
$$;

create function public.commerce_update_payment(p_id text, p_payment text, p_status text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare value jsonb;
begin
  if p_status not in ('paid','refunded') then raise exception 'Invalid payment state'; end if;
  select data into value from public.commerce_orders where id = p_id for update;
  if not found then raise exception 'Order not found' using errcode = 'P0002'; end if;
  if value->>'paymentId' is not null and value->>'paymentId' <> p_payment then raise exception 'Payment conflict' using errcode = 'P0002'; end if;
  if value->>'status' in ('refunded','revoked') and p_status = 'paid' then return value; end if;
  value := value || jsonb_build_object('paymentId', p_payment, 'status', p_status);
  update public.commerce_orders set data = value where id = p_id;
  return value;
end;
$$;

create function public.commerce_consume_limit(p_id text, p_window bigint, p_limit integer, p_order text default null)
returns void language plpgsql security invoker set search_path = '' as $$
declare order_data jsonb; counter integer;
begin
  if p_order is not null then
    select data into order_data from public.commerce_orders where id = p_order for update;
    if not found or order_data->>'status' <> 'paid' then raise exception 'Download access was revoked' using errcode = 'P0003'; end if;
  end if;
  insert into public.commerce_limits(id, window_id, count) values(p_id,p_window,1)
  on conflict(id) do update set window_id = p_window,
    count = case when commerce_limits.window_id = p_window then commerce_limits.count + 1 else 1 end
  returning count into counter;
  if counter > p_limit then raise exception 'Rate limit reached. Try again later.' using errcode = 'P0004'; end if;
end;
$$;

revoke execute on function public.commerce_save_product(text,jsonb,text,boolean,text) from public, anon, authenticated;
revoke execute on function public.commerce_update_payment(text,text,text) from public, anon, authenticated;
revoke execute on function public.commerce_consume_limit(text,bigint,integer,text) from public, anon, authenticated;
grant execute on function public.commerce_save_product(text,jsonb,text,boolean,text) to service_role;
grant execute on function public.commerce_update_payment(text,text,text) to service_role;
grant execute on function public.commerce_consume_limit(text,bigint,integer,text) to service_role;

-- New dedicated private bucket. No storage.objects policies are added: only the API service role can access originals.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('paid-originals','paid-originals',false,26214400,array['application/octet-stream']);
