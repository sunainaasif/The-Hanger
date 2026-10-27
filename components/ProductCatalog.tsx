"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ProductCatalog({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("All pieces");
  const categories = ["All pieces", ...new Set(products.map((p) => p.category))];
  const visibleProducts = useMemo(
    () =>
      category === "All pieces"
        ? products
        : products.filter((product) => product.category === category),
    [category, products],
  );

  return (
    <>
      <div className="filter-row" aria-label="Filter products by category">
        {categories.map((item) => (
          <button
            aria-pressed={category === item}
            className={`filter-chip${category === item ? " filter-chip-active" : ""}`}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {visibleProducts.length === 0 ? (
        <p className="empty-state">No pieces found in this category.</p>
      ) : null}
    </>
  );
}
