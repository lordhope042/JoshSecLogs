"use client";

import { Bell, Search, Menu, UserCircle2 } from "lucide-react";

import ThemeToggle from "@/components/shared/ThemeToggle";

interface AdminTopbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function AdminTopbar({
  title = "Dashboard",
  onMenuClick,
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-gray-50/95 dark:bg-[#0B1220]/95 px-6 backdrop-blur-xl">

      {/* Left */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="rounded-xl border border-gray-300 dark:border-zinc-700 p-2 text-gray-500 dark:text-zinc-400 transition hover:border-orange-500 hover:text-orange-500 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>

          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Welcome back, Administrator
          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        {/* Search */}

        <div className="relative hidden md:block">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="h-11 w-72 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500"
          />

        </div>

        {/* Theme toggle */}

        <ThemeToggle />

        {/* Notifications */}

        <button className="relative rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] p-3 text-gray-500 dark:text-zinc-400 transition hover:border-orange-500 hover:text-orange-500">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* Profile */}

        <button className="flex items-center gap-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] px-3 py-2 transition hover:border-orange-500">

          <UserCircle2
            size={36}
            className="text-orange-500"
          />

          <div className="hidden text-left lg:block">

            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Administrator
            </p>

            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Super Admin
            </p>

          </div>

        </button>

      </div>

    </header>
  );
}