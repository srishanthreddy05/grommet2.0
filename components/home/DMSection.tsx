export default function DMSection() {
  // Replace these with real screenshot image URLs from Cloudinary
  const placeholders = Array.from({ length: 8 }, (_, i) => i);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold">Straight From Our DMs 💬</h2>
        <p className="text-sm text-brand-gray-400 mt-2">See what our customers are saying</p>
      </div>

      <div className="overflow-x-auto hide-scrollbar -mx-4 sm:mx-0">
        <div className="flex gap-3 px-4 sm:px-0 pb-2" style={{ width: "max-content" }}>
          {placeholders.map((i) => (
            <div
              key={i}
              className="w-48 h-72 flex-shrink-0 bg-brand-gray-100 rounded-xl overflow-hidden flex items-center justify-center"
            >
              <div className="text-center p-4">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-xs text-brand-gray-400">Customer DM</p>
                <p className="text-xs text-brand-gray-300 mt-1">Screenshot here</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
