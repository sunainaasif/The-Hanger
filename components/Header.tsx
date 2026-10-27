"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { signOut } from "@/lib/auth-actions";

export default function Header({ userName }: { userName?: string | null }) {
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand-mark" aria-label="The Hanger home">
          the hanger<span>.</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/products">Shop all</Link>
          <Link href="/about">Our story</Link>
        </nav>
        <div className="header-actions">
          {userName ? (
            <form action={signOut} className="account-menu">
              <span className="account-name">{userName}</span>
              <button className="text-button" type="submit">Sign out</button>
            </form>
          ) : (
            <Link className="account-link" href="/login">Sign in</Link>
          )}
          <Link className="bag-link" href="/cart" aria-label={`Shopping bag, ${itemCount} items`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <span>Bag</span>
            <span className="bag-count">{itemCount}</span>
          </Link>
        </div>
      </div>
      <div className="announcement-bar">
        Complimentary shipping on orders over $100
      </div>
    </header>
  );
}
