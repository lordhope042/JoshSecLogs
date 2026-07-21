"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Lock,
  KeyRound,
  History,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  UserCircle2,
  Loader2,
} from "lucide-react";

import api from "@/lib/axios";

const links = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Wallet",
    href: "/dashboard/wallet",
    icon: Wallet,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "My Purchases",
    href: "/dashboard/purchases",
    icon: Lock,
  },
  {
    title: "API Keys",
    href: "/dashboard/api",
    icon: KeyRound,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: History,
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/* A link is "active" if the pathname matches exactly, or if it's a
   nested route under it (e.g. /dashboard/orders/abc123 should still
   highlight "Orders"). Dashboard itself is exempt from prefix matching
   since every route starts with /dashboard. */
function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("token");
      setLoggingOut(false);
      router.push("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#070b14] text-gray-900 dark:text-white">

      {/* Mobile backdrop */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#0b1220] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6">

          <h1 className="text-2xl font-black text-orange-500">
            JoshSecLogs
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
          >
            <X />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">

          {links.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.title}
              </Link>
            );
          })}

        </nav>

        <div className="shrink-0 border-t border-gray-200 dark:border-zinc-800 p-4">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LogOut size={20} />
            )}
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main */}

      <div className="flex flex-1 flex-col lg:ml-72">

        {/* Navbar */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-gray-50/90 dark:bg-[#0b1220]/90 px-6 backdrop-blur">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setOpen(true)}
              className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
            >
              <Menu />
            </button>

            <h2 className="text-2xl font-bold">
              {links.find((l) => isActive(pathname, l.href))?.title ??
                "Dashboard"}
            </h2>

          </div>

          <div className="flex items-center gap-5">

            <button className="relative text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white">
              <Bell />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
            </button>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3"
            >
              <UserCircle2
                size={36}
                className="text-orange-500"
              />

              <div className="hidden sm:block">
                <p className="font-semibold leading-tight">Account</p>
                <p className="text-sm text-gray-400 dark:text-zinc-500 leading-tight">
                  View profile
                </p>
              </div>
            </Link>

          </div>

        </header>

        {/* Content */}

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>

    </div>
  );
}