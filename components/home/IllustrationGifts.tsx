import Link from "next/link";

const GIFTS = [
  { label: "Hampers", href: "/collections/hampers", emoji: "🎁", desc: "Gift bundles for every occasion" },
  { label: "Custom Bottles", href: "/collections/bottles", emoji: "🍶", desc: "Illustrated just for you" },
  { label: "Customised Frames", href: "/collections/frames", emoji: "🖼️", desc: "Memories in frames" },
];

export default function IllustrationGifts() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
          100% Customised
        </p>
        <h2 className="font-display text-3xl font-bold">Illustration Gifts</h2>
        <p className="text-sm text-brand-gray-400 mt-2">
          Once ordered, our team connects with you over WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GIFTS.map((gift) => (
          <Link
            key={gift.href}
            href={gift.href}
            className="group bg-brand-gray-50 rounded-2xl p-8 flex flex-col items-center text-center hover:bg-brand-black hover:text-white transition-all duration-300"
          >
            <span className="text-5xl mb-4">{gift.emoji}</span>
            <h3 className="font-semibold text-lg mb-1">{gift.label}</h3>
            <p className="text-sm text-brand-gray-400 group-hover:text-brand-gray-400">{gift.desc}</p>
            <span className="mt-4 text-xs font-semibold tracking-wider uppercase group-hover:text-white underline underline-offset-2">
              Shop Now →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
