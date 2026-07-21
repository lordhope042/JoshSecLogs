"use client";

import {
  ShieldCheck,
  Wallet,
  Smartphone,
  Globe,
  Clock3,
  KeyRound,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
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

export default function Features() {
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

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-500 dark:text-zinc-400">
            Designed for developers, businesses and individuals who need
            reliable virtual numbers with fast SMS delivery.
          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-10 transition duration-300 hover:-translate-y-3 hover:border-orange-500 hover:shadow-[0_0_45px_rgba(249,115,22,0.30)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white transition group-hover:scale-110">
                  <Icon size={30} />
                </div>

                <h3 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-8 text-gray-500 dark:text-zinc-400">
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