"use server";

import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, releaseOrder } from "@/lib/stripe-checkout";

export type PlaceOrderResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const COUNTRIES = new Set(["US", "CA", "GB"]);
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function placeOrder(input: {
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  items: Record<string, number>;
}): Promise<PlaceOrderResult> {
  const email = input.email.trim();
  const name = input.name.trim();
  const address = input.address.trim();
  const city = input.city.trim();
  const postalCode = input.postalCode.trim();

  if (!email || !name || !address || !city || !postalCode) {
    return { ok: false, error: "Please fill in all required fields." };
  }
  if (!COUNTRIES.has(input.country)) {
    return { ok: false, error: "Please choose a valid country." };
  }

  const items = Object.entries(input.items)
    .filter(
      ([id, quantity]) =>
        UUID.test(id) && Number.isInteger(quantity) && quantity > 0,
    )
    .map(([product_id, quantity]) => ({ product_id, quantity }));
  if (items.length === 0) {
    return { ok: false, error: "Your bag is empty." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_email: email,
    p_name: name,
    p_address_line1: address,
    p_city: city,
    p_postal_code: postalCode,
    p_country_code: input.country,
    p_items: items,
  });

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "We couldn't place your order. Please try again.",
    };
  }
  const orderId = data as string;
  try {
    const url = await createCheckoutSession(orderId, email);
    return { ok: true, url };
  } catch {
    await releaseOrder(orderId).catch(() => {});
    return {
      ok: false,
      error: "We couldn't start the payment. Please try again.",
    };
  }
}
