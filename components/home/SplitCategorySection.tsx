"use client";

import { useRouter } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface SplitCategorySectionProps {
  title: string;
  image: string;
  products: Product[];
  slug: string;
  imagePosition?: "right" | "left";
}

export default function SplitCategorySection({
  title,
  image,
  products,
  slug,
  imagePosition = "right",
}: SplitCategorySectionProps) {
  const router = useRouter();
  const previewProducts = products.slice(0, 2);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4 sm:p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        <div className="rounded-2xl overflow-hidden bg-white border border-brand-gray-100 shadow-sm">
          <div className={`grid md:grid-cols-2 gap-0 items-stretch ${imagePosition === "left" ? "" : ""}`}>
            {/* IMAGE SIDE */}
            <div className={`w-full min-h-[220px] md:min-h-[420px] ${imagePosition === "left" ? "md:order-1" : "md:order-2"}`}>
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* CONTENT SIDE */}
            <div className={`p-4 sm:p-6 md:p-8 ${imagePosition === "left" ? "md:order-2" : "md:order-1"}`}>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
                Collection
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 uppercase leading-none">
                {title}
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                {previewProducts.map((product) => (
                  <div key={product.id} className="w-full">
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(`/collections/${slug}`)}
                className="w-full bg-brand-black text-white px-6 py-3 rounded-md text-sm font-semibold uppercase tracking-wide hover:bg-brand-gray-800 transition-colors"
              >
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
