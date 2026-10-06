"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Receipt,
  RotateCcw,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import type { WalletTransaction } from "@/hooks/useWallet";

const PAGE_SIZE = 8;

function formatAmount(amount: number, currency?: string | null) {
  const symbol =
    !currency || currency.toUpperCase() === "NGN" ? "₦" : currency;

  return `${symbol}${Number(amount || 0).toLocaleString("en-NG", {
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

type Direction = "in" | "out" | "neutral";

const STATUS_CONFIG: Record<
  string,
  { label: string; cls: string; icon: ReactNode }
> = {
  success: {
    label: "Success",
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle size={12} />,
  },
  pending: {
    label: "Pending",
    cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    icon: <Clock size={12} />,
  },
  failed: {
    label: "Failed",
    cls: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: <XCircle size={12} />,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
    icon: <XCircle size={12} />,
  },
};

const TYPE_CONFIG: Record<
  string,
  { direction: Direction; label: string; icon: ReactNode; chip: string }
> = {
  credit: {
    direction: "in",
    label: "Wallet funding",
    icon: <ArrowDownLeft size={16} />,
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  deposit: {
    direction: "in",
    label: "Deposit",
    icon: <ArrowDownLeft size={16} />,
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  refund: {
    direction: "in",
    label: "Refund",
    icon: <RotateCcw size={16} />,
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  debit: {
    direction: "out",
    label: "Debit",
    icon: <ArrowUpRight size={16} />,
    chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  purchase: {
    direction: "out",
    label: "Purchase",
    icon: <ShoppingBag size={16} />,
    chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  transfer: {
    direction: "neutral",
    label: "Transfer",
    icon: <RotateCcw size={16} />,
    chip: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
};

const FALLBACK_TYPE = TYPE_CONFIG.debit;

type Filter = "all" | "in" | "out";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in", label: "Money in" },
  { value: "out", label: "Money out" },
];

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  loading: boolean;
}

export default function TransactionHistory({
  transactions,
  loading,
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter(
      (tx) => (TYPE_CONFIG[norm(tx.type)] ?? FALLBACK_TYPE).direction === filter,
    );
  }, [transactions, filter]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  function changeFilter(next: Filter) {
    setFilter(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <section
      aria-label="Transactions"
      className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0a1725] dark:shadow-none"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Recent transactions
          </h2>

          {!loading && transactions.length > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {transactions.length}{" "}
              {transactions.length === 1 ? "transaction" : "transactions"}
            </p>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filter transactions"
          className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/[0.05]"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => changeFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
                filter === f.value
                  ? "bg-white text-orange-600 shadow-sm dark:bg-[#0a1725] dark:text-orange-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-1 p-6" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.05]" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100 dark:bg-white/[0.05]" />
                <div className="h-2.5 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-white/[0.05]" />
              </div>

              <div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
            <Receipt size={22} />
          </span>

          <p className="mt-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No transactions yet
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Deposit funds and your payments, purchases and refunds will
            show up here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No {filter === "in" ? "incoming" : "outgoing"} transactions yet.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 px-6 dark:divide-slate-800">
            {shown.map((tx) => {
              const status =
                STATUS_CONFIG[norm(tx.status)] ?? STATUS_CONFIG.pending;
              const type = TYPE_CONFIG[norm(tx.type)] ?? FALLBACK_TYPE;

              const sign =
                type.direction === "in" ? "+" : type.direction === "out" ? "-" : "";
              const inactive = ["failed", "cancelled"].includes(norm(tx.status));

              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      aria-hidden
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${type.chip}`}
                    >
                      {type.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {tx.description || type.label}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {type.label} · {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        inactive
                          ? "text-zinc-400 line-through dark:text-zinc-500"
                          : type.direction === "in"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {sign}
                      {formatAmount(tx.amount, tx.currency)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-orange-400"
              >
                Show more ({filtered.length - shown.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
