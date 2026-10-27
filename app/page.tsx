import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/queries/products";

export default async function Home() {
  const featured = await getProducts(3);
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A little more you, every day</p>
          <h1>Good clothes.<br />Good days.</h1>
          <p className="hero-description">
            Thoughtful pieces for wherever the day takes you. Meet your new
            everyday favorites.
          </p>
          <Link className="button button-dark" href="/products">
            Shop the collection
          </Link>
          <p className="hero-note">Easy to wear. Made to live in.</p>
        </div>
        <div
          className="hero-image"
          role="img"
          aria-label="A relaxed everyday look from The Hanger"
        />
        <div className="hero-stamp" aria-hidden="true">
          <span>YOUR</span>
          <span>EVERYDAY</span>
          <span>WARDROBE</span>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Made for your real life</p>
            <h2>Meet the good ones</h2>
          </div>
          <Link className="text-link" href="/products">
            Shop all pieces <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="product-grid home-product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="brand-note">
        <p className="eyebrow">The Hanger, in a nutshell</p>
        <h2>Less figuring out what to wear.<br />More feeling like yourself.</h2>
        <Link className="text-link" href="/about">
          A little about us <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
