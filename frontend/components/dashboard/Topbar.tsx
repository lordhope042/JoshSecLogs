"use client";

import {
  Bell,
  Menu,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Wallet as WalletIcon,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Wallet } from "@/types/wallet";
import ThemeToggle from "@/components/shared/ThemeToggle";

interface User {
  name: string;
  email: string;
}

interface TopbarProps {
  onMenuClick?: () => void;
  onCollapseToggle?: () => void;
  collapsed?: boolean;

  wallet?: Wallet | null;
  walletLoading?: boolean;
}

export default function Topbar({
  onMenuClick,
  onCollapseToggle,
  collapsed = false,
  wallet,
  walletLoading = false,
}: TopbarProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      setUser(JSON.parse(stored));
    } catch {
      // Malformed value shouldn't take the whole header down —
      // fall back to the "Guest" state instead.
      console.warn("Couldn't parse stored user, clearing it.");
      localStorage.removeItem("user");
    }
  }, []);

  const balance = Number(wallet?.balance ?? 0);

  return (
    <header className="sticky top-0 z-50 mb-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-[#0f172a]/90 px-6 py-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-6">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="rounded-xl p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <Menu size={22} />
          </button>

          <button
            onClick={onCollapseToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-xl p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 md:block"
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>

          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome back 👋</h2>
            <p className="text-sm text-gray-400 dark:text-zinc-500">Manage your virtual services</p>
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden flex-1 justify-center lg:flex">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            />
            <input
              placeholder="Search services, orders, transactions..."
              className="h-12 w-full rounded-2xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] pl-12 pr-4 text-gray-900 dark:text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Wallet */}
          <div className="hidden items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-2 lg:flex">
            <div className="rounded-xl bg-green-500/20 p-2">
              <WalletIcon size={18} className="text-green-400" />
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Wallet Balance</p>
              <div className="mt-1">
                {walletLoading ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : wallet ? (
                  <p className="text-lg font-bold text-green-400">
                    ₦
                    {balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                ) : (
                  <p className="font-bold text-gray-400 dark:text-zinc-500">No Wallet</p>
                )}
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle className="rounded-2xl" />

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 transition hover:border-orange-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <Bell size={20} className="text-gray-700 dark:text-zinc-300" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-gray-200 dark:ring-[#0f172a]" />
          </button>

          {/* User */}
          <button
            aria-label="Account menu"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 transition hover:border-orange-500"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-gray-900 dark:text-white">
              {user?.name?.charAt(0) ?? "H"}
            </div>

            <div className="hidden text-left md:block">
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name ?? "Guest"}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500">{user?.email ?? ""}</p>
            </div>

            <ChevronDown size={18} className="hidden text-gray-400 dark:text-zinc-500 md:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
