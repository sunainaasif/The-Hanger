import { formatPrice } from "@/lib/products";
import { getProductBySlug } from "@/lib/queries/products";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="product-detail page-shell">
      <div className="detail-image-wrap">
        <div
          className="detail-image"
          role="img"
          aria-label={product.name}
          style={
            product.image
              ? { backgroundImage: `url("${product.image}")` }
              : undefined
          }
        />
      </div>
      <div className="detail-copy">
        <Link className="back-link" href="/products">
          ← Back to the collection
        </Link>
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="detail-price">{formatPrice(product.price)}</p>
        <p className="detail-description">{product.description}</p>
        <p className="availability-note">Available in sizes XS–XL</p>
        <AddToCartButton
          productId={product.id}
          soldOut={product.stock <= 0}
          fullWidth
        />
        <p className="detail-footnote">
          A considered piece, made to find its way into your everyday rotation.
        </p>
      </div>
    </main>
  );
}
