"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, UserCircle2 } from "lucide-react";

type MenuLink = {
  label: string;
  href: string;
};

type MenuDrawerProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  links: MenuLink[];
  userName?: string;
  userEmail?: string;
};

export default function MenuDrawer({ isOpen, onCloseAction, links, userName, userEmail }: MenuDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, onCloseAction]);

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-[80] h-full w-full bg-white",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-brand-gray-100 px-4 py-4">
          <button
            type="button"
            onClick={onCloseAction}
            className="rounded-full p-2 text-brand-gray-600 hover:bg-brand-gray-100"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          <p className="font-display text-xl font-bold">Grommet</p>

          <span className="inline-block h-9 w-9" aria-hidden />
        </div>

        {userName || userEmail ? (
          <div className="border-b border-brand-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand-gray-100 p-2 text-brand-gray-600">
                <UserCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-black">{userName || "User"}</p>
                <p className="text-xs text-brand-gray-500">{userEmail || ""}</p>
              </div>
            </div>
          </div>
        ) : null}

        <nav className="flex-1 px-6 py-8">
          <div className="space-y-6">
            {links.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={onCloseAction}
                className="block text-xl font-medium text-brand-gray-800 transition-colors hover:text-brand-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
