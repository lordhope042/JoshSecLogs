"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#06080d] pt-32 pb-20">

      {/* Background */}
      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,136,0,.18),transparent_45%)]" />

        <div className="absolute right-[-180px] top-12 h-[720px] w-[720px] rounded-full border border-orange-500/15" />

        <div className="absolute right-[-120px] top-28 h-[560px] w-[560px] rounded-full border border-orange-500/10" />

      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-20 px-6 lg:grid-cols-2">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
        >

          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 text-sm font-medium text-orange-400">

            <ShieldCheck size={16} />

            Trusted Digital Marketplace

          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.05] text-white md:text-7xl">

            Buy Premium

            <span className="mt-2 block text-orange-500">
              Virtual Numbers
            </span>

            <span className="block">
              & Verified Accounts
            </span>

          </h1>

          <p className="mt-8 max-w-xl text-lg leading-9 text-zinc-400">

            Buy verified Virtual Numbers, Instagram, TikTok,
            Facebook, X (Twitter) and YouTube accounts instantly.

            Fast delivery, secure payments and trusted digital
            products for developers, marketers and businesses.

          </p>

          {/* Tags */}

          <div className="mt-10 flex flex-wrap gap-3">

            {[
              "Instant Delivery",
              "Verified Accounts",
              "Cheap Prices",
              "Secure Checkout",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300"
              >
                ✓ {item}
              </span>
            ))}

          </div>

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap gap-4">

            <Link href="/shop">

              <Button className="h-14 rounded-xl bg-orange-500 px-8 text-lg hover:bg-orange-600">

                Shop Now

                <ArrowRight className="ml-2 h-5 w-5" />

              </Button>

            </Link>

            <Link href="/pricing">

              <Button
                variant="outline"
                className="h-14 rounded-xl border-orange-500 bg-transparent px-8 text-lg text-white hover:bg-orange-500"
              >
                View Pricing
              </Button>

            </Link>

          </div>

          {/* Stats */}

          <div className="mt-14 flex flex-wrap gap-10">

            <div className="flex items-center gap-3">

              <Globe className="text-orange-500" />

              <div>

                <h4 className="font-semibold text-white">
                  180+ Countries
                </h4>

                <p className="text-sm text-zinc-500">
                  Worldwide Coverage
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <ShieldCheck className="text-orange-500" />

              <div>

                <h4 className="font-semibold text-white">
                  99.9% Uptime
                </h4>

                <p className="text-sm text-zinc-500">
                  Reliable Service
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Headphones className="text-orange-500" />

              <div>

                <h4 className="font-semibold text-white">
                  24/7 Support
                </h4>

                <p className="text-sm text-zinc-500">
                  Always Available
                </p>

              </div>

            </div>

          </div>

        </motion.div>

{/* RIGHT */}

<motion.div
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: .8 }}
  className="relative flex h-[700px] items-center justify-center"
>

  {/* Glow */}

  <div className="absolute h-[620px] w-[620px] rounded-full bg-orange-500/15 blur-[110px]" />

  {/* Rings */}

  <div className="absolute h-[620px] w-[620px] rounded-full border border-orange-500/15 animate-[spin_35s_linear_infinite]" />

  <div className="absolute h-[500px] w-[500px] rounded-full border border-orange-500/10 animate-[spin_25s_linear_infinite_reverse]" />

  {/* Orbiting group — phone + icons rotate together */}

  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      repeat: Infinity,
      duration: 30,
      ease: "linear",
    }}
    className="relative z-20 flex h-full w-full items-center justify-center"
  >

    {/* Phone (counter-rotated to stay upright, keeps its own float) */}

    <motion.div
      animate={{
        rotate: -360,
        y: [0, -10, 0],
      }}
      transition={{
        rotate: {
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        },
        y: {
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        },
      }}
      className="relative z-20"
    >

      <Image
        src="/hero/phones.png"
        alt="Phone"
        width={600}
        height={1050}
        priority
        className="select-none object-contain drop-shadow-[0_35px_80px_rgba(255,136,0,.45)]"
      />

    </motion.div>

    {/* Floating Icons — each counter-rotated to stay upright while orbiting */}

    {[
      { src: "/icons/telegram.png", size: 68, className: "absolute left-8 top-12" },
      { src: "/icons/google.png", size: 70, className: "absolute left-24 top-48" },
      { src: "/icons/discord.png", size: 62, className: "absolute left-2 top-[360px]" },
      { src: "/icons/steam.png", size: 62, className: "absolute left-24 bottom-24" },
      { src: "/icons/whatsapp.png", size: 82, className: "absolute right-10 top-16" },
      { src: "/icons/tiktok.png", size: 70, className: "absolute right-0 top-64" },
      { src: "/icons/instagram.png", size: 76, className: "absolute right-2 bottom-32" },
      { src: "/icons/facebook.png", size: 74, className: "absolute right-24 bottom-4" },
    ].map((icon) => (
      <motion.div
        key={icon.src}
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
        className={icon.className}
      >
        <Image
          src={icon.src}
          alt=""
          width={icon.size}
          height={icon.size}
        />
      </motion.div>
    ))}

  </motion.div>

</motion.div>

      </div>

    </section>
  );
}