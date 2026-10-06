"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Code2,
  Globe2,
  Headphones,
  LockKeyhole,
  Menu,
  MessageCircle,
  Moon,
  Music2,
  PackageCheck,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

const services = [
  {
    name: "Virtual Numbers",
    description:
      "Reliable numbers for verification and supported online services.",
    icon: Smartphone,
  },
  {
    name: "Social Logs",
    description:
      "Digital products and supported social media services in one place.",
    icon: ShieldCheck,
  },
  {
    name: "API Access",
    description:
      "Connect supported JoshSecLogs services directly to your applications.",
    icon: Code2,
  },
];

const faqs = [
  {
    question: "How quickly are virtual numbers delivered?",
    answer:
      "Most available numbers are delivered within seconds after a successful purchase, depending on availability and the selected service.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "You can fund your JoshSecLogs wallet using the payment methods currently available in your account.",
  },
  {
    question: "Can I use JoshSecLogs for API integrations?",
    answer:
      "Yes. API access is available for developers who want to integrate supported JoshSecLogs services into their own applications.",
  },
  {
    question: "Is my account information secure?",
    answer:
      "JoshSecLogs is designed with account protection, transaction monitoring and secure wallet management in mind.",
  },
  {
    question: "Can I use JoshSecLogs from my phone?",
    answer:
      "Yes. The platform is responsive and can be accessed from supported mobile devices, tablets and desktop browsers.",
  },
];

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme();

  const dark = resolvedTheme === "dark";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main
      className={`min-h-screen overflow-x-hidden ${
        dark
          ? "bg-[#071321] text-white"
          : "bg-white text-[#071a34]"
      }`}
    >
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          dark
            ? "border-slate-800 bg-[#071321]/90"
            : "border-orange-100 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 lg:px-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-7 -rotate-6 items-center justify-center rounded-[5px] bg-black shadow-sm">
              <Smartphone className="h-5 w-5 text-orange-500" />
            </div>

            <div>
              <div className="text-[21px] font-extrabold tracking-tight">
                Josh<span className="text-orange-500">Sec</span>Logs
              </div>

              <div className="text-[7px] font-medium tracking-[3px] text-slate-500">
                LOGIN · CONNECT · STAY PRIVATE
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-medium lg:flex">
            <Link
              href="/"
              className="font-semibold text-orange-500"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="transition hover:text-orange-500"
            >
              Shop
            </Link>

            <a
              href="#how-it-works"
              className="transition hover:text-orange-500"
            >
              How It Works
            </a>

            <Link
              href="/api"
              className="transition hover:text-orange-500"
            >
              API Docs
            </Link>

            <a
              href="#faq"
              className="transition hover:text-orange-500"
            >
              FAQ
            </a>

            <a
              href="#contact"
              className="transition hover:text-orange-500"
            >
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() =>
                setTheme(dark ? "light" : "dark")
              }
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                dark
                  ? "border-slate-700 bg-slate-900 hover:border-orange-500"
                  : "border-slate-200 bg-white hover:border-orange-400"
              }`}
              aria-label="Toggle theme"
            >
              {dark ? (
                <Sun className="h-4 w-4 text-orange-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            <Link
              href="/login"
              className="rounded-lg border border-orange-500 px-5 py-2 text-[12px] font-semibold text-orange-500 transition hover:bg-orange-50 dark:hover:bg-orange-500/10"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-orange-500 px-6 py-2 text-[12px] font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,.22)] transition hover:bg-orange-600"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            className={`flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden ${
              dark
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
            aria-label="Open menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div
            className={`border-t px-5 pb-5 pt-4 lg:hidden ${
              dark
                ? "border-slate-800 bg-[#071321]"
                : "border-orange-100 bg-white"
            }`}
          >
            <div className="flex flex-col gap-4 text-sm">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileOpen(false)}
              >
                Shop
              </Link>

              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
              >
                How It Works
              </a>

              <Link
                href="/api"
                onClick={() => setMobileOpen(false)}
              >
                API Docs
              </Link>

              <a
                href="#faq"
                onClick={() => setMobileOpen(false)}
              >
                FAQ
              </a>

              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </a>

              <button
                type="button"
                onClick={() =>
                  setTheme(dark ? "light" : "dark")
                }
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left ${
                  dark
                    ? "border-slate-700"
                    : "border-slate-200"
                }`}
              >
                {dark ? (
                  <Sun className="h-4 w-4 text-orange-500" />
                ) : (
                  <Moon className="h-4 w-4 text-orange-500" />
                )}

                {dark ? "Light Mode" : "Dark Mode"}
              </button>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-orange-500 py-3 text-center font-semibold text-orange-500"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-orange-500 py-3 text-center font-bold text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        className={`relative overflow-hidden ${
          dark
            ? "bg-[#071321]"
            : "bg-gradient-to-br from-white via-[#fffaf6] to-[#fff1e5]"
        }`}
      >
        <div
          className={`absolute right-[-180px] top-[-150px] h-[600px] w-[600px] rounded-full border ${
            dark
              ? "border-orange-500/10"
              : "border-orange-200/60"
          }`}
        />

        <div
          className={`absolute right-[-80px] top-[-50px] h-[450px] w-[450px] rounded-full border ${
            dark
              ? "border-orange-500/10"
              : "border-orange-200/50"
          }`}
        />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-14 lg:grid-cols-[.95fr_1.05fr] lg:px-7 lg:py-24">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold ${
                  dark
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : "border-orange-300 bg-orange-50 text-orange-600"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted Digital Marketplace
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold ${
                  dark
                    ? "border-slate-700 bg-slate-900 text-slate-300"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className="text-orange-500">₦</span>
                Naira Pricing
              </div>
            </div>

            <h1 className="max-w-[650px] text-[45px] font-black leading-[.98] tracking-[-2.5px] sm:text-[58px] lg:text-[64px]">
              Buy Premium{" "}
              <span className="text-orange-500">
                Virtual Numbers
              </span>{" "}
              & Verified Accounts
            </h1>

            <p
              className={`mt-6 max-w-[570px] text-[15px] leading-7 ${
                dark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Get reliable virtual numbers, supported digital
              services and social products for your online needs.
              Fast delivery, Naira pricing and a centralized
              dashboard for your account, wallet and orders.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center gap-3 rounded-[9px] bg-orange-500 px-7 text-[13px] font-bold text-white shadow-[0_10px_25px_rgba(249,115,22,.25)] transition hover:bg-orange-600"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#how-it-works"
                className={`inline-flex h-12 items-center gap-3 rounded-[9px] border px-7 text-[13px] font-bold transition ${
                  dark
                    ? "border-slate-700 text-white hover:border-orange-500"
                    : "border-orange-500 text-[#071a34] hover:bg-orange-50"
                }`}
              >
                How It Works
                <ArrowRight className="h-4 w-4 text-orange-500" />
              </a>
            </div>

            <div className="mt-9 grid max-w-[620px] grid-cols-2 gap-5 sm:grid-cols-4">
              <MiniFeature
                icon={<Zap />}
                title="Fast Delivery"
                text="Get services quickly"
              />

              <MiniFeature
                icon={<ShieldCheck />}
                title="Reliable"
                text="Built for trust"
              />

              <MiniFeature
                icon={<WalletCards />}
                title="Naira Wallet"
                text="Easy funding"
              />

              <MiniFeature
                icon={<Headphones />}
                title="Support"
                text="Help when needed"
              />
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto h-[420px] w-full max-w-[640px] sm:h-[480px] lg:h-[540px]">
            <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/10 blur-3xl" />

            <div
              className={`absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                dark
                  ? "border-orange-500/20"
                  : "border-orange-200/60"
              }`}
            />

            <div
              className={`absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${
                dark
                  ? "border-orange-500/15"
                  : "border-orange-200/50"
              }`}
            />

            {/* Tagline */}
            <div className="absolute right-0 top-0 z-20 text-right text-[13px] font-bold italic leading-tight text-orange-500">
              Your privacy
              <br />
              our priority!

              <svg
                className="ml-auto mt-1 h-7 w-9"
                viewBox="0 0 36 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M30 2c2 9-6 18-22 21" />
                <path d="M14 17 7 23l9 3" />
              </svg>
            </div>

            {/* Dashboard preview */}
            <div
              className={`absolute right-0 top-[19%] z-0 hidden w-[76%] overflow-hidden rounded-2xl border shadow-[0_25px_60px_rgba(0,0,0,.15)] sm:flex ${
                dark
                  ? "border-slate-700 bg-[#0d1b2a]"
                  : "border-slate-100 bg-white"
              }`}
            >
              <div className="w-[36%] shrink-0 bg-[#0b1420] p-4 text-white">
                <div className="mb-4 text-[10px] font-extrabold">
                  Josh<span className="text-orange-500">Sec</span>Logs
                </div>

                {[
                  "Dashboard",
                  "Marketplace",
                  "Social Logs",
                  "My Purchases",
                  "Orders",
                  "Wallet",
                  "Referrals",
                  "API Access",
                  "Settings",
                ].map((item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-md px-2 py-1.5 text-[7px] font-semibold ${
                      i === 0
                        ? "bg-orange-500 text-white"
                        : "text-slate-300"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex-1 p-4">
                <div
                  className={`rounded-xl border p-3 ${
                    dark
                      ? "border-slate-700"
                      : "border-slate-100"
                  }`}
                >
                  <div className="text-[8px] text-slate-500">
                    Wallet Balance
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span
                      className={`text-[18px] font-black ${
                        dark
                          ? "text-white"
                          : "text-[#071a34]"
                      }`}
                    >
                      ₦125.00
                    </span>

                    <span className="rounded-md bg-orange-500 px-3 py-1.5 text-[8px] font-bold text-white">
                      Fund Wallet
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <StatRow
                    icon={<PackageCheck className="h-3 w-3" />}
                    label="Active Orders"
                    value="3"
                    dark={dark}
                  />

                  <StatRow
                    icon={<Smartphone className="h-3 w-3" />}
                    label="Available Numbers"
                    value="24"
                    dark={dark}
                  />

                  <StatRow
                    icon={<ShieldCheck className="h-3 w-3" />}
                    label="Success Rate"
                    value="99.8%"
                    dark={dark}
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="absolute left-[1%] top-[5%] z-10 w-[69%] sm:left-[-5%] sm:top-[6%] sm:w-[58%]">
              <Image
                src="/hero/phones.png"
                alt="JoshSecLogs virtual numbers"
                width={1080}
                height={1080}
                priority
                className="h-auto w-full object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.25)]"
              />
            </div>

            {/* Floating icons */}
            <div className="absolute left-[2%] top-[12%] z-20 animate-bounce [animation-duration:4s]">
              <FloatingIcon
                className="bg-[#25D366]"
                icon={
                  <MessageCircle className="h-6 w-6 text-white" />
                }
              />
            </div>

            <div className="absolute left-[-2%] top-[34%] z-20 animate-bounce [animation-delay:500ms] [animation-duration:5s]">
              <FloatingIcon
                className="bg-[#229ED9]"
                icon={
                  <Send className="h-6 w-6 text-white" />
                }
              />
            </div>

            <div className="absolute left-[1%] top-[56%] z-20 animate-bounce [animation-delay:300ms] [animation-duration:4.5s]">
              <FloatingIcon
                className="bg-black"
                icon={
                  <Music2 className="h-6 w-6 text-white" />
                }
              />
            </div>

            <div className="absolute left-[7%] top-[75%] z-20 animate-bounce [animation-delay:700ms] [animation-duration:5.5s]">
              <FloatingIcon
                className="bg-gradient-to-tr from-[#f9a03f] via-[#e1306c] to-[#833ab4]"
                icon={
                  <Camera className="h-6 w-6 text-white" />
                }
              />
            </div>

            <div className="absolute left-[40%] top-[88%] z-20 animate-bounce [animation-duration:4.8s]">
              <FloatingIcon
                className="bg-black"
                icon={
                  <span className="text-lg font-black text-white">
                    X
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATISTICS
      ========================================================= */}
      <section
        className={`px-5 py-14 lg:px-7 ${
          dark
            ? "border-y border-slate-800 bg-[#081522]"
            : "border-y border-orange-100 bg-[#fffaf6]"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StrongStat
              number="180+"
              label="Countries"
              dark={dark}
            />

            <StrongStat
              number="500+"
              label="Services"
              dark={dark}
            />

            <StrongStat
              number="2.8M+"
              label="SMS Delivered"
              dark={dark}
            />

            <StrongStat
              number="48K+"
              label="Users"
              dark={dark}
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          POPULAR SERVICES
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#071321]" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Popular Services"
            title="Get Started With Popular Services"
            description="Quickly access some of the most requested services available on JoshSecLogs."
            dark={dark}
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PopularServiceCard
              icon={<MessageCircle />}
              name="WhatsApp Verification"
              price="From ₦XXX"
              status="Available"
              dark={dark}
            />

            <PopularServiceCard
              icon={<Send />}
              name="Telegram Verification"
              price="From ₦XXX"
              status="Available"
              dark={dark}
            />

            <PopularServiceCard
              icon={<Music2 />}
              name="TikTok Verification"
              price="From ₦XXX"
              status="Available"
              dark={dark}
            />

            <PopularServiceCard
              icon={<Globe2 />}
              name="Facebook Verification"
              price="From ₦XXX"
              status="Available"
              dark={dark}
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-lg border border-orange-500 px-6 py-3 text-sm font-bold text-orange-500 transition hover:bg-orange-500 hover:text-white"
            >
              Explore Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how-it-works"
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#0a1725]" : "bg-[#fafafa]"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Simple Steps"
            title="How JoshSecLogs Works"
            description="Get started in three simple steps and manage everything from one account."
            dark={dark}
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <StepCard
              number="01"
              icon={<Smartphone />}
              title="Create Account"
              text="Register your JoshSecLogs account in seconds using your email and account details."
              dark={dark}
            />

            <StepCard
              number="02"
              icon={<WalletCards />}
              title="Fund Wallet"
              text="Add funds to your wallet using one of the payment methods currently available."
              dark={dark}
            />

            <StepCard
              number="03"
              icon={<PackageCheck />}
              title="Purchase & Enjoy"
              text="Choose a service, complete your purchase and access the details from your account."
              dark={dark}
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          MARKETPLACE PREVIEW
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#071321]" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                Marketplace
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Find the service
                <span className="text-orange-500">
                  {" "}
                  you need.
                </span>
              </h2>

              <p
                className={`mt-4 max-w-lg text-sm leading-7 ${
                  dark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Browse available services, check supported
                countries and manage your purchases directly
                from your JoshSecLogs account.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                View Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className={`overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,.08)] ${
                dark
                  ? "border-slate-800 bg-[#071321]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`border-b px-5 py-4 ${
                  dark
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black">
                      Marketplace
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Available services
                    </p>
                  </div>

                  <span className="rounded-lg bg-orange-500/10 px-3 py-2 text-[10px] font-bold text-orange-500">
                    ₦ Naira
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <div
                    className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      dark
                        ? "border-slate-700 bg-[#0a1725] text-slate-500"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <Search className="h-3.5 w-3.5" />
                    Search services...
                  </div>

                  <div
                    className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:flex ${
                      dark
                        ? "border-slate-700"
                        : "border-slate-200"
                    }`}
                  >
                    🇳🇬 Nigeria
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </div>
              </div>

              <div
                className={`divide-y ${
                  dark
                    ? "divide-slate-800"
                    : "divide-slate-100"
                }`}
              >
                <MarketplaceRow
                  icon={<MessageCircle />}
                  name="WhatsApp"
                  country="Nigeria"
                  dark={dark}
                />

                <MarketplaceRow
                  icon={<Send />}
                  name="Telegram"
                  country="Nigeria"
                  dark={dark}
                />

                <MarketplaceRow
                  icon={<Music2 />}
                  name="TikTok"
                  country="Nigeria"
                  dark={dark}
                />

                <MarketplaceRow
                  icon={<Globe2 />}
                  name="Facebook"
                  country="Nigeria"
                  dark={dark}
                />
              </div>

              <div
                className={`border-t p-4 ${
                  dark
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                <Link
                  href="/shop"
                  className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-xs font-bold text-white transition hover:bg-orange-600"
                >
                  View Marketplace
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE US
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#0a1725]" : "bg-[#fafafa]"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="Built for Speed & Reliability"
            description="Everything you need to manage virtual numbers, digital services and online verification from one platform."
            dark={dark}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon={<Zap />}
              title="Fast Delivery"
              text="Get available services without unnecessary waiting."
              dark={dark}
            />

            <BenefitCard
              icon={<LockKeyhole />}
              title="Secure Platform"
              text="Account, wallet and transaction information are handled with security in mind."
              dark={dark}
            />

            <BenefitCard
              icon={<Globe2 />}
              title="Global Coverage"
              text="Access supported services across countries from one dashboard."
              dark={dark}
            />

            <BenefitCard
              icon={<Headphones />}
              title="Responsive Support"
              text="Get help when you need it through available support channels."
              dark={dark}
            />
          </div>

          <div
            className={`mt-8 grid gap-6 rounded-2xl border p-7 lg:grid-cols-[1fr_auto] lg:items-center ${
              dark
                ? "border-slate-800 bg-[#071321]"
                : "border-orange-100 bg-white"
            }`}
          >
            <div>
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles className="h-5 w-5" />

                <span className="text-xs font-bold uppercase tracking-wider">
                  One platform
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-black">
                Manage everything from your dashboard.
              </h3>

              <p
                className={`mt-2 max-w-2xl text-sm leading-6 ${
                  dark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Purchase services, monitor orders, fund your
                wallet, view transactions, manage referrals and
                access API tools without jumping between multiple
                platforms.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECURITY / TRUST
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#071321]" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <div
            className={`overflow-hidden rounded-3xl border ${
              dark
                ? "border-slate-800 bg-[#0a1725]"
                : "border-orange-100 bg-[#fffaf6]"
            }`}
          >
            <div className="grid gap-10 p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-12">
              <div>
                <div className="flex items-center gap-2 text-orange-500">
                  <ShieldCheck className="h-5 w-5" />

                  <span className="text-xs font-bold uppercase tracking-wider">
                    Built with security in mind
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-black">
                  A platform designed for
                  <span className="text-orange-500">
                    {" "}
                    reliable access.
                  </span>
                </h2>

                <p
                  className={`mt-4 text-sm leading-7 ${
                    dark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Manage your account, wallet and transactions
                  through one centralized platform with security
                  and reliability considered throughout the
                  experience.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TrustItem
                  icon={<WalletCards />}
                  text="Secure wallet transactions"
                  dark={dark}
                />

                <TrustItem
                  icon={<LockKeyhole />}
                  text="Protected account access"
                  dark={dark}
                />

                <TrustItem
                  icon={<PackageCheck />}
                  text="Reliable service delivery"
                  dark={dark}
                />

                <TrustItem
                  icon={<ShieldCheck />}
                  text="Transaction monitoring"
                  dark={dark}
                />

                <TrustItem
                  icon={<Headphones />}
                  text="Responsive support"
                  dark={dark}
                />

                <TrustItem
                  icon={<Zap />}
                  text="Fast service processing"
                  dark={dark}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#0a1725]" : "bg-[#fafafa]"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <SectionHeading
            eyebrow="Our Services"
            title="Everything You Need in One Place"
            description="Choose the service that fits your needs and manage everything from your JoshSecLogs account."
            dark={dark}
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.name}
                  className={`group rounded-2xl border p-7 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl ${
                    dark
                      ? "border-slate-800 bg-[#071321]"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-orange-500 ${
                      dark
                        ? "bg-orange-500/10"
                        : "bg-orange-50"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    {service.name}
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-6 ${
                      dark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {service.description}
                  </p>

                  <Link
                    href="/shop"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-500"
                  >
                    Explore
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          SOCIAL LOGS
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#071321]" : "bg-[#fff8f2]"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                Social Logs
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Supported Social Media
                <span className="text-orange-500">
                  {" "}
                  Products
                </span>
              </h2>

              <p
                className={`mt-4 max-w-lg text-sm leading-7 ${
                  dark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Explore supported social media products and
                digital services through the JoshSecLogs
                marketplace.
              </p>

              <Link
                href="/dashboard/social-logs"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Explore Social Logs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <SocialProductCard
                name="WhatsApp"
                icon={<MessageCircle />}
                description="Verification services"
                dark={dark}
              />

              <SocialProductCard
                name="Telegram"
                icon={<Send />}
                description="Verification services"
                dark={dark}
              />

              <SocialProductCard
                name="TikTok"
                icon={<Music2 />}
                description="Digital services"
                dark={dark}
              />

              <SocialProductCard
                name="Facebook"
                icon={<Globe2 />}
                description="Digital services"
                dark={dark}
              />

              <SocialProductCard
                name="YouTube"
                icon={<Camera />}
                description="Supported services"
                dark={dark}
              />

              <SocialProductCard
                name="X / Twitter"
                icon={
                  <span className="text-xl font-black">
                    X
                  </span>
                }
                description="Supported services"
                dark={dark}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DEVELOPER API
      ========================================================= */}
      <section
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#0a1725]" : "bg-[#fafafa]"
        }`}
      >
        <div className="mx-auto max-w-[1240px]">
          <div
            className={`overflow-hidden rounded-3xl border ${
              dark
                ? "border-slate-800 bg-[#071321]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                  <Code2 className="h-3.5 w-3.5" />
                  Developer API
                </div>

                <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                  Built for
                  <span className="text-orange-500">
                    {" "}
                    developers.
                  </span>
                </h2>

                <p
                  className={`mt-4 max-w-lg text-sm leading-7 ${
                    dark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Integrate supported JoshSecLogs services
                  directly into your applications and automate
                  your workflow through the API.
                </p>

                <Link
                  href="/api"
                  className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  View API Docs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex items-center p-5 sm:p-8">
                <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#050d16] shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

                    <span className="ml-3 text-[10px] text-slate-500">
                      JoshSecLogs API
                    </span>
                  </div>

                  <div className="space-y-4 p-6 font-mono text-xs">
                    <div>
                      <span className="text-orange-400">
                        GET
                      </span>

                      <span className="ml-3 text-slate-300">
                        /api/v1/services
                      </span>
                    </div>

                    <div>
                      <span className="text-orange-400">
                        GET
                      </span>

                      <span className="ml-3 text-slate-300">
                        /api/v1/orders
                      </span>
                    </div>

                    <div>
                      <span className="text-orange-400">
                        POST
                      </span>

                      <span className="ml-3 text-slate-300">
                        /api/v1/purchase
                      </span>
                    </div>

                    <div className="mt-6 rounded-lg bg-[#0b1622] p-4 text-[10px] leading-6 text-slate-500">
                      <span className="text-orange-400">
                        {"{"}
                      </span>

                      <br />

                      &nbsp;&nbsp;&quot;status&quot;:
                      <span className="text-emerald-400">
                        &quot;success&quot;
                      </span>
                      ,

                      <br />

                      &nbsp;&nbsp;&quot;message&quot;:
                      <span className="text-emerald-400">
                        &quot;Request processed&quot;
                      </span>

                      <br />

                      <span className="text-orange-400">
                        {"}"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section
        id="faq"
        className={`px-5 py-20 lg:px-7 ${
          dark ? "bg-[#071321]" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-[900px]">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Find answers to some of the most common questions about JoshSecLogs."
            dark={dark}
            center
          />

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-xl border ${
                    dark
                      ? "border-slate-800 bg-[#0a1725]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        isOpen ? null : index
                      )
                    }
                    className="flex w-full items-center justify-between px-5 py-5 text-left text-sm font-bold"
                  >
                    <span>{faq.question}</span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-orange-500 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className={`border-t px-5 pb-5 pt-4 text-sm leading-6 ${
                        dark
                          ? "border-slate-800 text-slate-400"
                          : "border-slate-100 text-slate-500"
                      }`}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-5 pb-20 lg:px-7">
        <div className="mx-auto max-w-[1240px] overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 px-7 py-14 text-white shadow-[0_25px_70px_rgba(249,115,22,.25)] sm:px-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-orange-100">
                <Sparkles className="h-5 w-5" />

                <span className="text-xs font-bold uppercase tracking-wider">
                  JoshSecLogs
                </span>
              </div>

              <h2 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
                Everything you need.
                <br />
                One account.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-orange-50">
                Virtual numbers, digital services, wallet,
                orders and API access — all managed from one
                JoshSecLogs account.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-black text-orange-600 shadow-lg transition hover:bg-orange-50"
            >
              Create Your Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer
        id="contact"
        className="bg-[#06111e] px-5 py-14 text-white lg:px-7"
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-7 -rotate-6 items-center justify-center rounded bg-black">
                  <Smartphone className="h-5 w-5 text-orange-500" />
                </div>

                <div>
                  <div className="text-xl font-extrabold">
                    Josh<span className="text-orange-500">
                      Sec
                    </span>
                    Logs
                  </div>

                  <div className="text-[7px] tracking-[3px] text-slate-500">
                    LOGIN · CONNECT · STAY PRIVATE
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                Premium virtual numbers, social products and
                digital services for developers, marketers and
                businesses.
              </p>

              <div className="mt-5 flex gap-2">
                <SocialFooterButton label="X" />
                <SocialFooterButton label="TG" />
                <SocialFooterButton label="WA" />
              </div>
            </div>

            <FooterColumn
              title="Platform"
              links={[
                ["Home", "/"],
                ["Shop", "/shop"],
                ["How It Works", "#how-it-works"],
                ["Dashboard", "/dashboard"],
              ]}
            />

            <FooterColumn
              title="Developers"
              links={[
                ["API Docs", "/api"],
                ["API Access", "/dashboard/api"],
                ["Marketplace", "/shop"],
              ]}
            />

            <FooterColumn
              title="Account"
              links={[
                ["Login", "/login"],
                ["Register", "/register"],
                ["Wallet", "/dashboard/wallet"],
                ["Orders", "/dashboard/orders"],
              ]}
            />

            <FooterColumn
              title="Support"
              links={[
                ["FAQ", "#faq"],
                ["Contact", "#contact"],
                ["Terms", "/terms"],
                ["Privacy", "/privacy"],
              ]}
            />
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} JoshSecLogs.
              All rights reserved.
            </p>

            <p>
              Built for reliable digital services.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =============================================================
   MINI FEATURE
============================================================= */

function MiniFeature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5 text-orange-500">
        {icon}
      </div>

      <div>
        <div className="text-[10px] font-bold">
          {title}
        </div>

        <div className="mt-0.5 text-[8px] text-slate-500">
          {text}
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   STRONG STAT
============================================================= */

function StrongStat({
  number,
  label,
  dark,
}: {
  number: string;
  label: string;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        dark
          ? "border-slate-800 bg-[#0a1725]"
          : "border-orange-100 bg-white"
      }`}
    >
      <div className="text-3xl font-black tracking-tight text-orange-500 sm:text-4xl">
        {number}
      </div>

      <div
        className={`mt-2 text-xs font-semibold ${
          dark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

/* =============================================================
   POPULAR SERVICE
============================================================= */

function PopularServiceCard({
  icon,
  name,
  price,
  status,
  dark,
}: {
  icon: React.ReactNode;
  name: string;
  price: string;
  status: string;
  dark: boolean;
}) {
  return (
    <Link
      href="/shop"
      className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl ${
        dark
          ? "border-slate-800 bg-[#0a1725]"
          : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-orange-500 ${
            dark
              ? "bg-orange-500/10"
              : "bg-orange-50"
          }`}
        >
          {icon}
        </div>

        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-500">
          {status}
        </span>
      </div>

      <h3 className="mt-5 text-sm font-black">
        {name}
      </h3>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`text-xs ${
            dark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          Starting price
        </span>

        <span className="text-sm font-black text-orange-500">
          {price}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-orange-500">
        View service
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* =============================================================
   MARKETPLACE ROW
============================================================= */

function MarketplaceRow({
  icon,
  name,
  country,
  dark,
}: {
  icon: React.ReactNode;
  name: string;
  country: string;
  dark: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-orange-500 ${
            dark
              ? "bg-orange-500/10"
              : "bg-orange-50"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="text-xs font-bold">
            {name}
          </div>

          <div className="mt-0.5 text-[10px] text-slate-500">
            🇳🇬 {country}
          </div>
        </div>
      </div>

      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Available
      </span>
    </div>
  );
}

/* =============================================================
   SECTION HEADING
============================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  dark,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark: boolean;
  center?: boolean;
}) {
  return (
    <div
      className={
        center
          ? "mx-auto max-w-2xl text-center"
          : ""
      }
    >
      <div
        className={`mb-3 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500 ${
          dark
            ? "border-orange-500/20 bg-orange-500/10"
            : "border-orange-200 bg-orange-50"
        }`}
      >
        {eyebrow}
      </div>

      <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p
        className={`mt-4 max-w-2xl text-sm leading-7 ${
          dark
            ? "text-slate-400"
            : "text-slate-500"
        } ${center ? "mx-auto" : ""}`}
      >
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   STEP CARD
============================================================= */

function StepCard({
  number,
  icon,
  title,
  text,
  dark,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  dark: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-7 ${
        dark
          ? "border-slate-800 bg-[#071321]"
          : "border-slate-100 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
          {number}
        </span>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-orange-500 ${
            dark
              ? "bg-orange-500/10"
              : "bg-orange-50"
          }`}
        >
          {icon}
        </span>
      </div>

      <h3 className="mt-7 text-xl font-black">
        {title}
      </h3>

      <p
        className={`mt-3 text-sm leading-6 ${
          dark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

/* =============================================================
   BENEFIT CARD
============================================================= */

function BenefitCard({
  icon,
  title,
  text,
  dark,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-7 transition hover:-translate-y-1 hover:border-orange-300 ${
        dark
          ? "border-slate-800 bg-[#071321]"
          : "border-slate-100 bg-white"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-orange-500 ${
          dark
            ? "bg-orange-500/10"
            : "bg-orange-50"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-black">
        {title}
      </h3>

      <p
        className={`mt-2 text-sm leading-6 ${
          dark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

/* =============================================================
   TRUST ITEM
============================================================= */

function TrustItem({
  icon,
  text,
  dark,
}: {
  icon: React.ReactNode;
  text: string;
  dark: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 ${
        dark
          ? "border-slate-800 bg-[#071321]"
          : "border-orange-100 bg-white"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
        {icon}
      </div>

      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

        <span className="text-xs font-bold">
          {text}
        </span>
      </div>
    </div>
  );
}

/* =============================================================
   SOCIAL PRODUCT CARD
============================================================= */

function SocialProductCard({
  name,
  icon,
  description,
  dark,
}: {
  name: string;
  icon: React.ReactNode;
  description: string;
  dark: boolean;
}) {
  return (
    <Link
      href="/dashboard/social-logs"
      className={`group rounded-2xl border p-5 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg ${
        dark
          ? "border-slate-800 bg-[#071321]"
          : "border-orange-100 bg-white"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-orange-500 ${
          dark
            ? "bg-orange-500/10"
            : "bg-orange-50"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-black">
        {name}
      </h3>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-orange-500">
        Explore
        <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* =============================================================
   FOOTER COLUMN
============================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold">
        {title}
      </h3>

      <div className="mt-4 flex flex-col gap-3">
        {links.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="text-xs text-slate-500 transition hover:text-orange-400"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* =============================================================
   SOCIAL FOOTER BUTTON
============================================================= */

function SocialFooterButton({
  label,
}: {
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0a1725] text-[10px] font-black text-slate-400 transition hover:border-orange-500 hover:text-orange-500"
    >
      {label}
    </button>
  );
}

/* =============================================================
   FLOATING ICON
============================================================= */

function FloatingIcon({
  className,
  icon,
}: {
  className: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl ${className}`}
    >
      {icon}
    </div>
  );
}

/* =============================================================
   STAT ROW
============================================================= */

function StatRow({
  icon,
  label,
  value,
  dark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
        dark
          ? "border-slate-700"
          : "border-slate-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-50 text-orange-500">
          {icon}
        </span>

        <span className="text-[8px] text-slate-500">
          {label}
        </span>
      </div>

      <span
        className={`text-[11px] font-bold ${
          dark
            ? "text-white"
            : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}