"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shapes,
  Package,
  ShoppingBag,
  MessageSquare,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleAction: () => void;
  mobileOpen: boolean;
  onCloseMobileAction: () => void;
  onSignOutAction: () => Promise<void> | void;
  userName?: string;
  userEmail?: string;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: Shapes },
  { label: "DM Proofs", href: "/admin/dm-proofs", icon: MessageSquare },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Best Sellers", href: "/admin/best-sellers", icon: Star },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function NavLinks({ collapsed, onNavigateAction }: { collapsed: boolean; onNavigateAction?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigateAction}
            className={[
              "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-brand-black text-white shadow-sm"
                : "text-brand-gray-600 hover:bg-brand-gray-100 hover:text-brand-black",
              collapsed ? "justify-center" : "gap-3",
            ].join(" ")}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} />
            {!collapsed ? <span>{label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  collapsed,
  userName,
  userEmail,
  onSignOutAction,
}: {
  collapsed: boolean;
  userName?: string;
  userEmail?: string;
  onSignOutAction: () => Promise<void> | void;
}) {
  return (
    <div className="border-t border-brand-gray-100 p-3">
      <div className={["mb-2 flex items-center rounded-xl bg-brand-gray-50 p-2.5", collapsed ? "justify-center" : "gap-2.5"].join(" ")}>
        <UserCircle2 size={20} className="text-brand-gray-500" />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-brand-black">{userName || "Grommet"}</p>
            <p className="truncate text-xs text-brand-gray-500">{userEmail || "admin@local"}</p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSignOutAction}
        className={[
          "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50",
          collapsed ? "justify-center" : "gap-2.5",
        ].join(" ")}
        title={collapsed ? "Sign Out" : undefined}
      >
        <LogOut size={16} />
        {!collapsed ? <span>Sign Out</span> : null}
      </button>
    </div>
  );
}

export default function AdminSidebar({
  collapsed,
  onToggleAction,
  mobileOpen,
  onCloseMobileAction,
  onSignOutAction,
  userName,
  userEmail,
}: AdminSidebarProps) {
  return (
    <>
      {mobileOpen ? <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCloseMobileAction} /> : null}

      <aside
        className={[
          "fixed left-0 top-0 z-50 hidden h-full border-r border-brand-gray-100 bg-white shadow-sm transition-all duration-300 md:flex md:flex-col",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <div className={[
          "flex h-16 items-center border-b border-brand-gray-100 px-3",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}>
          {!collapsed ? <p className="font-display text-lg font-bold">Grommet</p> : null}
          <button
            type="button"
            onClick={onToggleAction}
            className="rounded-lg p-2 text-brand-gray-600 hover:bg-brand-gray-100"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <NavLinks collapsed={collapsed} />

        <SidebarFooter collapsed={collapsed} userName={userName} userEmail={userEmail} onSignOutAction={onSignOutAction} />
      </aside>

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-gray-100 px-4">
          <p className="font-display text-lg font-bold">Grommet</p>
          <button
            type="button"
            onClick={onCloseMobileAction}
            className="rounded-lg p-2 text-brand-gray-600 hover:bg-brand-gray-100"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <NavLinks collapsed={false} onNavigateAction={onCloseMobileAction} />

        <SidebarFooter collapsed={false} userName={userName} userEmail={userEmail} onSignOutAction={onSignOutAction} />
      </aside>
    </>
  );
}
