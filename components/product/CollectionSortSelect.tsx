"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type CollectionSortSelectProps = {
  slug: string;
  sort: string;
};

export default function CollectionSortSelect({ slug, sort }: CollectionSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : `/collections/${slug}`);
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm text-brand-gray-500">Sort</span>
      <select
        value={sort}
        onChange={(event) => handleChange(event.target.value)}
        className="border border-brand-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gray-200"
        aria-label="Sort products"
      >
        <option value="default">Sort: Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
