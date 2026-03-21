"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { listenToCategories } from "@/lib/db";
import type { Category } from "@/types";

export default function CategoryCircleSection() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubscribe = listenToCategories((items) => setCategories(Array.isArray(items) ? items : []));
    return () => unsubscribe();
  }, []);

  const topCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => {
        const aOrder = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
        const bOrder = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return Number(b.createdAt || 0) - Number(a.createdAt || 0);
      })
      .slice(0, 5);
  }, [categories]);

  if (topCategories.length === 0) return null;

  return (
    <section className="border-b border-brand-gray-100">
      <div className="max-w-7xl mx-auto overflow-x-auto lg:overflow-visible hide-scrollbar px-4 py-3">
        <div className="flex min-w-max lg:min-w-0 items-start gap-4 sm:gap-6 lg:justify-center">
          {topCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => router.push(`/collections/${category.slug || category.id}`)}
              className="flex flex-col items-center text-center focus:outline-none"
              aria-label={`Open ${category.name}`}
            >
              <div className="relative h-[70px] w-[70px] sm:h-[90px] sm:w-[90px] overflow-hidden rounded-full border border-brand-gray-200 bg-brand-gray-100 transition-transform duration-200 hover:scale-105 hover:shadow-md">
                <Image
                  src={category.image || "/placeholder.png"}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 90px, 70px"
                />
              </div>
              <span className="mt-2 w-[72px] sm:w-[94px] truncate text-xs sm:text-sm text-brand-gray-700">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
