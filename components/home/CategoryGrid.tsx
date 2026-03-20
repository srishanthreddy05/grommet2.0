"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

const FALLBACK_CATEGORIES = [
  { id: "fallback-1", name: "Car Frames", emoji: "🚗" },
  { id: "fallback-2", name: "Phone Cases", emoji: "📱" },
  { id: "fallback-3", name: "Tumblers", emoji: "☕" },
  { id: "fallback-4", name: "Polaroids", emoji: "📸" },
  { id: "fallback-5", name: "Gifts", emoji: "🎁" },
];

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const cats = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cats.slice(0, 5).map((cat: any) => (
          <Link
            key={cat.id}
            href={`/collections/${cat.id}`}
            className="group relative bg-brand-gray-50 rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-end p-3 hover:shadow-md transition-shadow"
          >
            {(cat as any).image || categories.length > 0 ? (
              <Image
                src={(cat as any).image || "/placeholder.png"}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 20vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-4xl bg-brand-gray-100">
                {cat.emoji || "🎁"}
              </div>
            )}
            <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 w-full text-center">
              <span className="text-xs font-semibold text-brand-black line-clamp-1">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
