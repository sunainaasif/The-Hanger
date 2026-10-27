import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { CartProvider, useCart } from "@/components/CartProvider";
import ProductCard from "@/components/ProductCard";
import CartView from "@/components/CartView";
import type { Product } from "@/lib/products";

const product: Product = {
  id: "p1",
  slug: "green-top",
  name: "Green Top",
  price: 10.2,
  category: "Tops",
  description: "A green top",
  image: null,
  stock: 5,
};

function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function ResetCart() {
  const { clearCart } = useCart();
  return <button onClick={clearCart}>reset</button>;
}

describe("storefront components", () => {
  beforeEach(async () => {
    const { unmount } = render(<ResetCart />, { wrapper: Providers });
    await userEvent.click(screen.getByText("reset"));
    unmount();
  });

  it("ProductCard shows name, price, category and a detail link", () => {
    render(<ProductCard product={product} />, { wrapper: Providers });
    expect(screen.getByText("Green Top")).toBeInTheDocument();
    expect(screen.getByText("$10.20")).toBeInTheDocument();
    expect(screen.getByText("Tops")).toBeInTheDocument();
    expect(screen.getByText("Green Top").closest("a")).toHaveAttribute(
      "href",
      "/products/green-top",
    );
  });

  it("ProductCard disables add-to-bag when sold out", () => {
    render(<ProductCard product={{ ...product, stock: 0 }} />, {
      wrapper: Providers,
    });
    expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
  });

  it("CartView shows the empty state", () => {
    render(<CartView products={[product]} />, { wrapper: Providers });
    expect(screen.getByText(/your bag is taking a little break/i)).toBeInTheDocument();
  });

  it("adding a product updates the cart total", async () => {
    render(
      <>
        <ProductCard product={product} />
        <CartView products={[product]} />
      </>,
      { wrapper: Providers },
    );
    await userEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    // 2 x $10.20 = $20.40 subtotal; under $100 so shipping applies.
    expect(screen.getAllByText("$20.40").length).toBeGreaterThan(0);
    expect(screen.getByText("$8.00")).toBeInTheDocument();
    expect(screen.getByText("$28.40")).toBeInTheDocument();
  });
});
