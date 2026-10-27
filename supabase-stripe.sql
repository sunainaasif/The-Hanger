-- Run in the Supabase SQL Editor (safe to re-run).

alter table public.orders add column if not exists stripe_session_id text unique;

-- Cancels an unpaid order and returns its stock. Server (service role) only.
create or replace function public.release_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found uuid;
begin
  update public.orders
  set status = 'cancelled'
  where order_id = p_order_id
    and payment_status <> 'paid'
    and status <> 'cancelled'
  returning order_id into v_found;

  if v_found is null then
    return;
  end if;

  update public.products p
  set stock_quantity = p.stock_quantity + oi.quantity
  from public.order_items oi
  where oi.order_id = p_order_id and oi.product_id = p.product_id;
end;
$$;

revoke all on function public.release_order(uuid) from public, anon, authenticated;
grant execute on function public.release_order(uuid) to service_role;

notify pgrst, 'reload schema';
