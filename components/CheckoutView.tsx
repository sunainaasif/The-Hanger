"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { placeOrder } from "@/app/checkout/actions";
import { formatPrice, type Product } from "@/lib/products";

export default function CheckoutView({ products }: { products: Product[] }) {
  const { items } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cartItems = products.filter((product) => items[product.id]);
  const subtotal = cartItems.reduce(
    (total, product) => total + product.price * items[product.id],
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (key: string) => String(form.get(key) ?? "");
    setSubmitting(true);
    setError(null);
    const result = await placeOrder({
      email: field("email"),
      name: `${field("firstName")} ${field("lastName")}`.trim(),
      address: field("address"),
      city: field("city"),
      postalCode: field("postalCode"),
      country: field("country"),
      items,
    });
    if (result.ok) {
      window.location.assign(result.url);
      return;
    }
    setSubmitting(false);
    setError(result.error);
  }

  if (cartItems.length === 0) {
    return (
      <main className="page-shell confirmation-page">
        <p className="eyebrow">Checkout</p>
        <h1>Your bag is empty.</h1>
        <p>Add a few favorites before heading to checkout.</p>
        <Link className="button button-dark" href="/products">
          Shop the collection
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell checkout-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Almost yours</p>
          <h1>Checkout</h1>
        </div>
        <Link className="text-link" href="/cart">← Back to bag</Link>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="demo-notice">
            Test mode — pay with Stripe test card 4242 4242 4242 4242, any future date and CVC.
          </div>
          <section className="form-section">
            <h2>Contact</h2>
            <label className="form-field">
              Email address
              <input autoComplete="email" name="email" required type="email" />
            </label>
          </section>
          <section className="form-section">
            <h2>Shipping address</h2>
            <div className="form-grid">
              <label className="form-field">
                First name
                <input autoComplete="given-name" name="firstName" required />
              </label>
              <label className="form-field">
                Last name
                <input autoComplete="family-name" name="lastName" required />
              </label>
            </div>
            <label className="form-field">
              Address
              <input autoComplete="street-address" name="address" required />
            </label>
            <div className="form-grid">
              <label className="form-field">
                City
                <input autoComplete="address-level2" name="city" required />
              </label>
              <label className="form-field">
                Postal code
                <input autoComplete="postal-code" name="postalCode" required />
              </label>
            </div>
            <label className="form-field">
              Country / region
              <select autoComplete="country-name" name="country" defaultValue="" required>
                <option disabled value="">Select a country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
              </select>
            </label>
          </section>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button
            className="button button-dark button-full"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Redirecting to payment…" : "Continue to payment"}
          </button>
        </form>
        <aside className="order-summary checkout-summary">
          <h2>Your order</h2>
          {cartItems.map((product) => (
            <div className="checkout-item" key={product.id}>
              <div
                className="checkout-thumb"
                style={
                  product.image
                    ? { backgroundImage: `url("${product.image}")` }
                    : undefined
                }
              />
              <span className="checkout-item-name">
                {product.name}<small>Qty {items[product.id]}</small>
              </span>
              <strong>{formatPrice(product.price * items[product.id])}</strong>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span><strong>{formatPrice(subtotal + shipping)}</strong>
          </div>
          <p className="summary-note">Taxes, if applicable, are not included.</p>
        </aside>
      </div>
    </main>
  );
}
