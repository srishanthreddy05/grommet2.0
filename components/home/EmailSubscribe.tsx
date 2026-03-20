"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're subscribed! 🎉");
    setEmail("");
  };

  return (
    <section className="bg-brand-gray-50 py-14 mt-8">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Get Exclusive Offers</h2>
        <p className="text-sm text-brand-gray-500 mb-6">Subscribe for new drops, discounts and more.</p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 border border-brand-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-brand-black transition-colors"
          />
          <button
            type="submit"
            className="bg-brand-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gray-800 transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
