"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import OrderStatusBadge from "@/components/profile/OrderStatusBadge";
import OrderProgress from "@/components/profile/OrderProgress";

export type ProfileOrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type ProfileOrder = {
  id: string;
  createdAt: number;
  totalAmount: number;
  status: string;
  items: ProfileOrderItem[];
};

type OrderCardProps = {
  order: ProfileOrder;
};

export default function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = useMemo(() => {
    return new Date(order.createdAt).toLocaleString();
  }, [order.createdAt]);

  return (
    <article className="rounded-2xl border border-brand-gray-100 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-black">Order #{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-brand-gray-500">{formattedDate}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">INR {order.totalAmount.toLocaleString()}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-brand-gray-100 px-4 py-4 sm:px-5">
          <OrderProgress status={order.status} />

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={`${order.id}-${item.productId}-${idx}`} className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-brand-gray-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-black">{item.name || item.productId}</p>
                  <p className="text-xs text-brand-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">INR {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
