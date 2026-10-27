-- Run in the Supabase SQL Editor.

-- 1. Sample product images (safe to re-run).
insert into public.product_images (product_id, image_url, alt_text, sort_order)
select p.product_id, v.url, p.product_name, 0
from public.products p
join (values
  ('green-top',  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85'),
  ('blue-jeans', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85')
) as v(slug, url) on p.product_slug = v.slug
where not exists (
  select 1 from public.product_images i where i.product_id = p.product_id
);

-- 2. Orders need a contact email for guest checkout.
alter table public.orders add column if not exists contact_email text;

-- 3. Place an order. Prices and stock come from the database, never the browser.
create or replace function public.place_order(
  p_email text,
  p_name text,
  p_address_line1 text,
  p_city text,
  p_postal_code text,
  p_country_code text,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_shipping numeric(12, 2);
  v_item jsonb;
  v_qty integer;
  v_product public.products%rowtype;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty';
  end if;

  insert into public.orders (
    profile_id, contact_email, total_amount,
    shipping_recipient_name, shipping_address_line1, shipping_city,
    shipping_postal_code, shipping_country_code
  ) values (
    case when exists (select 1 from public.profiles where profile_id = auth.uid())
         then auth.uid() end,
    p_email, 0, p_name, p_address_line1, p_city, p_postal_code,
    upper(p_country_code)
  ) returning order_id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 50 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product from public.products
    where product_id = (v_item ->> 'product_id')::uuid
    for update;
    if not found then
      raise exception 'A product in your bag is no longer available';
    end if;
    if v_product.stock_quantity < v_qty then
      raise exception 'Not enough stock for %', v_product.product_name;
    end if;

    update public.products
    set stock_quantity = stock_quantity - v_qty
    where product_id = v_product.product_id;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product.product_id, v_product.product_name,
            v_product.product_price, v_qty);

    v_subtotal := v_subtotal + v_product.product_price * v_qty;
  end loop;

  v_shipping := case when v_subtotal >= 100 then 0 else 8 end;
  update public.orders
  set total_amount = v_subtotal + v_shipping
  where order_id = v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, text, jsonb)
  to anon, authenticated;

notify pgrst, 'reload schema';
