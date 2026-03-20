"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

interface SecondaryCategoryItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  href: string;
}

/* Fallback for when no categories are available from Firebase */
const FALLBACK_CATEGORIES: SecondaryCategoryItem[] = [
  {
    id: "bouquets",
    name: "Bouquets",
    description: "Beautiful flower arrangements",
    icon: "🌸",
    href: "/collections/bouquets",
  },
  {
    id: "keychains",
    name: "Keychains",
    description: "Personalized key accessories",
    icon: "🔑",
    href: "/collections/keychains",
  },
  {
    id: "tshirts",
    name: "T-shirts",
    description: "Custom printed apparel",
    icon: "👕",
    href: "/collections/tshirts",
  },
];

export default function SecondaryCategoryGrid({
  categories,
}: {
  categories?: Category[] | SecondaryCategoryItem[];
}) {
  // Convert real Firebase categories to display items. Only use fallback when prop is omitted.
  let items: SecondaryCategoryItem[] = FALLBACK_CATEGORIES;

  if (Array.isArray(categories)) {
    if (categories.length === 0) {
      items = [];
    } else {
      const firstItem = categories[0] as any;
      if ("order" in firstItem || "createdAt" in firstItem) {
        items = (categories as Category[]).map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: `Explore our ${cat.name.toLowerCase()} collection`,
          image: cat.image,
          href: `/collections/${cat.slug || cat.id}`,
        }));
      } else {
        items = categories as SecondaryCategoryItem[];
      }
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6 sm:p-8 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
            Explore More
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Featured Collections</h2>
        </div>

        {/* Grid Layout: 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group bg-brand-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image/Icon Container */}
              <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-gray-100 relative flex items-center justify-center">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon || "🎁"}
                  </span>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-brand-black mb-2 group-hover:text-brand-gray-700 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-brand-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Shop Now Button */}
                <div className="flex items-center gap-2 text-sm font-medium text-brand-black group-hover:translate-x-1 transition-transform">
                  <span>Shop Now</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
