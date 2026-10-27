import CheckoutView from "@/components/CheckoutView";
import { getProducts } from "@/lib/queries/products";

export default async function CheckoutPage() {
  const products = await getProducts();
  return <CheckoutView products={products} />;
}
