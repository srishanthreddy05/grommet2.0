import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { ShoppingBag } from "lucide-react";
import { getDiscountPercent, getSellingPrice } from "@/lib/pricing";

export default function BestsellerSection({ products }: { products: Product[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
          Most Loved
        </p>
        <h2 className="font-display text-3xl font-bold">Bestsellers</h2>
        <p className="text-sm text-brand-gray-400 mt-2">Sold over 7,000+ pieces</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {products.slice(0, 3).map((product) => (
          <BestsellerCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function BestsellerCard({ product }: { product: Product }) {
  const sellingPrice = getSellingPrice(product);
  const discount = getDiscountPercent(product.price, product.salePrice);

  return (
    <div className="group bg-brand-gray-50 rounded-2xl overflow-hidden">
            <div className="aspect-square overflow-hidden relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={40} className="text-brand-gray-200" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">₹{sellingPrice.toLocaleString()}</span>
                  {sellingPrice < product.price ? (
                    <span className="text-xs text-brand-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                  ) : null}
                  {discount > 0 ? (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">{discount}% OFF</span>
                  ) : null}
                </div>
                <Link
                  href={`/product/${product.id}`}
                  className="bg-brand-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-gray-800 transition-colors"
                >
                  Buy Now
                </Link>
              </div>
            </div>
    </div>
  );
}
