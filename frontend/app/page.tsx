"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowRight, Mail, Phone, ShieldCheck } from "lucide-react";
import {
  ShieldCheck as ShieldCheckIcon,
  Wallet,
  Smartphone,
  Globe,
  Clock3,
  KeyRound,
  ShoppingCart,
  MessageSquare,
  Star,
} from "lucide-react";
import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaGithub,
  FaTelegram,
} from "react-icons/fa6";
import {
  FaGoogle,
  FaFacebook,
  FaDiscord,
  FaTelegram as FaTelegramClassic,
} from "react-icons/fa";
import { SiWhatsapp, SiTiktok } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const statsData = [
  { number: 180, suffix: "+", title: "Countries" },
  { number: 500, suffix: "+", title: "Supported Services" },
  { number: 2800000, suffix: "+", title: "SMS Delivered" },
  { number: 48000, suffix: "+", title: "Happy Users" },
];

const trustedBrands = [
  { name: "Google", icon: FaGoogle },
  { name: "Telegram", icon: FaTelegramClassic },
  { name: "WhatsApp", icon: SiWhatsapp },
  { name: "Facebook", icon: FaFacebook },
  { name: "TikTok", icon: SiTiktok },
  { name: "Discord", icon: FaDiscord },
];

const supportedServices = [
  "WhatsApp",
  "Telegram",
  "Google",
  "Facebook",
  "TikTok",
  "Instagram",
  "Discord",
  "Twitter (X)",
  "Microsoft",
  "Amazon",
  "Netflix",
  "Binance",
];

const features = [
  {
    icon: ShieldCheckIcon,
    title: "100% Secure",
    description:
      "Your account, wallet and virtual numbers are protected with enterprise-grade security.",
  },
  {
    icon: Smartphone,
    title: "Instant SMS",
    description:
      "Receive verification codes within seconds from hundreds of supported services.",
  },
  {
    icon: Globe,
    title: "180+ Countries",
    description:
      "Buy virtual numbers from countries all over the world whenever you need them.",
  },
  {
    icon: Wallet,
    title: "Fast Wallet",
    description:
      "Deposit funds instantly and purchase numbers without unnecessary delays.",
  },
  {
    icon: Clock3,
    title: "24/7 Availability",
    description:
      "Our platform is online every minute of the day for uninterrupted access.",
  },
  {
    icon: KeyRound,
    title: "Developer API",
    description:
      "Automate your business with a powerful REST API built for developers.",
  },
];

const steps = [
  {
    number: "01",
    title: "Fund Wallet",
    icon: Wallet,
    text: "Deposit funds securely into your JoshSecLogs wallet.",
  },
  {
    number: "02",
    title: "Buy Number",
    icon: ShoppingCart,
    text: "Choose your preferred country and service, then purchase instantly.",
  },
  {
    number: "03",
    title: "Receive SMS",
    icon: MessageSquare,
    text: "Receive verification codes immediately and complete your registration.",
  },
];

const testimonials = [
  {
    name: "John David",
    role: "Software Developer",
    image: "/images/users/user1.jpg",
    review:
      "JoshSecLogs has become my go-to platform for SMS verification. The delivery speed is amazing and the API is easy to integrate.",
  },
  {
    name: "Aisha Bello",
    role: "Digital Marketer",
    image: "/images/users/user2.jpg",
    review:
      "I've used many virtual number providers, but this is by far the fastest and most reliable. Highly recommended.",
  },
  {
    name: "Michael James",
    role: "Business Owner",
    image: "/images/users/user3.jpg",
    review:
      "Excellent pricing, premium support and thousands of available numbers. Exactly what my business needed.",
  },
];

const faqs = [
  {
    question: "What is a virtual phone number?",
    answer:
      "A virtual phone number allows you to receive SMS verification codes online without using your personal SIM card.",
  },
  {
    question: "How quickly will I receive my SMS?",
    answer:
      "Most SMS messages arrive within a few seconds after the service sends the verification code.",
  },
  {
    question: "Which countries are supported?",
    answer:
      "JoshSecLogs supports numbers from more than 180 countries with thousands of available services.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "You can fund your wallet using Paystack, bank transfer, and other supported payment methods.",
  },
  {
    question: "Do you provide API access?",
    answer:
      "Yes. Developers can integrate directly with our REST API to automate virtual number purchases and SMS retrieval.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "If an order fails before a number is successfully assigned, the amount is automatically returned to your wallet.",
  },
];

/* ------------------------------------------------------------------ */
/*  Unified Stats — single bar with dividers, not 4 separate cards     */
/* ------------------------------------------------------------------ */

function Stats() {
  return (
    <section className="bg-gray-50 dark:bg-[#070b17] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 divide-y divide-orange-500/10 rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] md:grid-cols-4 md:divide-x md:divide-y-0">
          {statsData.map((item) => (
            <div key={item.title} className="p-8 text-center md:p-10">
              <h2 className="text-4xl font-black text-orange-500 md:text-5xl">
                <CountUp end={item.number} duration={3} separator="," />
                {item.suffix}
              </h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400 md:text-base">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust Strip — slim logo row, replaces the old card-grid section    */
/* ------------------------------------------------------------------ */

function TrustStrip() {
  return (
    <section className="bg-white dark:bg-[#050816] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-sm uppercase tracking-[4px] text-gray-400 dark:text-zinc-500">
          Trusted With 500+ Online Services
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {trustedBrands.map((brand) => {
            const Icon = brand.icon;
            return (
              <div
                key={brand.name}
                className="group flex items-center gap-2 text-gray-400 dark:text-zinc-500 grayscale transition duration-300 hover:text-orange-500 hover:grayscale-0"
              >
                <Icon className="text-3xl" />
                <span className="text-sm font-medium">{brand.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Supported Services — the one detailed grid (no longer duplicated)  */
/* ------------------------------------------------------------------ */

function SupportedServices() {
  return (
    <section className="bg-gray-50 dark:bg-[#08111d] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="uppercase tracking-[5px] font-semibold text-orange-500">
            Supported Platforms
          </p>

          <h2 className="mt-4 text-5xl font-black text-gray-900 dark:text-white">
            Receive SMS For
            <span className="text-orange-500"> 1000+ Services</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-700 dark:text-zinc-300">
            Instantly receive verification codes from the world&apos;s most
            popular platforms.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {supportedServices.map((service, index) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-orange-500/10 bg-white dark:bg-[#111827] p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-orange-500 hover:shadow-[0_0_35px_rgba(249,115,22,.35)]"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                {service.charAt(0)}
              </div>

              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                {service}
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">SMS Verification</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Features                                                           */
/* ------------------------------------------------------------------ */

function Features() {
  return (
    <section className="bg-gray-50 dark:bg-[#08111d] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-[5px] text-orange-500">
            Why Choose JoshSecLogs
          </p>

          <h2 className="mt-4 text-5xl font-black text-gray-900 dark:text-white">
            Everything You Need
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-700 dark:text-zinc-300">
            Designed for developers, businesses and individuals who need
            reliable virtual numbers with fast SMS delivery.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                style={{ transitionDelay: `${(index % 3) * 40}ms` }}
                className="group rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-10 transition duration-300 hover:-translate-y-3 hover:border-orange-500 hover:shadow-[0_0_45px_rgba(249,115,22,0.30)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white transition group-hover:scale-110">
                  <Icon size={30} />
                </div>

                <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-8 text-gray-700 dark:text-zinc-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HowItWorks — connected sequence, since it genuinely is one         */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section className="bg-white dark:bg-[#050816] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="uppercase tracking-[4px] text-orange-500">
            Quick Process
          </p>

          <h2 className="mt-4 text-5xl font-black text-gray-900 dark:text-white">
            How It Works
          </h2>
        </div>

        <div className="relative mt-20 grid gap-10 lg:grid-cols-3">
          {/* Connecting line — desktop only, sits behind the cards */}
          <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-[52px] hidden border-t-2 border-dashed border-orange-500/25 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative">
                <div className="relative rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-10 text-center transition hover:border-orange-500">
                  <span className="absolute right-8 top-8 text-6xl font-black text-orange-500/20">
                    {step.number}
                  </span>

                  <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 ring-8 ring-gray-200 dark:ring-[#050816]">
                    <Icon size={35} className="text-gray-900 dark:text-white" />
                  </div>

                  <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-gray-700 dark:text-zinc-300">{step.text}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -right-5 top-[52px] z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#050816] text-orange-500 lg:flex">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */

function Testimonials() {
  return (
    <section className="bg-gray-50 dark:bg-[#08111d] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="uppercase tracking-[5px] font-semibold text-orange-500">
            Testimonials
          </span>

          <h2 className="mt-4 text-5xl font-black text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-gray-700 dark:text-zinc-300">
            Thousands of customers trust JoshSecLogs every day.
          </p>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-8 transition hover:-translate-y-2 hover:border-orange-500 hover:shadow-[0_0_40px_rgba(249,115,22,.25)]"
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="fill-orange-500 text-orange-500"
                  />
                ))}
              </div>

              <p className="mt-6 leading-8 text-gray-700 dark:text-zinc-300">
                &quot;{item.review}&quot;
              </p>

              <div className="mt-8 flex items-center gap-4">
                <Image
                  src={item.image}
                  width={60}
                  height={60}
                  alt={item.name}
                  className="rounded-full border-2 border-orange-500 object-cover"
                />

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-orange-400">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                 */
/* ------------------------------------------------------------------ */

function FAQ() {
  return (
    <section className="bg-white dark:bg-[#050816] py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="uppercase tracking-[5px] font-semibold text-orange-500">
            Frequently Asked Questions
          </span>

          <h2 className="mt-4 text-5xl font-black text-gray-900 dark:text-white">
            Have Questions?
          </h2>

          <p className="mt-6 text-gray-700 dark:text-zinc-300">
            Everything you need to know before using JoshSecLogs.
          </p>
        </motion.div>

        <div className="mt-16 rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-8">
          <Accordion type="single" collapsible className="space-y-5">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-orange-500/10 px-5"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-500">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="text-gray-700 dark:text-zinc-300 leading-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA                                                                 */
/* ------------------------------------------------------------------ */

function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-gray-50 dark:from-[#0B1220] via-white dark:via-[#111827] to-gray-50 dark:to-[#0B1220] py-32">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[40px] border border-orange-500/20 bg-white/80 dark:bg-[#111827]/80 p-16 text-center backdrop-blur-xl"
        >
          <span className="uppercase tracking-[5px] text-orange-500 font-semibold">
            Ready To Start?
          </span>

          <h2 className="mt-6 text-5xl font-black text-gray-900 dark:text-white">
            Buy Virtual Numbers
            <br />
            <span className="text-orange-500">In Less Than 30 Seconds</span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg text-gray-700 dark:text-zinc-300">
            Join thousands of developers, marketers and businesses using
            JoshSecLogs for secure SMS verification worldwide.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-orange-500 px-10 py-7 text-lg hover:bg-orange-600"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-orange-500 px-10 py-7 text-lg text-gray-900 dark:text-white hover:bg-orange-500"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-orange-500/20 bg-white dark:bg-[#050816]">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <h2 className="text-4xl font-black">
              <span className="text-gray-900 dark:text-white">Josh</span>
              <span className="text-orange-500">Sec</span>
              <span className="text-gray-900 dark:text-white">Logs</span>
            </h2>

            <p className="mt-6 max-w-md leading-8 text-gray-700 dark:text-zinc-300">
              Purchase premium virtual phone numbers for SMS verification,
              account creation, API integration and business automation.
            </p>

            <div className="mt-8 flex gap-4">
              {[FaFacebookF, FaXTwitter, FaInstagram, FaGithub, FaTelegram].map(
                (Icon, index) => (
                  <button
                    key={index}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/20 bg-white dark:bg-[#0d1525] text-gray-500 dark:text-zinc-400 transition duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-500 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Icon size={18} />
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Company</h3>

            <div className="space-y-4">
              <Link href="/" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                Home
              </Link>
              <Link href="/pricing" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                Pricing
              </Link>
              <Link href="/how-it-works" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                How It Works
              </Link>
              <Link href="/contact" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Resources</h3>

            <div className="space-y-4">
              <Link href="/faq" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                FAQ
              </Link>
              <Link href="/api-docs" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                API Documentation
              </Link>
              <Link href="/privacy" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-gray-700 dark:text-zinc-300 hover:text-orange-500">
                Terms of Service
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Contact</h3>

            <div className="space-y-5">
              <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                <Mail className="h-5 w-5 text-orange-500" />
                support@joshseclogs.com
              </div>

              <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-300">
                <Phone className="h-5 w-5 text-orange-500" />
                +234 XXX XXX XXXX
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-4">
                <ShieldCheck className="mt-1 h-5 w-5 text-orange-500" />
                <p className="text-sm leading-6 text-gray-700 dark:text-zinc-300">
                  24/7 customer support with secure encrypted transactions and
                  instant SMS delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 rounded-3xl border border-orange-500/20 bg-white dark:bg-[#0d1525] p-10">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Stay Updated</h3>
              <p className="mt-3 text-gray-700 dark:text-zinc-300">
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

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-orange-500/10 pt-8 text-sm text-gray-400 dark:text-zinc-500 md:flex-row">
          <p>© 2026 JoshSecLogs. All Rights Reserved.</p>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-orange-500">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-500">Terms</Link>
            <Link href="/cookies" className="hover:text-orange-500">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                           */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      <Navbar />

      <section className="pt-20">
        <Hero />
      </section>

      <Stats />
      <TrustStrip />
      <SupportedServices />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}