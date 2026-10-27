import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link
        className="product-image-link"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <div
          className="product-image"
          role="img"
          aria-label={product.name}
          style={
            product.image
              ? { backgroundImage: `url("${product.image}")` }
              : undefined
          }
        >
          {product.stock <= 0 ? (
            <span className="product-badge">Sold out</span>
          ) : null}
        </div>
      </Link>
      <div className="product-card-info">
        <div>
          <p className="eyebrow">{product.category}</p>
          <Link className="product-name" href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </div>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>
      <AddToCartButton productId={product.id} soldOut={product.stock <= 0} />
    </article>
  );
}
