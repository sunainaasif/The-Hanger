import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { CartProvider, useCart } from "@/components/CartProvider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("cart", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.clearCart());
    window.localStorage.clear();
  });

  it("adds items and counts quantities", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem("a");
      result.current.addItem("a");
      result.current.addItem("b");
    });
    expect(result.current.items).toEqual({ a: 2, b: 1 });
    expect(result.current.itemCount).toBe(3);
  });

  it("sets a quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.setQuantity("a", 4));
    expect(result.current.items.a).toBe(4);
  });

  it("removes an item when quantity drops to zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem("a"));
    act(() => result.current.setQuantity("a", 0));
    expect(result.current.items).toEqual({});
  });

  it("ignores non-integer quantities", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem("a"));
    act(() => result.current.setQuantity("a", 1.5));
    expect(result.current.items.a).toBe(1);
  });

  it("removes and clears items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem("a");
      result.current.addItem("b");
    });
    act(() => result.current.removeItem("a"));
    expect(result.current.items).toEqual({ b: 1 });
    act(() => result.current.clearCart());
    expect(result.current.itemCount).toBe(0);
  });

  it("saves the cart to localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem("a"));
    expect(JSON.parse(window.localStorage.getItem("the-hanger-cart")!)).toEqual({
      a: 1,
    });
  });

  it("throws when used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within a CartProvider.",
    );
    spy.mockRestore();
  });
});
