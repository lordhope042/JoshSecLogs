"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

/* ===================================================================
   PublicPageLayout
   Wraps public-facing pages (How It Works, Contact, FAQ, etc.) with
   the shared Navbar + a consistent footer so every public page has
   the same chrome as the landing page.
=================================================================== */

export default function PublicPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050816] text-gray-900 dark:text-white">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      <main>{children}</main>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-orange-500/20 bg-white dark:bg-[#050816]">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <h2 className="text-3xl font-black">
                <span className="text-gray-900 dark:text-white">Josh</span>
                <span className="text-orange-500">Sec</span>
                <span className="text-gray-900 dark:text-white">Logs</span>
              </h2>

              <p className="mt-4 max-w-md leading-7 text-gray-700 dark:text-zinc-300 text-sm">
                Purchase premium virtual phone numbers for SMS verification,
                account creation, API integration and business automation.
              </p>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Company</h3>
              <div className="space-y-3">
                <Link href="/" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">Home</Link>
                <Link href="/shop" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">Shop</Link>
                <Link href="/how-it-works" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">How It Works</Link>
                <Link href="/contact" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">Contact</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Resources</h3>
              <div className="space-y-3">
                <Link href="/faq" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">FAQ</Link>
                <Link href="/api-docs" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">API Documentation</Link>
                <Link href="/privacy" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">Privacy Policy</Link>
                <Link href="/terms" className="block text-sm text-gray-700 dark:text-zinc-300 hover:text-orange-500 transition">Terms of Service</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-zinc-300">
                  <Mail className="h-4 w-4 text-orange-500" />
                  support@joshseclogs.com
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <p className="text-xs leading-5 text-gray-700 dark:text-zinc-300">
                    24/7 customer support with secure encrypted transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-orange-500/10 pt-6 text-xs text-gray-400 dark:text-zinc-500 md:flex-row">
            <p>&copy; 2026 JoshSecLogs. All Rights Reserved.</p>
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-orange-500 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-orange-500 transition">Terms</Link>
              <Link href="/cookies" className="hover:text-orange-500 transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
