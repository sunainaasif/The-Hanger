"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type CartContextValue = {
  items: Record<string, number>;
  itemCount: number;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "the-hanger-cart";
const EMPTY_CART: Record<string, number> = {};

function parseCart(value: string | null): Record<string, number> {
  if (!value) return {};
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  return Object.entries(parsed).reduce<Record<string, number>>(
    (cart, [id, quantity]) => {
      if (
        id.length > 0 &&
        id.length <= 64 &&
        typeof quantity === "number" &&
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        cart[id] = quantity;
      }
      return cart;
    },
    {},
  );
}

function loadCart(): Record<string, number> {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    return parseCart(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.error("Could not load the saved cart.", error);
    return EMPTY_CART;
  }
}

let cartSnapshot = loadCart();
const listeners = new Set<() => void>();

function getCartSnapshot() {
  return cartSnapshot;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      cartSnapshot = parseCart(event.newValue);
      listeners.forEach((notify) => notify());
    } catch (error) {
      console.error("Could not load the updated saved cart.", error);
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function updateCart(update: (current: Record<string, number>) => Record<string, number>) {
  cartSnapshot = update(cartSnapshot);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartSnapshot));
  } catch (error) {
    console.error("Could not save the cart.", error);
  }
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribe,
    getCartSnapshot,
    getServerSnapshot,
  );
  const addItem = (productId: string) => {
    updateCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  };
  const removeItem = (productId: string) => {
    updateCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };
  const setQuantity = (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity)) return;
    if (quantity <= 0) {
      updateCart((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
      return;
    }
    updateCart((current) => ({ ...current, [productId]: quantity }));
  };
  const clearCart = () => updateCart(() => ({}));

  const itemCount = Object.values(items).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, addItem, removeItem, setQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
