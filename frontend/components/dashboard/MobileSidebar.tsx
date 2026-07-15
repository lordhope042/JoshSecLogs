"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Users,
  KeyRound,
  Settings,
  LogOut,
  Store,
  ShieldCheck,
  ShoppingBag,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Virtual Numbers", href: "/dashboard/marketplace", icon: Store },
  { title: "Social Logs", href: "/dashboard/social-logs", icon: ShieldCheck },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { title: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { title: "Transactions", href: "/dashboard/transactions", icon: History },
  { title: "Referrals", href: "/dashboard/referrals", icon: Users },
  { title: "API Keys", href: "/dashboard/api", icon: KeyRound },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsMobileOpen(false);
    router.push("/login");
  };

  // Sidebar content that's shared between mobile and desktop
  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className={`border-b border-zinc-800 ${collapsed ? "p-4 flex justify-center" : "p-6"}`}>
        {collapsed ? (
          <h1 className="text-2xl font-black text-white">
            J<span className="text-orange-500">S</span>
          </h1>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white">
              Josh<span className="text-orange-500">SecLogs</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Secure Digital Marketplace
            </p>
          </>
        )}
      </div>

      {/* Collapse Toggle - Visible on all screen sizes when onToggle is provided */}
      {onToggle && (
        <div className={`flex ${collapsed ? "justify-center" : "justify-end"} px-3 pt-3`}>
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center rounded-2xl px-4 py-3 transition-all duration-300
                ${
                  active
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }
                ${collapsed ? "justify-center" : "gap-3"}`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-2xl px-4 py-3 text-zinc-400 transition hover:bg-red-500 hover:text-white
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button - Only show when collapsed is false or on mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-zinc-700 bg-[#0A1020] p-2 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-white" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Always full width, not collapsible */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0A1020] border-r border-zinc-800 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button for Mobile */}
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-xl border border-zinc-700 p-2 text-zinc-400 hover:text-white hover:border-zinc-600"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile sidebar always shows full content (not collapsed) */}
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop Sidebar - Collapsible */}
      <aside
        className={`hidden md:flex h-screen flex-col border-r border-zinc-800 bg-[#0A1020] transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

// Helper component to avoid duplication
function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <>
      <div className={`border-b border-zinc-800 ${collapsed ? "p-4 flex justify-center" : "p-6"}`}>
        {collapsed ? (
          <h1 className="text-2xl font-black text-white">
            J<span className="text-orange-500">S</span>
          </h1>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white">
              Josh<span className="text-orange-500">SecLogs</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Secure Digital Marketplace
            </p>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-2xl px-4 py-3 transition-all duration-300
                ${
                  active
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }
                ${collapsed ? "justify-center" : "gap-3"}`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-2xl px-4 py-3 text-zinc-400 transition hover:bg-red-500 hover:text-white
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}