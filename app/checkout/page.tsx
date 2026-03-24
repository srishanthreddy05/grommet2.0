"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatWhatsAppOrderMessage } from "@/utils/whatsapp";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPrice, placeOrderFromCart } = useCart();

  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
    if (user?.email) setEmail(user.email);
  }, [user]);

  const disabledCheckout = useMemo(
    () => !user || !items.length || !name.trim() || !email.trim() || !mobile.trim(),
    [user, items.length, name, email, mobile]
  );

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, name }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to send OTP");
        return;
      }
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "OTP verification failed");
        return;
      }
      setOtpVerified(true);
      toast.success("OTP verified");
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please login first");
      router.push("/auth");
      return;
    }
    if (!otpVerified) {
      toast.error("Please verify OTP first");
      return;
    }

    setLoading(true);
    try {
      const orderId = await placeOrderFromCart({
        userId: user.uid,
        name,
        email,
        mobile,
        status: "confirmed",
      });

      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917075074352";
      const message = formatWhatsAppOrderMessage({
        name,
        mobile,
        items,
        totalPrice,
      });

      toast.success(`Order placed: #${orderId.slice(-6)}`);
      window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Order failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      {!user && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-50 text-yellow-800 text-sm">
          Please login to continue checkout.
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="bg-white border border-brand-gray-100 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-brand-gray-200 rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-brand-gray-200 rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-gray-600 mb-1.5">Mobile</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border border-brand-gray-200 rounded-lg px-3 py-2.5 text-sm"
            required
          />
        </div>

        <div className="pt-2 border-t border-brand-gray-100">
          <p className="text-sm font-semibold mb-3">Email OTP Verification</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={sendOtp}
              disabled={disabledCheckout || loading}
              className="px-4 py-2.5 rounded-full border border-brand-gray-300 text-sm font-medium disabled:opacity-50"
            >
              {otpSent ? "Resend OTP" : "Send OTP"}
            </button>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="flex-1 border border-brand-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={!otpSent || loading}
              className="px-4 py-2.5 rounded-full bg-brand-black text-white text-sm font-semibold disabled:opacity-50"
            >
              Verify OTP
            </button>
          </div>
          {otpVerified && <p className="text-xs text-green-600 mt-2">OTP verified successfully</p>}
        </div>

        <div className="pt-2 border-t border-brand-gray-100 flex items-center justify-between">
          <span className="font-semibold">Total: INR {totalPrice.toLocaleString()}</span>
          <button
            type="submit"
            disabled={loading || !otpVerified || !items.length || !user}
            className="px-6 py-3 rounded-full bg-brand-black text-white text-sm font-semibold disabled:opacity-50"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}
