"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Globe2,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";

interface Props {
  children: ReactNode;
  title: string;
  subtitle: string;
}

function InstagramGlyph() {
  return (
    <span aria-hidden="true" className="relative flex h-5 w-5 items-center justify-center rounded-[6px] border-2 border-current">
      <span className="h-2 w-2 rounded-full border border-current" />
      <span className="absolute right-[2px] top-[2px] h-1 w-1 rounded-full bg-current" />
    </span>
  );
}

function FacebookGlyph() {
  return <span aria-hidden="true" className="font-black text-[19px] leading-none">f</span>;
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="JoshSecLogs home">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-[0_8px_24px_rgba(249,115,22,.28)]">
        <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.3} />
      </span>
      <span className="text-[22px] font-extrabold tracking-[-0.03em] text-slate-950 dark:text-white">
        JoshSec<span className="text-orange-500">Logs</span>
      </span>
    </Link>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[270px] w-[340px] max-w-full sm:h-[310px] sm:w-[390px]">
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-5 left-1/2 h-12 w-56 -translate-x-1/2 rounded-[50%] border border-orange-500/50 bg-orange-500/5 shadow-[0_0_55px_rgba(249,115,22,.22)]" />
      <div className="absolute bottom-8 left-1/2 h-28 w-64 -translate-x-1/2 rounded-[50%] border border-orange-400/25" />

      <div className="absolute left-1/2 top-7 h-[205px] w-[112px] -translate-x-1/2 rotate-[10deg] rounded-[26px] border-[5px] border-slate-800 bg-slate-950 p-2 shadow-[0_20px_55px_rgba(0,0,0,.45)] dark:border-slate-700">
        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-b from-slate-800 via-slate-900 to-[#111827]">
          <div className="absolute top-2 h-1.5 w-12 rounded-full bg-slate-700" />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 shadow-[0_0_35px_rgba(249,115,22,.24)]">
            <ShieldCheck className="h-9 w-9 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="absolute left-[12%] top-[32%] flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-400 shadow-lg backdrop-blur-md">
        <MessageCircle className="h-5 w-5" />
      </div>
      <div className="absolute right-[12%] top-[25%] flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/15 text-sky-400 shadow-lg backdrop-blur-md">
        <Send className="h-5 w-5" />
      </div>
      <div className="absolute left-[10%] top-[58%] flex h-10 w-10 items-center justify-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-400 shadow-lg backdrop-blur-md">
        <InstagramGlyph />
      </div>
      <div className="absolute right-[11%] top-[57%] flex h-10 w-10 items-center justify-center rounded-full border border-pink-400/30 bg-pink-500/15 text-pink-400 shadow-lg backdrop-blur-md">
        <FacebookGlyph />
      </div>

      <div className="absolute left-[20%] top-[18%] h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(249,115,22,.9)]" />
      <div className="absolute right-[22%] top-[14%] h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_15px_rgba(249,115,22,.9)]" />
      <div className="absolute bottom-[22%] right-[23%] h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,.9)]" />
    </div>
  );
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  const isRegister = title.toLowerCase().includes("create");

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950 transition-colors duration-300 dark:bg-[#020a13] dark:text-white">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-orange-500/8 blur-[120px] dark:bg-orange-500/10" />
          <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-orange-500/6 blur-[130px] dark:bg-orange-500/8" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_55%,rgba(249,115,22,.05),transparent_42%)] dark:bg-[radial-gradient(circle_at_55%_55%,rgba(249,115,22,.07),transparent_42%)]" />
        </div>

        <div className="absolute right-6 top-5 z-30 sm:right-8 sm:top-6">
          <ThemeToggle />
        </div>

        <section className="relative mx-auto flex min-h-screen w-full max-w-[1540px] items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#06101b]/90 dark:shadow-[0_30px_100px_rgba(0,0,0,.35)] lg:grid-cols-[1.02fr_.98fr]">
            <div className="relative hidden min-h-[720px] flex-col justify-between border-r border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-white p-10 lg:flex xl:p-12 dark:border-slate-800/80 dark:from-[#06111c] dark:via-[#07131f] dark:to-[#030b14]">
              <div>
                <Brand />

                <div className="mt-12 max-w-[560px]">
                  <h1 className="text-[40px] font-extrabold leading-[1.08] tracking-[-0.04em] text-slate-950 xl:text-[46px] dark:text-white">
                    Your Trusted Platform
                    <br />
                    for <span className="text-orange-500">Virtual Numbers,</span>
                    <br />
                    <span className="text-orange-500">Social Media Logs</span> &amp; More
                  </h1>
                  <p className="mt-5 max-w-[500px] text-[15px] leading-6 text-slate-600 dark:text-slate-300">
                    Get virtual phone numbers, social media logs,
                    <br className="xl:block" />
                    API access and more — all in one place.
                    <br />
                    Secure, fast and reliable.
                  </p>
                </div>

                <div className="mt-7 space-y-4">
                  <Feature icon={<Globe2 />} title="Virtual Numbers" text="Get numbers from 180+ countries" />
                  <Feature icon={<MessageCircle />} title="Social Media Logs" text="Track and monitor with ease" />
                  <Feature icon={<Zap />} title="API Access" text="Integrate with your applications" />
                  <Feature icon={<Headphones />} title="24/7 Support" text="We're always here to help" />
                </div>
              </div>

              <div className="mt-4">
                <HeroIllustration />
                <div className="grid grid-cols-3 gap-5 border-t border-slate-200/80 pt-6 dark:border-slate-800/80">
                  <Stat icon={<Globe2 />} value="180+" label="Countries" />
                  <Stat icon={<UsersRound />} value="100k+" label="Happy Users" />
                  <Stat icon={<BadgeCheck />} value="99.9%" label="Uptime" />
                </div>
              </div>
            </div>

            <div className="flex min-h-[720px] items-center justify-center px-5 py-14 sm:px-10 lg:px-12 xl:px-16">
              <div className="w-full max-w-[520px]">
                <div className="mb-7 flex items-start justify-between gap-4 lg:hidden">
                  <Brand />
                </div>

                <div className="rounded-[16px] border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,.07)] sm:p-8 dark:border-slate-800 dark:bg-[#071321] dark:shadow-[0_20px_65px_rgba(0,0,0,.25)]">
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-[24px] font-bold tracking-[-0.025em] text-slate-950 dark:text-white">{title}</h2>
                      <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                        {isRegister ? "Join JoshSecLogs and get started today" : "Sign in to your JoshSecLogs account"}
                      </p>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:flex dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <LockKeyhole className="h-3 w-3" />
                      Secure &amp; Encrypted
                    </div>
                  </div>

                  <div className="mb-6 hidden text-[13px] text-slate-500 dark:text-slate-400 sm:block">{subtitle}</div>
                  {children}
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  Secure • Fast • Reliable
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-[0_8px_22px_rgba(249,115,22,.18)] [&>svg]:h-[19px] [&>svg]:w-[19px]">
        {icon}
      </span>
      <div>
        <div className="text-[14px] font-semibold text-slate-900 dark:text-white">{title}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">{text}</div>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-orange-500 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div>
        <div className="text-[15px] font-extrabold text-slate-900 dark:text-white">{value}</div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}
