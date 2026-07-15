"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  // Theme icon based on current theme
  const themeIcon = theme === "dark" ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  );

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        z-50
        w-full
        border-b
        border-orange-500/20
        bg-white/90
        dark:bg-black/80
        backdrop-blur-xl
        transition-colors
        duration-300
      `}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/logo.png"
            alt="JoshSecLogs"
            width={52}
            height={52}
            priority
          />

          <div>
            <h1 className="text-3xl font-extrabold">
              <span className="text-gray-900 dark:text-white">Josh</span>
              <span className="text-orange-500">Sec</span>
              <span className="text-gray-900 dark:text-white">Logs</span>
            </h1>

            <p className="text-[10px] uppercase tracking-[3px] text-zinc-600 dark:text-zinc-400">
              Login • Connect • Stay Private
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-10 lg:flex">
          <Link 
            href="/" 
            className="text-orange-500 font-semibold"
          >
            Home
          </Link>

          <Link 
            href="/pricing" 
            className="text-gray-700 dark:text-white hover:text-orange-500 transition"
          >
            Pricing
          </Link>

          <Link 
            href="/how-it-works" 
            className="text-gray-700 dark:text-white hover:text-orange-500 transition"
          >
            How it Works
          </Link>

          <Link 
            href="/api-docs" 
            className="text-gray-700 dark:text-white hover:text-orange-500 transition"
          >
            API Docs
          </Link>

          <Link 
            href="/contact" 
            className="text-gray-700 dark:text-white hover:text-orange-500 transition"
          >
            Contact
          </Link>
        </nav>

        {/* Right */}
        <div className="hidden items-center gap-4 lg:flex">
          <Button
            variant="outline"
            size="icon"
            className={`
              border-orange-500/30
              bg-zinc-100
              dark:bg-zinc-900
              hover:bg-orange-500/10
              dark:hover:bg-orange-500/20
              transition-colors
            `}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {themeIcon}
          </Button>

          <Link href="/login">
            <Button
              variant="outline"
              className={`
                border-orange-500
                text-gray-900
                dark:text-white
                hover:bg-orange-500
                hover:text-white
                dark:hover:bg-orange-500
                transition-colors
              `}
            >
              Login
            </Button>
          </Link>

          <Link href="/register">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 transition-colors">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
        >
          <Menu className="text-gray-900 dark:text-white" />
        </button>
      </div>

      {mobileOpen && (
        <div className={`
          border-t
          border-orange-500/20
          bg-white/95
          dark:bg-black/95
          backdrop-blur-xl
          lg:hidden
          transition-colors
          duration-300
        `}>
          <div className="flex flex-col gap-5 p-6">
            <Link 
              href="/" 
              className="text-gray-900 dark:text-white hover:text-orange-500 transition"
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-900 dark:text-white hover:text-orange-500 transition"
            >
              Pricing
            </Link>
            <Link 
              href="/how-it-works" 
              className="text-gray-900 dark:text-white hover:text-orange-500 transition"
            >
              How it Works
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-900 dark:text-white hover:text-orange-500 transition"
            >
              Contact
            </Link>
            <Link 
              href="/login" 
              className="text-gray-900 dark:text-white hover:text-orange-500 transition"
            >
              Login
            </Link>

            <Button className="bg-orange-500 hover:bg-orange-600 text-white transition-colors">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}