"use client";

import { useEffect, useState } from "react";
import { onValue, ref, getDatabase } from "firebase/database";
import app from "@/lib/firebase";

const DEFAULT_MESSAGES = [
  "NEW COLLECTION DROP",
  "FREE SHIPPING PAN-INDIA",
  "USE CODE WELCOME10",
];

function sanitizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return [];
}

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);

  useEffect(() => {
    const database = getDatabase(app);
    const announcementRef = ref(database, "settings/announcementBar");

    const unsubscribe = onValue(announcementRef, (snapshot) => {
      const parsed = sanitizeMessages(snapshot.val());
      setMessages(parsed.length > 0 ? parsed : DEFAULT_MESSAGES);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <div className="announcement-viewport flex h-9 items-center whitespace-nowrap">
        <div className="announcement-track flex min-w-max items-center">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="announcement-group flex items-center">
              <span aria-hidden className="inline-block w-[35vw] min-w-[140px]" />
              {messages.map((message, index) => (
                <span
                  key={`${copyIndex}-${message}-${index}`}
                  className="inline-flex flex-none items-center gap-5 px-6 text-[11px] font-semibold uppercase tracking-wide"
                >
                  <span>{message}</span>
                  <span className="opacity-50">•</span>
                </span>
              ))}
              <span aria-hidden className="inline-block w-[10vw] min-w-[48px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
