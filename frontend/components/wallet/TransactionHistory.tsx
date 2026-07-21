"use client";

import { useMemo, useState } from "react";
import { History, Loader2, Wallet, ChevronDown } from "lucide-react";

import TransactionCard from "./TransactionCard";
import { WalletTransaction } from "@/types/wallet";

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  loading?: boolean;
  pageSize?: number;
}

// Matching window for a CREDIT to be treated as a "possible refund" of a
// prior DEBIT/PURCHASE with the same amount. This is a guess, not a fact —
// the backend should ideally tag real refunds with type: "REFUND" instead.
const REFUND_MATCH_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function withInferredRefunds(transactions: WalletTransaction[]): WalletTransaction[] {
  // Work oldest → newest so we only match a credit against debits that
  // already happened, never ones in its future.
  const chronological = [...transactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const usedDebitIds = new Set<string>();
  const inferredMap = new Map<string, string>(); // creditId -> debitId

  for (const credit of chronological) {
    if (credit.type !== "CREDIT") continue;

    const creditTime = new Date(credit.createdAt).getTime();
    const creditAmount = Math.abs(credit.balanceAfter - credit.balanceBefore) || Math.abs(credit.amount);

    const match = chronological.find((debit) => {
      if (debit.id === credit.id) return false;
      if (usedDebitIds.has(debit.id)) return false;
      if (debit.type !== "DEBIT" && debit.type !== "PURCHASE") return false;

      const debitTime = new Date(debit.createdAt).getTime();
      if (debitTime > creditTime) return false; // must precede the credit
      if (creditTime - debitTime > REFUND_MATCH_WINDOW_MS) return false;

      const debitAmount = Math.abs(debit.balanceAfter - debit.balanceBefore) || Math.abs(debit.amount);
      return debitAmount === creditAmount;
    });

    if (match) {
      usedDebitIds.add(match.id);
      inferredMap.set(credit.id, match.id);
    }
  }

  return transactions.map((t) =>
    inferredMap.has(t.id) ? { ...t, inferredRefundOf: inferredMap.get(t.id) } : t,
  );
}

export default function TransactionHistory({
  transactions,
  loading = false,
  pageSize = 10,
}: TransactionHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Annotate before slicing, so pairing can look across the full list,
  // not just whatever page happens to be visible.
  const annotatedTransactions = useMemo(() => withInferredRefunds(transactions), [transactions]);

  const visibleTransactions = useMemo(
    () => annotatedTransactions.slice(0, visibleCount),
    [annotatedTransactions, visibleCount],
  );

  const hasMore = visibleCount < annotatedTransactions.length;

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">
        <div className="mb-6 flex items-center gap-3">
          <History className="h-6 w-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
            <p className="text-sm text-gray-400 dark:text-zinc-500">Loading transactions...</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-orange-500/20 p-6">
            <Wallet className="h-12 w-12 text-orange-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">No Transactions Yet</h2>
          <p className="mt-2 max-w-md text-center text-gray-400 dark:text-zinc-500">
            Fund your wallet or purchase a service to see your transaction history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
            <p className="text-sm text-gray-400 dark:text-zinc-500">
              Showing <span className="font-medium text-gray-900 dark:text-white">{visibleTransactions.length}</span> of{" "}
              <span className="font-medium text-gray-900 dark:text-white">{annotatedTransactions.length}</span> transaction
              {annotatedTransactions.length !== 1 && "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {visibleTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((count) => count + pageSize)}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 py-3 text-sm font-medium text-gray-500 dark:text-zinc-400 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/5 hover:text-orange-400"
        >
          Load More
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}