"use client";

import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { Search } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

type RawProduct = {
  slug?: string;
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number | null;
  categoryId?: string;
  category?: string;
  imageUrl?: string;
  displayImage?: string;
  mainImage?: string;
  images?: string[];
  stock?: number;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
};

function mapSearchProduct(id: string, raw: RawProduct): Product {
  return {
    id,
    slug: String(raw?.slug || "").trim() || id,
    name: String(raw?.name || "Untitled Product"),
    description: String(raw?.description || ""),
    price: Number(raw?.price || 0),
    salePrice:
      typeof raw?.salePrice === "number"
        ? Number(raw.salePrice)
        : raw?.salePrice
          ? Number(raw.salePrice)
          : null,
    categoryId: String(raw?.categoryId || raw?.category || ""),
    imageUrl: String(raw?.imageUrl || raw?.displayImage || raw?.mainImage || raw?.images?.[0] || ""),
    stock: Number(raw?.stock || 0),
    tags: Array.isArray(raw?.tags)
      ? raw.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    createdAt: Number(raw?.createdAt || Date.now()),
    updatedAt: raw?.updatedAt ? Number(raw.updatedAt) : undefined,
  };
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearchInput = () => {
      const section = document.getElementById("product-search");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    };

    const onOpenSearch = () => focusSearchInput();

    window.addEventListener("open-product-search", onOpenSearch);

    if (window.location.hash === "#product-search") {
      focusSearchInput();
    }

    return () => {
      window.removeEventListener("open-product-search", onOpenSearch);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const productsRef = ref(db, "stock");
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const mapped = Object.entries(snapshot.val() as Record<string, RawProduct>)
          .map(([id, raw]) => mapSearchProduct(id, raw))
          .sort((a, b) => b.createdAt - a.createdAt);

        setProducts(mapped);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) {
      return products;
    }

    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(debouncedQuery);
      const tagMatch = (product.tags || []).some((tag) => tag.toLowerCase().includes(debouncedQuery));
      return nameMatch || tagMatch;
    });
  }, [products, debouncedQuery]);

  return (
    <section id="product-search" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-brand-gray-100 bg-white p-4 sm:p-5">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-brand-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-black"
          />
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="text-sm text-brand-gray-400">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-brand-gray-500">No results found</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
