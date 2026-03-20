const REVIEWS = [
  {
    name: "Aisha Khan",
    initials: "AK",
    rating: 5,
    text: "Thank you so much! The frames are looking really good even with minimal detailing. Quality is amazing 🙌",
  },
  {
    name: "Rahul Verma",
    initials: "RV",
    rating: 5,
    text: "Being a Porsche fan, this is exactly what I wanted 🔥 The Hot Wheels collection looks insane!",
  },
  {
    name: "Sneha Reddy",
    initials: "SR",
    rating: 5,
    text: "Greattttt thank youuuu so muchhhh ❤️ Loved the final output!",
  },
  {
    name: "Arjun Mehta",
    initials: "AM",
    rating: 5,
    text: "This is sooo good! Thank you for the amazing work 🙌 Will definitely order again.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i <= count ? "#0a0a0a" : "none"} stroke="#0a0a0a" strokeWidth="1">
          <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.5 2.7,10.5 3.5,7 1,4.8 4.5,4.5" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-2">
          What They Say
        </p>
        <h2 className="font-display text-3xl font-bold">Customer Reviews</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REVIEWS.map((review, i) => (
          <div key={i} className="bg-brand-gray-50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {review.initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{review.name}</p>
                <Stars count={review.rating} />
              </div>
            </div>
            <p className="text-sm text-brand-gray-600 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
