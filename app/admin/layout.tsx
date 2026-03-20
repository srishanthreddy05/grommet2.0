"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/login");
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-brand-gray-400">Loading...</div>
    </div>
  );

  if (!user || !isAdmin) return null;

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <AdminSidebar
        collapsed={collapsed}
        onToggleAction={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobileAction={() => setMobileOpen(false)}
        onSignOutAction={handleSignOut}
        userName={user.displayName || "Grommet"}
        userEmail={user.email || ""}
      />

      <main
        className={[
          "min-h-screen p-4 transition-all duration-300 sm:p-6 lg:p-8",
          collapsed ? "md:ml-20" : "md:ml-64",
        ].join(" ")}
      >
        <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-gray-100 bg-white px-3 py-3 shadow-sm md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-brand-gray-600 hover:bg-brand-gray-100"
            aria-label="Open admin menu"
          >
            <Menu size={18} />
          </button>
          <p className="font-display text-base font-bold">Admin Panel</p>
          <span className="inline-block h-8 w-8" aria-hidden />
        </div>

        <div className="rounded-2xl border border-brand-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
