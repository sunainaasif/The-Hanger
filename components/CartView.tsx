"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice, type Product } from "@/lib/products";

export default function CartView({ products }: { products: Product[] }) {
  const { items, setQuantity, removeItem } = useCart();
  const cartItems = products.filter((product) => items[product.id]);
  const subtotal = cartItems.reduce(
    (total, product) => total + product.price * items[product.id],
    0,
  );
  const totalQuantity = Object.values(items).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8;

  return (
    <main className="page-shell cart-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Your picks, all in one place</p>
          <h1>Your bag<span className="title-count"> ({totalQuantity})</span></h1>
        </div>
        <Link className="text-link" href="/products">
          Keep browsing <span aria-hidden="true">→</span>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-bag-icon" aria-hidden="true">TH</div>
          <h2>Your bag is taking a little break.</h2>
          <p>Find something you love and it will be waiting here.</p>
          <Link className="button button-dark" href="/products">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Items in your bag">
            {cartItems.map((product) => (
              <article className="cart-item" key={product.id}>
                <Link
                  className="cart-item-image"
                  href={`/products/${product.slug}`}
                  style={
                    product.image
                      ? { backgroundImage: `url("${product.image}")` }
                      : undefined
                  }
                  aria-label={`View ${product.name}`}
                />
                <div className="cart-item-details">
                  <p className="eyebrow">{product.category}</p>
                  <Link className="product-name" href={`/products/${product.slug}`}>
                    {product.name}
                  </Link>
                  <p className="product-price">{formatPrice(product.price)}</p>
                  <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(product.id, items[product.id] - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span>{items[product.id]}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(product.id, items[product.id] + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <p className="product-price">
                    {formatPrice(product.price * items[product.id])}
                  </p>
                  <button
                    className="remove-link"
                    onClick={() => removeItem(product.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <div className="summary-line">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
            </div>
            <div className="summary-total">
              <span>Estimated total</span>
              <strong>{formatPrice(subtotal + shipping)}</strong>
            </div>
            <p className="summary-note">Taxes, if applicable, are not included.</p>
            <Link className="button button-dark button-full" href="/checkout">
              Continue to checkout
            </Link>
            <p className="shipping-note">
              {subtotal >= 100
                ? "You have complimentary shipping."
                : `Add ${formatPrice(100 - subtotal)} for complimentary shipping.`}
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
