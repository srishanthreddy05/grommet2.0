"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { listenToOrders, listenToProducts } from "@/lib/db";
import type { Order, Product } from "@/types";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubOrders = listenToOrders(setOrders);
    const unsubProducts = listenToProducts(setProducts);
    return () => { unsubOrders(); unsubProducts(); };
  }, []);

  const totalRevenue = orders
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const recentOrders = orders.slice(0, 5);

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-brand-gray-400 mb-8">Welcome back! Here's what's happening.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
          { label: "Pending", value: pendingOrders, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
          { label: "Products", value: products.length, icon: Package, color: "bg-purple-50 text-purple-600" },
          { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-gray-100 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold mb-0.5">{value}</p>
            <p className="text-xs text-brand-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-brand-gray-100 p-6">
        <h2 className="font-semibold text-lg mb-5">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-brand-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Order</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Items</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Total</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-brand-gray-50 hover:bg-brand-gray-50">
                    <td className="py-3 px-3 font-mono text-xs text-brand-gray-500">#{order.id.slice(-6)}</td>
                    <td className="py-3 px-3">{order.name}</td>
                    <td className="py-3 px-3 text-brand-gray-500">{order.products.length} item{order.products.length > 1 ? "s" : ""}</td>
                    <td className="py-3 px-3 font-semibold">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-brand-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
