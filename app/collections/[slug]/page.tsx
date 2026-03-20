import { getProductsByCategory, getCategories } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import type { Product } from "@/types";

interface Props {
  params: { slug: string };
  searchParams: { sort?: string };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  let products: Product[] = [];
  let categories: { id: string; name: string }[] = [];

  try {
    [products, categories] = await Promise.all([
      getProductsByCategory(params.slug),
      getCategories(),
    ]);
  } catch (e) {}

  const sort = searchParams.sort || "default";
  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return b.createdAt - a.createdAt;
    return 0;
  });

  const title = categories.find((c) => c.id === params.slug)?.name || "Collection";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-brand-gray-400 mt-1">{sorted.length} products</p>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href={`/collections/${params.slug}?sort=default`}
            className={`px-3 py-1.5 rounded-full border ${sort === "default" ? "bg-brand-black text-white border-brand-black" : "border-brand-gray-200"}`}
          >
            Default
          </Link>
          <Link
            href={`/collections/${params.slug}?sort=price-asc`}
            className={`px-3 py-1.5 rounded-full border ${sort === "price-asc" ? "bg-brand-black text-white border-brand-black" : "border-brand-gray-200"}`}
          >
            Price Low
          </Link>
          <Link
            href={`/collections/${params.slug}?sort=price-desc`}
            className={`px-3 py-1.5 rounded-full border ${sort === "price-desc" ? "bg-brand-black text-white border-brand-black" : "border-brand-gray-200"}`}
          >
            Price High
          </Link>
          <Link
            href={`/collections/${params.slug}?sort=newest`}
            className={`px-3 py-1.5 rounded-full border ${sort === "newest" ? "bg-brand-black text-white border-brand-black" : "border-brand-gray-200"}`}
          >
            Newest
          </Link>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-24 text-brand-gray-400">
          <p className="text-4xl mb-4">🛍️</p>
          <p className="font-medium text-lg">No products yet</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
