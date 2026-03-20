"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { listenToDMProofs } from "@/lib/db";
import type { DMProof } from "@/types";

export default function DMSection() {
  const [dmProofs, setDmProofs] = useState<DMProof[]>([]);

  useEffect(() => {
    return listenToDMProofs(setDmProofs);
  }, []);

  const scrollingProofs = dmProofs.length > 0 ? [...dmProofs, ...dmProofs] : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold">Straight From Our DMs</h2>
        <p className="text-sm text-brand-gray-400 mt-2">See what our customers are saying</p>
      </div>

      <div className="overflow-hidden -mx-4 sm:mx-0">
        {dmProofs.length === 0 ? (
          <div className="flex gap-3 px-4 sm:px-0 pb-2" style={{ width: "max-content" }}>
            <div className="w-48 h-72 flex-shrink-0 bg-brand-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">DM</div>
                <p className="text-xs text-brand-gray-400">No DM proofs yet</p>
                <p className="text-xs text-brand-gray-300 mt-1">Upload from admin panel</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="dm-scroll-track dm-scroll-track--pause px-4 sm:px-0 pb-2">
            {scrollingProofs.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="w-44 h-64 sm:w-48 sm:h-72 flex-shrink-0 bg-brand-gray-100 rounded-xl overflow-hidden relative"
              >
                <Image
                  src={item.image || "/placeholder.png"}
                  alt="Customer DM proof"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 176px, 192px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
