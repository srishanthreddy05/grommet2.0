import type { CartItem } from "@/types";

export function formatWhatsAppOrderMessage(input: {
  name: string;
  mobile: string;
  items: CartItem[];
  totalPrice: number;
}): string {
  const lines = input.items
    .map((item) => `- ${item.product.name} x${item.quantity}`)
    .join("\n");

  return [
    "New Order:",
    `Name: ${input.name}`,
    `Mobile: ${input.mobile}`,
    "Products:",
    lines,
    `Total: INR ${input.totalPrice.toLocaleString()}`,
  ].join("\n");
}
