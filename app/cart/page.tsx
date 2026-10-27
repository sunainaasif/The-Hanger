import CartView from "@/components/CartView";
import { getProducts } from "@/lib/queries/products";

export default async function CartPage() {
  const products = await getProducts();
  return <CartView products={products} />;
}
