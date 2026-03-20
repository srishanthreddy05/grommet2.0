"use client";

import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, CreditCard, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSellingPrice } from "@/lib/pricing";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to continue");
      closeCart();
      router.push("/auth");
      return;
    }
    closeCart();
    router.push("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 cart-overlay"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h2 className="font-semibold text-lg">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-brand-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 hover:bg-brand-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={48} className="text-brand-gray-200" />
              <div>
                <p className="font-medium text-lg">Your cart is empty</p>
                <p className="text-sm text-brand-gray-400 mt-1">Add some items to get started</p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 px-6 py-2.5 bg-brand-black text-white text-sm font-medium rounded-full hover:bg-brand-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 pb-4 border-b border-brand-gray-100 last:border-0">
                  {/* Image */}
                  <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.imageUrl && (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{item.product.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty */}
                      <div className="flex items-center gap-1 border border-brand-gray-200 rounded-full px-1">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) removeItem(item.product.id);
                            else updateQuantity(item.product.id, item.quantity - 1);
                          }}
                          className="p-1 hover:bg-brand-gray-100 rounded-full transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-brand-gray-100 rounded-full transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          ₹{(getSellingPrice(item.product) * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1 text-brand-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-gray-100 px-6 py-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-brand-gray-500">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-xs text-brand-gray-400">Shipping calculated via WhatsApp</p>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-brand-black hover:bg-brand-gray-800 text-white font-semibold py-3.5 rounded-full transition-colors text-sm"
            >
              <CreditCard size={18} />
              Place Order
            </button>
            <p className="text-xs text-center text-brand-gray-400">
              Login is required to complete checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
