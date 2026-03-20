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

  const firstCategory = productByCategory[0];
  const secondCategory = productByCategory[1];
  const thirdCategory = productByCategory[2];

  return (
    <div className="page-enter">
      {/* Top Categories - Circular Icons */}
      <CategoryCircleSection categories={categories} />

      <HeroSection />

      {firstCategory && firstCategory.products.length > 0 && (
        <ProductRow
          title={firstCategory.category.name}
          subtitle="Latest Collection"
          products={firstCategory.products}
          viewAllHref={`/collections/${firstCategory.category.id}`}
        />
      )}

      {/* Polaroid Magnets Feature */}
      <PolaroidFeature />

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

// Placeholder feature section
function PolaroidFeature() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative bg-brand-gray-50 rounded-2xl overflow-hidden h-64 sm:h-80 flex items-center">
        <div className="p-8 sm:p-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
            🧲 ✨ Your Memories
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Your Memories,<br />Now Magnetic.
          </h2>
          <a
            href="/collections/fridge-magnets"
            className="inline-flex items-center gap-2 bg-brand-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-gray-800 transition-colors"
          >
            Create Yours
          </a>
        </div>
      </div>
    </section>
  );
}

