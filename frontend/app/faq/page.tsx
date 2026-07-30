"use client";

import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  Wallet,
  CreditCard,
  Smartphone,
  Users,
  Shield,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";

const FAQ_CATEGORIES = [
  {
    icon: Wallet,
    title: "Wallet & Payments",
    questions: [
      {
        q: "How do I fund my wallet?",
        a: "Navigate to your Dashboard → Wallet and click 'Add Funds'. We use Paystack for secure payments in Nigerian Naira (₦). Enter the amount you want to deposit and complete the payment. Your wallet balance updates instantly once payment is confirmed.",
      },
      {
        q: "What payment methods are supported?",
        a: "We currently support payments through Paystack, which accepts Nigerian debit cards, bank transfers, and USSD. All transactions are processed in Nigerian Naira (₦).",
      },
      {
        q: "Is there a minimum deposit amount?",
        a: "No, there is no minimum deposit. You can add any amount to your wallet. However, you need sufficient balance to cover the cost of the number or account you wish to purchase.",
      },
      {
        q: "Can I get a refund for unused wallet balance?",
        a: "Wallet balance refunds are handled on a case-by-case basis. Please contact our support team at support@joshseclogs.com with your request, and we'll review it within 48 hours.",
      },
    ],
  },
  {
    icon: Smartphone,
    title: "Phone Numbers & SMS",
    questions: [
      {
        q: "How quickly will I receive my SMS?",
        a: "SMS messages are typically delivered within seconds of the sender dispatching them. Our system polls the 5sim provider continuously and displays incoming messages in real-time on your Orders page.",
      },
      {
        q: "How long do numbers stay active?",
        a: "Rental durations vary by product. Most numbers remain active for 10-15 minutes by default, which is sufficient for most SMS verifications. You can check the specific rental period when selecting a service.",
      },
      {
        q: "What if my number doesn't receive the SMS?",
        a: "If a number fails to receive an SMS within the rental period, you can cancel the order for a full automatic refund to your wallet. Navigate to Dashboard → Orders, find the order, and click 'Cancel'.",
      },
      {
        q: "Which countries are available?",
        a: "We offer numbers from 50+ countries including Nigeria, USA, UK, Russia, India, Indonesia, Germany, France, and many more. Browse the full list on the Marketplace page.",
      },
    ],
  },
  {
    icon: Users,
    title: "Social Accounts",
    questions: [
      {
        q: "What types of social accounts are available?",
        a: "We offer Facebook pages, Facebook country-targeted accounts, Twitter/X followers, Instagram accounts (various follower counts), TikTok accounts, Telegram accounts, VPN accounts, TextPlus/NextPlus numbers, and tutorials. Browse the Shop page to see the full catalogue.",
      },
      {
        q: "How do I receive my purchased account credentials?",
        a: "After purchasing a social account, the login credentials (email, password, cookies, backup codes where applicable) are immediately available in your Dashboard → Purchases section. Click on any purchased item to view the full details.",
      },
      {
        q: "Are the accounts verified and safe?",
        a: "Yes, all accounts are pre-verified where applicable. Each listing shows whether it includes 2FA, backup codes, original email access, and other security features. Always check the listing details before purchasing.",
      },
    ],
  },
  {
    icon: RefreshCw,
    title: "Refunds & Issues",
    questions: [
      {
        q: "What is your refund policy?",
        a: "If a phone number fails to receive an SMS within its rental period, you automatically receive a full refund to your wallet when you cancel the order. For social account issues, contact support within 24 hours of purchase for a review.",
      },
      {
        q: "How do I contact support?",
        a: "You can reach our support team 24/7 at support@joshseclogs.com. We typically respond within 2-4 hours. For urgent issues, include 'URGENT' in your subject line.",
      },
    ],
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    questions: [
      {
        q: "Is my personal information safe?",
        a: "Absolutely. We use JWT-based authentication with bcrypt password hashing. Your payment information is processed entirely by Paystack and never touches our servers. We do not share your data with third parties.",
      },
      {
        q: "Do you store my SMS messages?",
        a: "SMS messages are stored temporarily in our database so you can view them on your Orders page. You can delete individual messages or let them expire automatically after the rental period ends.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <PublicPageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-500">
            <HelpCircle size={16} />
            Help Center
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-zinc-300">
            Everything you need to know about buying virtual numbers and social
            accounts on JoshSecLogs. Can&apos;t find an answer? Contact our support team.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="space-y-6">
          {FAQ_CATEGORIES.map((category, catIndex) => {
            const Icon = category.icon;
            const isCategoryOpen = openCategory === catIndex;
            return (
              <div
                key={category.title}
                className="rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d1525] overflow-hidden"
              >
                <button
                  onClick={() => setOpenCategory(isCategoryOpen ? null : catIndex)}
                  className="flex w-full items-center gap-4 p-6 text-left transition hover:bg-orange-500/5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                    <Icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <h2 className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                      isCategoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCategoryOpen && (
                  <div className="border-t border-orange-500/10 px-6 pb-4">
                    {category.questions.map((item, qIndex) => {
                      const questionKey = `${catIndex}-${qIndex}`;
                      const isQOpen = openQuestion === questionKey;
                      return (
                        <div key={qIndex} className="border-b border-orange-500/5 last:border-0">
                          <button
                            onClick={() => setOpenQuestion(isQOpen ? null : questionKey)}
                            className="flex w-full items-center justify-between gap-4 py-4 text-left"
                          >
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.q}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 ${
                                isQOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isQOpen && (
                            <p className="pb-4 text-sm leading-6 text-gray-700 dark:text-zinc-300">
                              {item.a}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-10 text-center lg:p-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Still Have Questions?
          </h2>
          <p className="mt-3 text-gray-700 dark:text-zinc-300">
            Our support team is available 24/7 to help you.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Contact Support
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
