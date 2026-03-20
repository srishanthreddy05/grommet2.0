import Link from "next/link";

type HeroSectionProps = {
  collectionHref: string;
};

export default function HeroSection({ collectionHref }: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative flex min-h-[320px] items-center overflow-hidden rounded-2xl bg-brand-black sm:min-h-[420px]">
        {/* Stock image background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-105 animate-[fadeIn_1.2s_ease-out]"
          style={{ backgroundImage: "url('/hero-bg.jpeg')" }}
        />

        {/* Readability overlays */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10" />

        {/* Subtle star texture on top */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 px-8 sm:px-14 py-12 max-w-xl">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-4">
            Best Seller ✦
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Not Just A Car.<br />
            <span className="text-brand-gray-300">A Framed Icon.</span>
          </h1>
          <p className="text-brand-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
            Detachable diecast models framed to elevate modern interiors. Starting ₹699.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={collectionHref}
              className="bg-white text-brand-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-gray-100 transition-colors"
            >
              Explore Collection
            </Link>
            <Link
              href="/collections"
              className="border border-brand-gray-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:border-brand-gray-400 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Decorative right-side glow for depth */}
        <div className="pointer-events-none absolute -right-20 bottom-0 hidden h-64 w-64 rounded-full bg-white/10 blur-3xl sm:block" />
        <div className="pointer-events-none absolute right-8 top-10 hidden h-28 w-28 rounded-full border border-white/20 sm:block" />
        <div className="pointer-events-none absolute right-20 top-1/2 hidden h-px w-40 bg-gradient-to-r from-transparent via-white/50 to-transparent sm:block" />
      </div>
    </section>
  );
}
