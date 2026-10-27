"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({
  productId,
  fullWidth = false,
  soldOut = false,
}: {
  productId: string;
  fullWidth?: boolean;
  soldOut?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(productId);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      className={`button button-dark${fullWidth ? " button-full" : ""}`}
      disabled={soldOut}
      onClick={handleAdd}
      type="button"
    >
      {soldOut ? "Sold out" : added ? "Added to your bag" : "Add to bag"}
    </button>
  );
}
