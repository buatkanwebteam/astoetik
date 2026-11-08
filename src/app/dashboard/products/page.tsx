import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { CATEGORY_LABEL } from "@/data/products";
import { ProductDatabase } from "@/components/catalog/ProductDatabase";

export const metadata: Metadata = { title: "Katalog Produk" };

export default async function ProductsPage() {
  const db = getDb();
  const products = await db.listProducts();

  return (
    <div className="mx-auto max-w-[96rem]">
      <ProductDatabase
        products={products}
        categoryLabel={CATEGORY_LABEL}
      />
    </div>
  );
}
