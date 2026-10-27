import Link from "next/link";
import ClearCart from "@/components/ClearCart";
import { getStripe, markSessionPaid } from "@/lib/stripe-checkout";

export const metadata = { title: "Order confirmation" };

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const { session_id: sessionId } = await searchParams;

  let paid = false;
  let reference: string | null = null;
  if (typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      // Confirms with Stripe directly, so this also works without the webhook.
      paid = session.payment_status === "paid";
      if (paid) {
        await markSessionPaid(session);
        reference = (session.metadata?.order_id ?? "").slice(0, 8).toUpperCase();
      }
    } catch {
      paid = false;
    }
  }

  if (!paid) {
    return (
      <main className="page-shell confirmation-page">
        <p className="eyebrow">Payment</p>
        <h1>We couldn&apos;t confirm your payment.</h1>
        <p>
          If you were charged, your order will be confirmed shortly. Otherwise
          you can head back to your bag and try again.
        </p>
        <Link className="button button-dark" href="/cart">
          Back to your bag
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell confirmation-page">
      <ClearCart />
      <p className="eyebrow">Thank you</p>
      <h1>Your order is confirmed.</h1>
      <p>Order reference: {reference}. Your payment was received.</p>
      <Link className="button button-dark" href="/products">
        Keep shopping
      </Link>
    </main>
  );
}
