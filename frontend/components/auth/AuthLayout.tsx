"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Globe,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816]">

      {/* Background Glow */}

      <div className="absolute inset-0">

        <div className="absolute left-[-150px] top-[-150px] h-[450px] w-[450px] rounded-full bg-orange-500/20 blur-[150px]" />

        <div className="absolute right-[-180px] bottom-[-180px] h-[500px] w-[500px] rounded-full bg-orange-600/20 blur-[180px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,120,0,.08),transparent_70%)]" />

      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-16">

        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl lg:grid-cols-2">

          {/* LEFT PANEL */}

          <div className="hidden flex-col justify-between bg-gradient-to-br from-[#0a1224] via-[#07101d] to-[#050816] p-12 lg:flex">

            <div>

              <Link
                href="/"
                className="text-4xl font-black"
              >
                <span className="text-white">Josh</span>
                <span className="text-orange-500">Sec</span>
                <span className="text-white">Logs</span>
              </Link>

              <h1 className="mt-16 text-5xl font-black leading-tight text-white">
                Digital Marketplace
              </h1>

              <p className="mt-6 text-lg leading-8 text-zinc-400">
                Buy Virtual Numbers, Social Media Accounts,
                SMS Verification Services and Digital Logs
                instantly from one secure dashboard.
              </p>

            </div>

            <div className="space-y-8">

              <div className="flex gap-4">

                <ShieldCheck className="text-orange-500" />

                <div>

                  <h3 className="font-semibold text-white">
                    Secure Payments
                  </h3>

                  <p className="text-zinc-400">
                    Fast & encrypted checkout.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <Globe className="text-orange-500" />

                <div>

                  <h3 className="font-semibold text-white">
                    Global Services
                  </h3>

                  <p className="text-zinc-400">
                    Virtual numbers from 180+ countries.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <LockKeyhole className="text-orange-500" />

                <div>

                  <h3 className="font-semibold text-white">
                    Trusted Platform
                  </h3>

                  <p className="text-zinc-400">
                    Thousands of successful orders.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT PANEL */}

          <div className="flex items-center justify-center p-8 lg:p-14">

            <div className="w-full max-w-md">

              <div className="mb-8 flex items-center gap-2 text-orange-500">

                <Sparkles size={18} />

                <span className="font-medium">
                  Welcome to JoshSecLogs
                </span>

              </div>

              <h2 className="text-4xl font-black text-white">
                {title}
              </h2>

              <p className="mt-4 text-zinc-400">
                {subtitle}
              </p>

              <div className="mt-10">
                {children}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}