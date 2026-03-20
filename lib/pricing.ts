import type { Product } from "@/types";

export function getSellingPrice(product: Pick<Product, "price" | "salePrice">): number {
  const mrp = Number(product.price || 0);
  const sale = product.salePrice;

  if (sale === null || typeof sale === "undefined") {
    return mrp;
  }

  const numericSale = Number(sale);
  if (!Number.isFinite(numericSale) || numericSale <= 0 || numericSale > mrp) {
    return mrp;
  }

  return numericSale;
}

export function getDiscountPercent(price: number, salePrice: number | null | undefined): number {
  const mrp = Number(price || 0);
  if (!mrp || mrp <= 0 || salePrice === null || typeof salePrice === "undefined") {
    return 0;
  }

  const sale = Number(salePrice);
  if (!Number.isFinite(sale) || sale <= 0 || sale >= mrp) {
    return 0;
  }

  return Math.round(((mrp - sale) / mrp) * 100);
}
