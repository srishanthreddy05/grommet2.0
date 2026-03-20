"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

const TOP_CATEGORIES = [
  { id: "hotWheels", name: "Hot Wheels", icon: "🔥", color: "from-red-100 to-orange-100" },
  { id: "carFrames", name: "Car Frames", icon: "🚗", color: "from-blue-100 to-cyan-100" },
  { id: "phoneCases", name: "Phone Cases", icon: "📱", color: "from-purple-100 to-pink-100" },
  { id: "posterFrames", name: "Poster Frames", icon: "🖼️", color: "from-amber-100 to-yellow-100" },
  { id: "watches", name: "Watches", icon: "⌚", color: "from-slate-100 to-gray-100" },
];

interface CategoryCircleItem {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  color?: string;
}

export default function CategoryCircleSection({
  categories,
}: {
  categories?: Category[];
}) {
  const items: CategoryCircleItem[] = categories
    ? (
        console.log(`[CategoryCircleSection] Received ${categories.length} categories:`, categories.map(c => ({ name: c.name, hasImage: !!c.image }))),
        categories.slice(0, 5).map((cat) => ({
          id: cat.id,
          name: cat.name,
          image: cat.image,
          color: "from-slate-100 to-gray-100",
        }))
      )
    : TOP_CATEGORIES;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
          Shop By Category
        </p>
        <h2 className="font-display text-2xl font-bold">Popular Categories</h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex justify-center">
        <div className="overflow-x-auto scrollbar-hide w-full sm:w-auto">
          <div className="flex gap-6 sm:gap-8 justify-center px-4 sm:px-0 pb-2 min-w-max sm:min-w-0">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/collections/${item.id}`}
                className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* Circular Container */}
                <div className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br ${item.color}`}>
                  {categories && categories.length > 0 ? (
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="text-3xl">{item.icon || "🎁"}</span>
                  )}
                </div>

                {/* Label */}
                <span className="text-xs font-medium text-center max-w-[80px] line-clamp-2 text-brand-gray-700">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hide Scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
