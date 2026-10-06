"use client";

import {
  FaGoogle,
  FaFacebook,
  FaDiscord,
  FaTelegram,
} from "react-icons/fa";

import {
  SiWhatsapp,
  SiTiktok,
} from "react-icons/si";

const brands = [
  {
    name: "Google",
    icon: FaGoogle,
  },
  {
    name: "Telegram",
    icon: FaTelegram,
  },
  {
    name: "WhatsApp",
    icon: SiWhatsapp,
  },
  {
    name: "Facebook",
    icon: FaFacebook,
  },
  {
    name: "TikTok",
    icon: SiTiktok,
  },
  {
    name: "Discord",
    icon: FaDiscord,
  },
];

export default function TrustedBrands() {
  return (
    <section className="bg-white dark:bg-[#050816] py-20">

      <div className="mx-auto max-w-7xl px-6">

        <h2 className="mb-12 text-center text-4xl font-bold text-gray-900 dark:text-white">
          Trusted With
          <span className="text-orange-500">
            {" "}500+{" "}
          </span>
          Online Services
        </h2>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">

          {brands.map((brand) => {
            const Icon = brand.icon;

            return (
              <div
                key={brand.name}
                className="flex flex-col items-center justify-center rounded-2xl border border-orange-500/10 bg-white dark:bg-[#111827] p-8 transition hover:border-orange-500 hover:bg-[#1b2433]"
              >
                <Icon className="mb-4 text-5xl text-orange-500" />

                <span className="font-semibold text-gray-900 dark:text-white">
                  {brand.name}
                </span>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}