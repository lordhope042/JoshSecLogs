"use client";

import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";

import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaGithub,
  FaTelegram,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-orange-500/20 bg-white dark:bg-[#050816]">

      {/* Glow */}
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">

        {/* Top */}

        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <h2 className="text-4xl font-black">
              <span className="text-gray-900 dark:text-white">Josh</span>
              <span className="text-orange-500">Sec</span>
              <span className="text-gray-900 dark:text-white">Logs</span>
            </h2>

            <p className="mt-6 max-w-md leading-8 text-gray-500 dark:text-zinc-400">
              Purchase premium virtual phone numbers for SMS verification,
              account creation, API integration and business automation.
            </p>

            <div className="mt-8 flex gap-4">

              {[
                FaFacebookF,
                FaXTwitter,
                FaInstagram,
                FaGithub,
                FaTelegram,
              ].map((Icon, index) => (
                <button
                  key={index}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/20 bg-white dark:bg-[#0d1525] text-gray-500 dark:text-zinc-400 transition duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <Icon size={18} />
                </button>
              ))}

            </div>

          </div>

          {/* Company */}

          <div>

            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
              Company
            </h3>

            <div className="space-y-4">

              <Link href="/" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                Home
              </Link>

              <Link href="/pricing" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                Pricing
              </Link>

              <Link href="/how-it-works" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                How It Works
              </Link>

              <Link href="/contact" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                Contact
              </Link>

            </div>

          </div>

          {/* Resources */}

          <div>

            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
              Resources
            </h3>

            <div className="space-y-4">

              <Link href="/faq" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                FAQ
              </Link>

              <Link href="/api-docs" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                API Documentation
              </Link>

              <Link href="/privacy" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                Privacy Policy
              </Link>

              <Link href="/terms" className="block text-gray-500 dark:text-zinc-400 hover:text-orange-500">
                Terms of Service
              </Link>

            </div>

          </div>

          {/* Support */}

          <div>

            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
              Contact
            </h3>

            <div className="space-y-5">

              <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
                <Mail className="h-5 w-5 text-orange-500" />
                support@joshseclogs.com
              </div>

              <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
                <Phone className="h-5 w-5 text-orange-500" />
                +234 XXX XXX XXXX
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-4">

                <ShieldCheck className="mt-1 h-5 w-5 text-orange-500" />

                <p className="text-sm leading-6 text-gray-500 dark:text-zinc-400">
                  24/7 customer support with secure encrypted transactions
                  and instant SMS delivery.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Newsletter */}

        <div className="mt-20 rounded-3xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-10">

          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">

            <div>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Stay Updated
              </h3>

              <p className="mt-3 text-gray-500 dark:text-zinc-400">
                Receive updates about new countries, features and discounts.
              </p>

            </div>

            <div className="flex w-full max-w-xl gap-3">

              <input
                type="email"
                placeholder="Enter your email..."
                className="h-14 flex-1 rounded-xl border border-orange-500/20 bg-gray-50 dark:bg-[#08111d] px-5 text-gray-900 dark:text-white outline-none placeholder:text-zinc-500 focus:border-orange-500"
              />

              <button className="rounded-xl bg-orange-500 px-8 font-semibold text-white transition hover:bg-orange-600">
                Subscribe
              </button>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-orange-500/10 pt-8 text-sm text-gray-400 dark:text-zinc-500 md:flex-row">

          <p>
            © 2026 JoshSecLogs. All Rights Reserved.
          </p>

          <div className="flex gap-6">

            <Link href="/privacy" className="hover:text-orange-500">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-orange-500">
              Terms
            </Link>

            <Link href="/cookies" className="hover:text-orange-500">
              Cookies
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}