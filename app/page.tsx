import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/home/HeroSection";
import CategoryCircleSection from "@/components/home/CategoryCircleSection";
import SecondaryCategoryGrid from "@/components/home/SecondaryCategoryGrid";
import ProductRow from "@/components/home/ProductRow";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import BestsellerSection from "@/components/home/BestsellerSection";
import ReviewSection from "@/components/home/ReviewSection";
import DMSection from "@/components/home/DMSection";
import EmailSubscribe from "@/components/home/EmailSubscribe";
import { getProducts, getCategories } from "@/lib/db";

export default async function HomePage() {
  // Fetch data server-side
  let products: any[] = [];
  let categories: any[] = [];

  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
  } catch (e) {
    // Use empty arrays if Firebase not configured yet
  }

  const productByCategory = categories.map((category) => ({
    category,
    products: products.filter((product) => product.categoryId === category.id),
  }));
  const featuredCategories = categories.slice(5);
  const carFrames = categories.find(
    (c) => String(c?.name || "").trim().toLowerCase() === "car frames"
  );
  const hotWheels = categories.find(
    (c) => String(c?.name || "").trim().toLowerCase() === "hot wheels"
  );

  const carFramesHref = carFrames?.id ? `/collections/${carFrames.id}` : "/collections";
  const hotWheelsHref = hotWheels?.id ? `/collections/${hotWheels.id}` : "/collections";

  const firstCategory = productByCategory[0];
  const secondCategory = productByCategory[1];
  const thirdCategory = productByCategory[2];

  return (
    <div className="page-enter">
      {/* Top Categories - Circular Icons */}
      <CategoryCircleSection categories={categories} />

      <HeroSection collectionHref={carFramesHref} />

      {firstCategory && firstCategory.products.length > 0 && (
        <ProductRow
          title={firstCategory.category.name}
          subtitle="Latest Collection"
          products={firstCategory.products}
          viewAllHref={`/collections/${firstCategory.category.id}`}
        />
      )}

      {/* Hot Wheels Feature */}
      <HotWheelsFeature collectionHref={hotWheelsHref} />

      <MarqueeStrip
        items={["New Drop Every Month", "Delivery in 5–7 Days", "Pan-India Free Shipping"]}
      />

      {/* Bestsellers */}
      {products.length > 0 ? <BestsellerSection products={products.slice(0, 3)} /> : null}

      {secondCategory && secondCategory.products.length > 0 && (
        <ProductRow
          title={secondCategory.category.name}
          subtitle="Fresh Picks"
          products={secondCategory.products}
          viewAllHref={`/collections/${secondCategory.category.id}`}
        />
      )}

      {/* Featured Section (categories after top 5 circle section) */}
      {featuredCategories.length > 0 ? <SecondaryCategoryGrid categories={featuredCategories} /> : null}

      {/* Reviews */}
      <ReviewSection />

      {thirdCategory && thirdCategory.products.length > 0 && (
        <ProductRow
          title={thirdCategory.category.name}
          subtitle="Top Rated"
          products={thirdCategory.products}
          viewAllHref={`/collections/${thirdCategory.category.id}`}
        />
      )}

      {/* DM Screenshots */}
      <DMSection />

      <MarqueeStrip
        items={["Free Shipping on All Orders", "Order and Get in 5-7 Days", "Secure Checkout via WhatsApp"]}
        slow
      />

      <EmailSubscribe />
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

