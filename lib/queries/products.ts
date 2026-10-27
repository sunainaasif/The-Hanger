import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";

const PRODUCT_COLUMNS =
  "product_id, product_name, product_slug, product_description, product_price, stock_quantity, categories(category_name)";

type ProductRow = {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_description: string | null;
  product_price: number | string;
  stock_quantity: number;
  categories: { category_name: string } | { category_name: string }[] | null;
};

async function loadImages(productIds: string[]) {
  const images = new Map<string, string>();
  if (productIds.length === 0) return images;

  // product_images is optional; products still render without it.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, image_url")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });
  if (error || !data) return images;

  for (const row of data) {
    if (!images.has(row.product_id)) images.set(row.product_id, row.image_url);
  }
  return images;
}

async function toProducts(rows: ProductRow[]): Promise<Product[]> {
  const images = await loadImages(rows.map((row) => row.product_id));
  return rows.map((row) => {
    const category = Array.isArray(row.categories)
      ? row.categories[0]
      : row.categories;
    return {
      id: row.product_id,
      slug: row.product_slug,
      name: row.product_name,
      price: Number(row.product_price),
      category: category?.category_name ?? "Uncategorized",
      description: row.product_description ?? "",
      image: images.get(row.product_id) ?? null,
      stock: row.stock_quantity,
    };
  });
}

export async function getProducts(limit?: number): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("product_created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return toProducts((data ?? []) as unknown as ProductRow[]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("product_slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!data) return null;
  const [product] = await toProducts([data as unknown as ProductRow]);
  return product;
}
