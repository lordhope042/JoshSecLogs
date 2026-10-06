"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Wallet as WalletIcon,
} from "lucide-react";

import type { Wallet } from "@/hooks/useWallet";

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// "NGN" / empty -> ₦, a single symbol is used as-is, anything else gets a space.
function resolveSymbol(currency?: string | null) {
  if (!currency || currency.toUpperCase() === "NGN") return "₦";
  return currency.length <= 1 ? currency : `${currency} `;
}

interface WalletBalanceProps {
  wallet: Wallet | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDeposit: () => void;
}

export default function WalletBalance({
  wallet,
  loading,
  refreshing,
  onRefresh,
  onDeposit,
}: WalletBalanceProps) {
  const [hidden, setHidden] = useState(false);

  const balance = wallet?.balance ?? 0;
  const symbol = resolveSymbol(wallet?.currency);

  return (
    <section
      aria-label="Wallet balance"
      className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0e2038] via-[#0a1725] to-[#071321] p-6 text-white shadow-[0_18px_45px_rgba(7,19,33,0.28)] sm:p-7"
    >
      {/* Decorative rings, same motif as the landing hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-orange-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-orange-500/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
              <WalletIcon size={20} />
            </div>

            <p className="text-sm font-medium text-slate-300">
              Available balance
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHidden((value) => !value)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              aria-pressed={hidden}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
            >
              {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing || loading}
              aria-label="Refresh balance"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 min-h-[56px]" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="h-12 w-56 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="flex items-baseline gap-1 text-[40px] font-black leading-none tracking-tight tabular-nums sm:text-5xl">
              <span className="text-2xl font-bold text-orange-400 sm:text-3xl">
                {symbol.trim()}
              </span>
              <span>{hidden ? "••••••" : formatAmount(balance)}</span>
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onDeposit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-bold text-white shadow-[0_10px_25px_rgba(249,115,22,0.3)] transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
          >
            <Plus size={17} />
            Deposit funds
          </button>

          <p className="text-xs leading-5 text-slate-400">
            Transfers to your deposit account reach your wallet automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
