"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { get, ref } from "firebase/database";
import { db } from "@/lib/firebase";

type SearchableProduct = {
  id: string;
  slug?: string;
  name: string;
  tags: string[];
  category: string;
  image: string;
};

type RawProduct = {
  slug?: string;
  name?: string;
  tags?: string[];
  category?: string;
  categoryId?: string;
  image?: string;
  imageUrl?: string;
  displayImage?: string;
  mainImage?: string;
  images?: string[];
  album?: {
    name?: string;
    tags?: string[];
    category?: string;
    image?: string;
    imageUrl?: string;
    displayImage?: string;
    mainImage?: string;
    images?: string[];
  };
};

const PAGES = [
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
  { label: "Login", href: "/login" },
];

function mapProduct(id: string, raw: RawProduct): SearchableProduct {
  const source = raw?.album && typeof raw.album === "object" ? { ...raw, ...raw.album } : raw;
  return {
    id,
    slug: String(source?.slug || "").trim() || id,
    name: String(source?.name || "Untitled Product"),
    tags: Array.isArray(source?.tags)
      ? source.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    category: String(source?.category || source?.categoryId || "").trim(),
    image: String(
      source?.image || source?.imageUrl || source?.displayImage || source?.mainImage || source?.images?.[0] || ""
    ),
  };
}

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchableProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("open-product-search", onOpen);
    return () => window.removeEventListener("open-product-search", onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || hasLoadedRef.current) return;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const productsSnap = await get(ref(db, "products"));

        if (productsSnap.exists()) {
          const mappedProducts = Object.entries(productsSnap.val() as Record<string, RawProduct>).map(([id, raw]) =>
            mapProduct(id, raw)
          );
          setProducts(mappedProducts);
          hasLoadedRef.current = true;
          return;
        }

        const stockSnap = await get(ref(db, "stock"));
        if (!stockSnap.exists()) {
          setProducts([]);
          hasLoadedRef.current = true;
          return;
        }

        const mappedStockProducts = Object.entries(stockSnap.val() as Record<string, RawProduct>).map(([id, raw]) =>
          mapProduct(id, raw)
        );

        setProducts(mappedStockProducts);
        hasLoadedRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isOpen]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return [];
    return products
      .filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
        const tagMatch = product.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
        return nameMatch || tagMatch;
      })
      .slice(0, 8);
  }, [normalizedQuery, products]);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];

    const source = new Set<string>();
    for (const product of products) {
      if (product.category && product.category.toLowerCase().includes(normalizedQuery)) {
        source.add(product.category);
      }
      for (const tag of product.tags) {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          source.add(tag);
        }
      }
    }

    return Array.from(source).slice(0, 8);
  }, [normalizedQuery, products]);

  const pages = useMemo(() => {
    if (!normalizedQuery) return [];
    return PAGES.filter((page) => page.label.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  const showStartTyping = !normalizedQuery;
  const hasAnyResult = suggestions.length > 0 || filteredProducts.length > 0 || pages.length > 0;
  const showNoResults = normalizedQuery.length > 0 && !hasAnyResult && !loading;

  const closeOverlay = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-full w-full bg-white transition-all duration-200 ${
        isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeOverlay();
        }
      }}
      aria-hidden={!isOpen}
    >
      <div className="mx-auto flex h-full max-w-4xl flex-col px-3 py-3 sm:px-5 sm:py-5">
        <div className="flex items-center gap-2 rounded-2xl border border-brand-gray-200 bg-white px-2 py-2 shadow-sm sm:gap-3 sm:px-3">
          <button
            type="button"
            onClick={closeOverlay}
            className="rounded-full p-2 text-brand-gray-700 transition hover:bg-brand-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-xl border border-brand-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-black"
            />
          </div>

          <button
            type="button"
            onClick={closeOverlay}
            className="rounded-full p-2 text-brand-gray-700 transition hover:bg-brand-gray-100"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-brand-gray-100 bg-white p-4 shadow-sm sm:p-5">
          {showStartTyping ? (
            <p className="text-sm text-brand-gray-500">Start typing to search</p>
          ) : loading ? (
            <p className="text-sm text-brand-gray-500">Searching...</p>
          ) : (
            <>
              {suggestions.length > 0 && (
                <section>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gray-400">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuery(suggestion)}
                        className="rounded-full border border-brand-gray-200 px-3 py-1.5 text-sm text-brand-gray-700 transition hover:border-brand-black hover:text-brand-black"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {filteredProducts.length > 0 && (
                <section className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gray-400">Products</p>
                  <div className="space-y-2">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug || product.id}`}
                        onClick={closeOverlay}
                        className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-brand-gray-200 hover:bg-brand-gray-50"
                      >
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-brand-gray-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : null}
                        </div>
                        <span className="line-clamp-2 text-sm font-medium text-brand-black">{product.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {pages.length > 0 && (
                <section className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gray-400">Pages</p>
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={closeOverlay}
                        className="block rounded-xl border border-transparent px-2 py-2 text-sm font-medium text-brand-gray-700 transition hover:border-brand-gray-200 hover:bg-brand-gray-50 hover:text-brand-black"
                      >
                        {page.label}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {showNoResults ? <p className="text-sm text-brand-gray-500">No results found</p> : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
