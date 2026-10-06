"use client";

import { Loader2, ArrowDownLeft, ArrowUpRight, RotateCcw, ShoppingBag, CheckCircle, XCircle, Clock } from "lucide-react";

import type { WalletTransaction } from "@/hooks/useWallet";

function formatCurrency(amount: number, currency = "₦") {
  return `${currency}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

// Backend Prisma enums are UPPERCASE; normalise for the config maps below.
function norm(v?: string | null): string {
  return v ? v.toLowerCase() : "";
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  success: { label: "Success", cls: "bg-green-500/10 text-green-500", icon: <CheckCircle size={13} /> },
  pending: { label: "Pending", cls: "bg-yellow-500/10 text-yellow-500", icon: <Clock size={13} /> },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-500", icon: <XCircle size={13} /> },
  cancelled: { label: "Cancelled", cls: "bg-zinc-500/10 text-zinc-400", icon: <XCircle size={13} /> },
};

const TYPE_CONFIG: Record<string, { cls: string; sign: string; icon: React.ReactNode }> = {
  credit: { cls: "text-emerald-500", sign: "+", icon: <ArrowDownLeft size={15} /> },
  deposit: { cls: "text-emerald-500", sign: "+", icon: <ArrowDownLeft size={15} /> },
  debit: { cls: "text-red-500", sign: "-", icon: <ArrowUpRight size={15} /> },
  purchase: { cls: "text-purple-500", sign: "-", icon: <ShoppingBag size={15} /> },
  refund: { cls: "text-sky-500", sign: "+", icon: <RotateCcw size={15} /> },
  transfer: { cls: "text-zinc-400", sign: "", icon: <RotateCcw size={15} /> },
};

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  loading: boolean;
}

export default function TransactionHistory({
  transactions,
  loading,
}: TransactionHistoryProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1322] dark:shadow-none">
      <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
        Recent Transactions
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No transactions yet. Make a deposit to get started.
        </p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-white/5">
          {transactions.map((tx) => {
            const status = STATUS_CONFIG[norm(tx.status)] ?? STATUS_CONFIG.pending;
            const type = TYPE_CONFIG[norm(tx.type)] ?? TYPE_CONFIG.debit;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/5 ${type.cls}`}>
                    {type.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-zinc-400">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-sm font-semibold ${type.cls}`}>
                    {type.sign}
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.cls}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
