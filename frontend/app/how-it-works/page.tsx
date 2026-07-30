"use client";

import Link from "next/link";
import {
  UserPlus,
  Wallet,
  Search,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Clock,
  Headphones,
  ArrowRight,
} from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in seconds with just your email and password. Every account gets a unique referral code you can share to earn 5% commission on your friends' purchases. No credit card required to join.",
  },
  {
    icon: Wallet,
    title: "Fund Your Wallet",
    description:
      "Top up your wallet balance using Paystack with Nigerian Naira (₦). Your funds are stored securely and used automatically when you make a purchase. No minimum deposit — add exactly what you need.",
  },
  {
    icon: Search,
    title: "Browse the Marketplace",
    description:
      "Explore our full catalogue of virtual phone numbers from 50+ countries and social media accounts across Facebook, Instagram, Twitter, TikTok and more. Filter by country, service, or category to find exactly what you need.",
  },
  {
    icon: ShoppingCart,
    title: "Purchase & Receive Instantly",
    description:
      "Click to buy and your virtual number or social account is delivered instantly. Phone numbers are ready to receive SMS within seconds. Social log credentials are available immediately in your purchases dashboard.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Numbers are activated the moment you complete checkout. No waiting, no manual processing — your purchase is ready to use immediately.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "All transactions are encrypted end-to-end. Your personal data is never shared with third parties, and wallet balances are protected by industry-standard security.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Our marketplace runs around the clock. Buy numbers and accounts at any hour, day or night, with automated delivery that never sleeps.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Run into an issue? Our support team is available 24/7 to help with refunds, replacements, and any questions about your purchases.",
  },
];

export default function HowItWorksPage() {
  return (
    <PublicPageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            Simple & Fast
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            How JoshSecLogs Works
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-zinc-300">
            From sign-up to SMS verification in under two minutes. Our platform
            is designed to get you the virtual numbers and social accounts you
            need with zero friction.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6 transition duration-300 hover:border-orange-500/40"
              >
                <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                  <Icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-zinc-300">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Why Choose JoshSecLogs
          </h2>
          <p className="mt-4 text-gray-700 dark:text-zinc-300">
            Built for speed, security, and reliability.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex gap-5 rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                  <Icon className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-zinc-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-10 text-center lg:p-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-gray-700 dark:text-zinc-300">
            Create your free account and browse the marketplace today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 px-8 py-3.5 font-semibold text-gray-900 dark:text-white transition hover:bg-orange-500/10"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
