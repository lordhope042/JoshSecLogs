"use client";

import { Wallet as WalletIcon, RefreshCw, Plus, Loader2 } from "lucide-react";

import type { Wallet } from "@/hooks/useWallet";

function formatCurrency(amount: number, currency = "₦") {
  return `${currency}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency || "₦";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1322] dark:shadow-none">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400">
            <WalletIcon size={24} />
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Wallet Balance
            </p>

            {loading ? (
              <div className="mt-1 flex items-center gap-2">
                <Loader2 size={20} className="animate-spin text-zinc-400" />
                <span className="text-sm text-zinc-400">Loading…</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {formatCurrency(balance, currency)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={onDeposit}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <Plus size={16} />
            Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
