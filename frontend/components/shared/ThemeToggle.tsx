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

  // Avoid a hydration mismatch: we don't know the persisted theme
  // until after mount, so render a neutral placeholder first.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = mounted
    ? isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Toggle theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={
        "rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#111827] p-2.5 text-gray-500 dark:text-zinc-400 transition hover:border-orange-500 hover:text-orange-500 " +
        className
      }
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
