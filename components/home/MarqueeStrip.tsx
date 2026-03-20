interface MarqueeStripProps {
  items: string[];
  slow?: boolean;
  dark?: boolean;
}

export default function MarqueeStrip({ items, slow = false, dark = false }: MarqueeStripProps) {
  return (
    <div className={`overflow-hidden py-3 ${dark ? "bg-brand-black text-white" : "bg-brand-gray-100 text-brand-gray-600"}`}>
      <div className="flex items-center whitespace-nowrap">
        <div
          className="flex min-w-max items-center"
          style={{ animation: `marquee ${slow ? "40s" : "20s"} linear infinite` }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {items.map((item, index) => (
                <span key={`${copy}-${item}-${index}`} className="inline-flex items-center gap-4 px-4">
                  <span className="text-xs font-semibold tracking-widest uppercase">{item}</span>
                  <span className="opacity-40">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
