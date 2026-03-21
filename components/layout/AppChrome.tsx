"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import CategoryCircleSection from "@/components/home/CategoryCircleSection";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <CategoryCircleSection />
      <SearchOverlay />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}
