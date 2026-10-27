import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(key);
}

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Builds the Stripe payment page from the saved order, never from browser data.
export async function createCheckoutSession(orderId: string, email: string) {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("order_id, total_amount, currency, order_items(product_name, unit_price, quantity)")
    .eq("order_id", orderId)
    .single();
  if (error || !order) throw new Error("Could not load the order.");

  const currency = String(order.currency).toLowerCase();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    order.order_items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount: Math.round(Number(item.unit_price) * 100),
        product_data: { name: item.product_name },
      },
    }));

  const itemsCents = lineItems.reduce(
    (sum, item) => sum + item.price_data!.unit_amount! * item.quantity!,
    0,
  );
  const shippingCents = Math.round(Number(order.total_amount) * 100) - itemsCents;
  if (shippingCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: shippingCents,
        product_data: { name: "Shipping" },
      },
    });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    client_reference_id: orderId,
    metadata: { order_id: orderId },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/cart`,
  });

  await admin
    .from("orders")
    .update({ stripe_session_id: session.id, payment_status: "pending" })
    .eq("order_id", orderId);

  if (!session.url) throw new Error("Stripe did not return a payment URL.");
  return session.url;
}

export async function releaseOrder(orderId: string) {
  await createAdminClient().rpc("release_order", { p_order_id: orderId });
}

// Idempotent: safe to call from the webhook and the success page.
export async function markSessionPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId || session.payment_status !== "paid") return false;
  const { error } = await createAdminClient()
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("order_id", orderId)
    .eq("stripe_session_id", session.id)
    .neq("payment_status", "paid")
    .neq("status", "cancelled");
  return !error;
}
