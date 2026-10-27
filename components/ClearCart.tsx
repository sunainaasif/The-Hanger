"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export default function ClearCart() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
