import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface ProductRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
}

export default function ProductRow({ title, subtitle, products, viewAllHref }: ProductRowProps) {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            {subtitle && (
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-1">
                {subtitle}
              </p>
            )}
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
          </div>
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-brand-gray-500 hover:text-brand-black underline underline-offset-4 transition-colors hidden sm:block"
          >
            View All
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 sm:mx-0">
          <div className="flex gap-4 px-4 sm:px-0 pb-2" style={{ width: "max-content" }}>
            {products.map((product) => (
              <div key={product.id} className="w-48 sm:w-56 flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view all */}
        <div className="mt-4 sm:hidden">
          <Link
            href={viewAllHref}
            className="block text-center text-sm font-medium text-brand-gray-500 hover:text-brand-black py-2 border border-brand-gray-200 rounded-full transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
