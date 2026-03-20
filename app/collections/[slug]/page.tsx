import { getProducts, getCategories } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import CollectionSortSelect from "@/components/product/CollectionSortSelect";
import { redirect } from "next/navigation";
import type { Product } from "@/types";

interface Props {
  params: { slug: string };
  searchParams: { sort?: string };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  let products: Product[] = [];
  let categories: { id: string; name: string; slug?: string }[] = [];

  try {
    [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
  } catch (e) {}

  const matchedCategory = categories.find(
    (category) => category.slug === params.slug || category.id === params.slug
  );

  if (matchedCategory?.slug && matchedCategory.slug !== params.slug) {
    const nextSort = searchParams.sort;
    redirect(nextSort ? `/collections/${matchedCategory.slug}?sort=${nextSort}` : `/collections/${matchedCategory.slug}`);
  }

  const collectionProducts = matchedCategory
    ? products.filter((product) => product.categoryId === matchedCategory.id)
    : [];

  const sort = searchParams.sort || "default";
  const sorted = [...collectionProducts].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return b.createdAt - a.createdAt;
    return 0;
  });

  const title = matchedCategory?.name || "Collection";
  const collectionSlug = matchedCategory?.slug || params.slug;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h1 className="font-display text-lg sm:text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
            {title}
          </h1>
          <CollectionSortSelect slug={collectionSlug} sort={sort} />
        </div>
        <div>
          <p className="text-sm text-brand-gray-400 mt-1">{sorted.length} products</p>
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
