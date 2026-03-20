import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/home/HeroSection";
import SecondaryCategoryGrid from "@/components/home/SecondaryCategoryGrid";
import ProductRow from "@/components/home/ProductRow";
import ReviewSection from "@/components/home/ReviewSection";
import DMSection from "@/components/home/DMSection";
import SplitCategorySection from "@/components/home/SplitCategorySection";
import ProductCard from "@/components/product/ProductCard";
import { getProducts, getCategories } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Category layout configuration
const CATEGORY_LAYOUT = {
  hero: ["car-frames", "hot-wheels"],
  split: ["poster-frames", "watches", "phone-cases"],
  featured: ["tshirts", "keychains", "bouquets"],
};

const SPLIT_SECTION_IMAGES: Record<string, string> = {
  "poster-frames": "/poster-split.jpeg",
  watches: "/watch-split.jpeg",
  "phone-cases": "/cases-split.jpeg",
};
export default async function HomePage() {
  // Fetch data server-side
  let products: any[] = [];
  let categories: any[] = [];

  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
  } catch (e) {
    // Use empty arrays if Firebase not configured yet
  }

  const getCategoryBySlug = (slug: string) =>
    categories.find((c) => c.slug === slug);

  const getProductsByCategory = (categoryId: string) =>
    products
      .filter((p) => p.categoryId === categoryId)
      .sort((a, b) => b.createdAt - a.createdAt);

  const featuredCategories = CATEGORY_LAYOUT.featured
    .map((slug) => getCategoryBySlug(slug))
    .filter(Boolean);

  const carFrames = getCategoryBySlug(CATEGORY_LAYOUT.hero[0]);
  const hotWheels = getCategoryBySlug(CATEGORY_LAYOUT.hero[1]);

  const carFramesHref = carFrames?.slug ? `/collections/${carFrames.slug}` : carFrames?.id ? `/collections/${carFrames.id}` : "/collections";
  const hotWheelsHref = hotWheels?.slug ? `/collections/${hotWheels.slug}` : hotWheels?.id ? `/collections/${hotWheels.id}` : "/collections";

  const renderedProductIds = new Set<string>();
  const dedupeProducts = (input: any[]) =>
    input.filter((product) => {
      if (!product?.id || renderedProductIds.has(product.id)) return false;
      renderedProductIds.add(product.id);
      return true;
    });

  const carFramesProducts = carFrames ? dedupeProducts(getProductsByCategory(carFrames.id).slice(0, 8)) : [];
  const hotWheelsProducts = hotWheels ? dedupeProducts(getProductsByCategory(hotWheels.id).slice(0, 8)) : [];

  // Split sections data
  const splitSections = CATEGORY_LAYOUT.split
    .map((slug) => {
      const category = getCategoryBySlug(slug);
      const sectionProducts = category ? dedupeProducts(getProductsByCategory(category.id)).slice(0, 2) : [];
      return {
        slug,
        category,
        image: SPLIT_SECTION_IMAGES[slug] || category?.image || "/placeholder.png",
        products: sectionProducts,
      };
    })
    .filter((section) => section.products.length > 0);

  const productsArray = Array.isArray(products)
    ? products
    : Object.entries(products || {}).map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }));

  const bestSellers = productsArray
    .filter((product) => product.bestSeller === true || product.bestSeller === "true")
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .slice(0, 4);

  console.log("Products:", productsArray);
  console.log("Best Sellers:", bestSellers);

  return (
    <div className="page-enter">
      <HeroSection collectionHref={carFramesHref} />

      {carFrames && carFramesProducts.length > 0 && (
        <ProductRow
          title={carFrames.name}
          subtitle="Latest Collection"
          products={carFramesProducts}
          viewAllHref={carFramesHref}
          theme="container"
        />
      )}

      {/* Hot Wheels Feature */}
      <HotWheelsFeature collectionHref={hotWheelsHref} />

      {/* Hot Wheels Products */}
      {hotWheelsProducts.length > 0 && (
        <ProductRow
          title="Hot Wheels"
          subtitle="Most Loved"
          products={hotWheelsProducts}
          viewAllHref={hotWheelsHref}
          theme="container"
        />
      )}

      {/* Controlled Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-200 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Bestsellers</h2>
              <p className="text-gray-500 text-sm mt-1">Sold over 150+ pieces</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Split Category Sections */}
      {splitSections.map((section, index) => (
        <SplitCategorySection
          key={section.slug}
          title={section.category?.name || ""}
          image={section.image}
          products={section.products}
          slug={section.slug}
          imagePosition={index % 2 === 0 ? "right" : "left"}
        />
      ))}

      {/* Featured Section (categories after top 5 circle section) */}
      {featuredCategories.length > 0 ? <SecondaryCategoryGrid categories={featuredCategories} /> : null}

      {/* Reviews */}
      <ReviewSection />

      {/* DM Screenshots */}
      <DMSection />
    </div>
  );
}

function HotWheelsFeature({ collectionHref }: { collectionHref: string }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative flex min-h-[320px] items-center overflow-hidden rounded-2xl bg-brand-black sm:min-h-[420px]">
        <Image
          src="/hotwheel-hero.jpeg"
          alt="Hot Wheels"
          fill
          className="object-cover opacity-60 scale-105 animate-[fadeIn_1.2s_ease-out]"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/5" />

        <div className="relative z-10 px-8 sm:px-14 py-12 max-w-xl">
          <p className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-4">
            LATEST COLLECTION
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Fan Favorite ✦<br />
            Not Just A Toy.<br />
            <span className="text-brand-gray-300">A Collector&apos;s Obsession.</span>
          </h2>
          <p className="text-brand-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
            Miniature legends crafted for speed lovers. Starting ₹499.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={collectionHref}
              className="bg-white text-brand-black px-6 py-3 rounded-full text-sm font-semibold shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:bg-brand-gray-100 hover:scale-105 transition duration-300"
            >
              Explore Collection
            </Link>
            <Link
              href="/collections"
              className="border border-brand-gray-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:border-brand-gray-400 hover:scale-105 transition duration-300"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 bottom-0 hidden h-72 w-72 rounded-full bg-white/20 blur-3xl sm:block" />
        <div className="pointer-events-none absolute right-8 top-10 hidden h-36 w-36 rounded-full bg-white/10 blur-2xl sm:block" />
        <div className="pointer-events-none absolute right-8 top-10 hidden h-28 w-28 rounded-full border border-white/25 sm:block" />
        <div className="pointer-events-none absolute right-20 top-1/2 hidden h-px w-44 bg-gradient-to-r from-transparent via-white/70 to-transparent sm:block" />
      </div>
    </section>
  );
}

