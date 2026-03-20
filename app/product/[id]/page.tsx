"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { getProductById } from "@/lib/db";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/types";
import toast from "react-hot-toast";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    getProductById(params.id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-brand-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h1 className="font-display text-2xl font-bold mb-2">Product not found</h1>
    </div>
  );

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
    toast.success("Added to cart!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="relative aspect-square bg-brand-gray-50 rounded-2xl overflow-hidden mb-3">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={64} className="text-brand-gray-200" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
            Category ID: {product.categoryId}
          </div>
          <h1 className="font-display text-3xl font-bold mb-4 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
            <span className="text-sm text-brand-gray-500">Stock: {product.stock}</span>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="inline-flex items-center gap-2 border border-brand-gray-200 rounded-full px-2 py-1">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-1.5 hover:bg-brand-gray-100 rounded-full">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-1.5 hover:bg-brand-gray-100 rounded-full">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-brand-black text-brand-black font-semibold py-3.5 rounded-full hover:bg-brand-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>

          {product.description && (
            <div className="border-t border-brand-gray-100 pt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-brand-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mt-6 bg-brand-gray-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center text-xs text-brand-gray-500">
            <div><div className="text-lg mb-1">🚚</div>Free Shipping</div>
            <div><div className="text-lg mb-1">📦</div>5–7 Day Delivery</div>
            <div><div className="text-lg mb-1">✅</div>100% Authentic</div>
          </div>
        </div>
      </div>
    </div>
  );
}
