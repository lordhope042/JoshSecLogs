"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-[#0a1522] dark:text-slate-300 ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,.3)]">
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
      </span>
      <span className="hidden sm:inline">{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
