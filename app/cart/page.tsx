"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getSellingPrice } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white border border-brand-gray-100 rounded-2xl p-10 text-center">
          <p className="text-brand-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/" className="inline-flex px-5 py-2.5 rounded-full bg-brand-black text-white text-sm font-semibold">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-brand-gray-100 rounded-2xl p-5 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 border-b border-brand-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-brand-gray-100">
                  {item.product.imageUrl && (
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.product.name}</p>
                  <p className="text-xs text-brand-gray-400 mt-1">Stock: {item.product.stock}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center border border-brand-gray-200 rounded-full px-1">
                      <button
                        onClick={() =>
                          item.quantity <= 1
                            ? removeItem(item.product.id)
                            : updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1.5"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">INR {(getSellingPrice(item.product) * item.quantity).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.product.id)} className="text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-brand-gray-100 rounded-2xl p-5 h-fit">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal</span>
              <span>INR {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold pt-3 border-t border-brand-gray-100">
              <span>Total</span>
              <span>INR {totalPrice.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-5 w-full inline-flex justify-center px-4 py-3 rounded-full bg-brand-black text-white text-sm font-semibold"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
