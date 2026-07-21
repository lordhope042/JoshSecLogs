"use client";

import {
  Wallet,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";

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

export default function HowItWorks() {
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

        <div className="mt-20 grid gap-10 lg:grid-cols-3">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-10 text-center hover:border-orange-500 transition"
              >
                <span className="absolute right-8 top-8 text-6xl font-black text-orange-500/20">
                  {step.number}
                </span>

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500">
                  <Icon size={35} className="text-gray-900 dark:text-white" />
                </div>

                <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="mt-4 text-gray-500 dark:text-zinc-400">
                  {step.text}
                </p>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}