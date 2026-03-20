"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, User, Menu } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { listenToCategories } from "@/lib/db";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import MenuDrawer from "@/components/layout/MenuDrawer";
import type { Category } from "@/types";

const fallbackLinks = [
  { id: "fallback-1", name: "Car Frames" },
  { id: "fallback-2", name: "Phone Cases" },
  { id: "fallback-3", name: "Tumblers" },
];

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => listenToCategories(setCategories), []);

  const orderedCategories = [...categories].sort((a, b) => (a.order || 999) - (b.order || 999));

  const navLinks = (orderedCategories.length > 0 ? orderedCategories : fallbackLinks).map((cat) => ({
    label: cat.name,
    href: `/collections/${cat.id}`,
  }));

  const drawerLinks = [
    { label: "Home", href: "/" },
    ...navLinks,
    { label: "Profile", href: user ? "/profile" : "/login" },
  ];

  return (
    <>
      <MenuDrawer
        isOpen={isMenuOpen}
        onCloseAction={() => setIsMenuOpen(false)}
        links={drawerLinks}
        userName={user?.displayName || ""}
        userEmail={user?.email || ""}
      />

      <AnnouncementBar />

      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-sm border-b border-brand-gray-100" : "border-b border-brand-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <Link href="/" className="font-display text-xl font-bold tracking-tight flex-shrink-0">
              Grommet
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-brand-gray-600 hover:text-brand-black transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("open-product-search"));
                  }
                }}
                aria-label="Open product search"
              >
                <Search size={18} />
              </button>

              {/* User menu */}
              <button
                className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors"
                onClick={() => router.push(user ? "/profile" : "/login")}
                aria-label="Open profile"
              >
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt="avatar" width={24} height={24} className="rounded-full" />
                ) : (
                  <User size={18} />
                )}
              </button>

              {/* Cart */}
              <button
                className="relative p-2 hover:bg-brand-gray-100 rounded-full transition-colors"
                onClick={openCart}
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
