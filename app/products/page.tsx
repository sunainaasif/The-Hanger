import ProductCatalog from "@/components/ProductCatalog";
import { getProducts } from "@/lib/queries/products";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">The collection</p>
        <h1>Pieces to live in.</h1>
        <p>
          Thoughtful staples, easy layers, and the little things that make
          getting dressed feel good.
        </p>
      </section>
      <ProductCatalog products={products} />
    </main>
  );
}
