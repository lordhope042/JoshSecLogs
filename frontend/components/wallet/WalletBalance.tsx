"use client";

import {
  Wallet as WalletIcon,
  RefreshCcw,
  PlusCircle,
  Loader2,
} from "lucide-react";

import { Wallet } from "@/types/wallet";

interface WalletBalanceProps {
  wallet: Wallet | null;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDeposit: () => void;
}

export default function WalletBalance({
  wallet,
  loading = false,
  refreshing = false,
  onRefresh,
  onDeposit,
}: WalletBalanceProps) {
  // Handle different response structures
  const balance = Number(wallet?.balance ?? 0);
  const updatedAt = wallet?.updatedAt;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-gray-50 dark:from-[#111827] via-gray-50 dark:via-[#18181b] to-white dark:to-[#09090b] p-8 shadow-xl">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-orange-500/20 p-3">
              <WalletIcon className="h-7 w-7 text-orange-400" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                Wallet Balance
              </p>

              <h1 className="mt-1 text-4xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-2xl">Loading...</span>
                  </span>
                ) : wallet ? (
                  `₦${balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                ) : (
                  <span className="text-gray-500 dark:text-zinc-400">No wallet found</span>
                )}
              </h1>

              {updatedAt && (
                <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
                  Last Updated{" "}
                  {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing || loading}
              className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 transition hover:border-orange-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw
                className={`h-5 w-5 text-gray-900 dark:text-white ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={onDeposit}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="h-5 w-5" />
            Deposit Funds
          </button>
        </div>
      </div>
    </div>
  );
}