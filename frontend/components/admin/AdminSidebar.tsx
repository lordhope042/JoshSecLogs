"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menus = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Wallet",
    href: "/admin/transactions",
    icon: Wallet,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Social Logs",
    href: "/admin/social-logs",
    icon: ShieldCheck,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-zinc-800 bg-[#090d14] transition-all duration-300 ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      {/* Logo */}

      <div className="flex h-20 items-center justify-between border-b border-zinc-800 px-6">
        <div className="overflow-hidden">
          {!collapsed ? (
            <>
              <h1 className="text-xl font-bold text-white">
                JoshSecLogs
              </h1>

              <p className="text-xs text-orange-500">
                ADMIN PANEL
              </p>
            </>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 font-bold text-white">
              J
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Menu */}

      <nav className="flex-1 space-y-2 p-4">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active =
            pathname === menu.href ||
            pathname.startsWith(menu.href + "/");

          return (
            <Link
              key={menu.title}
              href={menu.href}
              className={`group flex items-center rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="ml-4 font-medium">
                  {menu.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Logout */}

      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut size={20} />

          {!collapsed && (
            <span className="ml-4">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}