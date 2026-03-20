"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { listenToOrders, updateOrderStatus, getProductsByIds } from "@/lib/db";
import type { Order, Product } from "@/types";

const STATUSES: Array<Order["status"]> = ["pending", "confirmed", "shipped", "delivered"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => listenToOrders(setOrders), []);

  useEffect(() => {
    const ids = orders.flatMap((order) => order.products.map((item) => item.productId));
    if (!ids.length) {
      setProductMap({});
      return;
    }
    getProductsByIds(ids).then(setProductMap);
  }, [orders]);

  const filteredOrders = useMemo(
    () => (selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)),
    [orders, selectedStatus]
  );

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Orders</h1>
          <p className="text-sm text-brand-gray-400">{orders.length} total orders</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-4 py-2 rounded-full text-sm border ${
            selectedStatus === "all" ? "bg-brand-black text-white border-brand-black" : "border-brand-gray-200"
          }`}
        >
          All
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-full text-sm border capitalize ${
              selectedStatus === status ? "bg-brand-black text-white border-brand-black" : "border-brand-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-brand-gray-100 rounded-xl p-10 text-center text-brand-gray-400">
            No orders found
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-brand-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedOrderId((id) => (id === order.id ? null : order.id))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-50"
              >
                <div>
                  <p className="font-semibold text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-brand-gray-400 mt-0.5">
                    {order.name} • {order.email} • {order.mobile}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">INR {order.totalPrice.toLocaleString()}</p>
                  <p className="text-xs text-brand-gray-400 capitalize">{order.status}</p>
                </div>
              </button>

              {expandedOrderId === order.id && (
                <div className="border-t border-brand-gray-100 p-4 bg-brand-gray-50">
                  <div className="space-y-2 mb-4">
                    {order.products.map((item, index) => {
                      const product = productMap[item.productId];
                      return (
                        <div key={`${order.id}-${index}`} className="flex items-center justify-between text-sm">
                          <span>{product?.name || item.productId} x{item.quantity}</span>
                          <span>INR {((product?.price || 0) * item.quantity).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize ${
                          order.status === status
                            ? "bg-brand-black text-white border-brand-black"
                            : "border-brand-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
