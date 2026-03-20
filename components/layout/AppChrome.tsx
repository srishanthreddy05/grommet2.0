"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}
