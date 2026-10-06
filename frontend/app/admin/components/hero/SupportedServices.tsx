"use client";

import { motion } from "framer-motion";

const services = [
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

export default function SupportedServices() {
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

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-500 dark:text-zinc-400">
            Instantly receive verification codes from the world's most popular
            platforms.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          {services.map((service, index) => (
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

              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                SMS Verification
              </p>
            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}