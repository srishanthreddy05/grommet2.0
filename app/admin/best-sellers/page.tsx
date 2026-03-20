"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { listenToProducts } from "@/lib/db";
import type { Product } from "@/types";

export default function AdminBestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const selectedCount = useMemo(
    () => products.filter((product) => Boolean(product.bestSeller)).length,
    [products]
  );

  const toggleBestSeller = async (id: string, currentValue: boolean) => {
    const selected = products.filter((p) => Boolean(p.bestSeller));

    if (!currentValue && selected.length >= 4) {
      toast.error("Only 4 Best Sellers allowed");
      return;
    }

    setSavingId(id);
    try {
      await update(ref(db, `stock/${id}`), {
        bestSeller: !currentValue,
        updatedAt: Date.now(),
      });
      toast.success(!currentValue ? "Marked as Best Seller" : "Removed from Best Sellers");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update Best Seller status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Best Sellers</h1>
        <p className="text-sm text-brand-gray-400">
          Select up to 4 products to feature on homepage ({selectedCount}/4 selected)
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-brand-gray-100 bg-white p-10 text-center text-brand-gray-400">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => {
            const checked = Boolean(product.bestSeller);
            const disableToggle = Boolean(savingId) && savingId !== product.id;

            return (
              <div key={product.id} className="rounded-xl border border-brand-gray-100 bg-white p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-brand-gray-100 flex-shrink-0">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold line-clamp-2">{product.name}</p>
                    <p className="text-xs text-brand-gray-500 mt-1">INR {product.price.toLocaleString()}</p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-gray-700">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disableToggle || savingId === product.id}
                    onChange={() => toggleBestSeller(product.id, checked)}
                    className="h-4 w-4 rounded border-brand-gray-300"
                  />
                  Best Seller
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
