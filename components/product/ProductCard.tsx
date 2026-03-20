"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/types";
import toast from "react-hot-toast";
import { getDiscountPercent, getSellingPrice } from "@/lib/pricing";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const sellingPrice = getSellingPrice(product);
  const discount = getDiscountPercent(product.price, product.salePrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCart();
    toast.success(`${product.name} added to cart`, {
      style: { fontSize: "13px" },
      duration: 2000,
    });
  };

  return (
    <Link href={`/product/${product.slug || product.id}`} className="product-card group block">
      <div className="relative bg-brand-gray-50 rounded-xl overflow-hidden aspect-square mb-3">
        {/* Image */}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="product-card-img object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-brand-gray-300" />
          </div>
        )}

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white text-brand-black p-2 rounded-full shadow-lg hover:bg-brand-black hover:text-white transition-all duration-200 translate-y-1 group-hover:translate-y-0"
        >
          <ShoppingBag size={16} />
        </button>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-gray-500 bg-white px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="text-sm font-medium leading-tight line-clamp-2 mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">₹{sellingPrice.toLocaleString()}</span>
          {sellingPrice < product.price ? (
            <span className="text-xs text-brand-gray-400 line-through">₹{product.price.toLocaleString()}</span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">{discount}% OFF</span>
          ) : null}
          <span className="text-xs text-brand-gray-400">Stock: {product.stock}</span>
        </div>
      </div>
    </Link>
  );
}
