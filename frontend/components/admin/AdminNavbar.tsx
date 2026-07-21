"use client";

import { Menu, Bell, Search } from "lucide-react";

interface AdminNavbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AdminNavbar({
  title,
  onMenuClick,
}: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-[#090d14]/95 px-8 backdrop-blur">

      {/* Left */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>

          <p className="text-sm text-gray-400 dark:text-zinc-500">
            JoshSecLogs Administration
          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="hidden items-center rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#121826] px-4 py-2 md:flex">

          <Search
            size={18}
            className="mr-3 text-gray-400 dark:text-zinc-500"
          />

          <input
            placeholder="Search..."
            className="w-56 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-zinc-500"
          />

        </div>

        {/* Notification */}

        <button className="relative rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#121826] p-3 hover:border-orange-500">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500"></span>

        </button>

        {/* Admin */}

        <div className="flex items-center gap-3">

          <div className="text-right">

            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Administrator
            </p>

            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Super Admin
            </p>

          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
            A
          </div>

        </div>

      </div>

    </header>
  );
}