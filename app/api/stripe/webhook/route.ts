import type Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  getStripe,
  markSessionPaid,
  releaseOrder,
} from "@/lib/stripe-checkout";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await markSessionPaid(session);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      if (session.metadata?.order_id) await releaseOrder(session.metadata.order_id);
      break;
  }

  return NextResponse.json({ received: true });
}
