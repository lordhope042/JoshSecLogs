"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import WalletBalance from "@/components/wallet/WalletBalance";
import VirtualAccountsCard from "@/components/wallet/VirtualAccountsCard";
import DepositModal from "@/components/wallet/DepositModal";
import TransactionHistory from "@/components/wallet/TransactionHistory";

import { useWallet } from "@/hooks/useWallet";
import { useDeposit } from "@/hooks/useDeposit";
import type { PocketFiBank } from "@/services/payments";

export default function WalletPage() {
  const {
    wallet,
    transactions,
    loading,
    loadWallet,
    loadTransactions,
  } = useWallet();

  const {
    accounts,
    loading: accountsLoading,
    creating,
    loadAccounts,
    createAccount,
  } = useDeposit();

  const [depositOpen, setDepositOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await Promise.all([loadWallet(), loadTransactions()]);
  }, [loadWallet, loadTransactions]);

  // Initial load: wallet, transactions and virtual accounts together
  useEffect(() => {
    load();
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when the user returns to the tab (picks up webhook credits)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [load]);

  async function refreshWallet() {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      await Promise.all([load(), loadAccounts()]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateAccount(bank: PocketFiBank, phone: string) {
    await createAccount(bank, phone);
    setDepositOpen(false);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Wallet
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Fund your wallet, manage your deposit accounts and track
              every transaction.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshWallet}
            disabled={refreshing || loading}
            aria-label="Refresh wallet"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:border-orange-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />

            <span className="hidden sm:inline">
              {refreshing ? "Refreshing" : "Refresh"}
            </span>
          </button>
        </div>

        {/* Content grid */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {/* Left column: balance and bank accounts */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <WalletBalance
              wallet={wallet}
              loading={loading}
              refreshing={refreshing}
              onRefresh={refreshWallet}
              onDeposit={() => setDepositOpen(true)}
            />

            <VirtualAccountsCard
              accounts={accounts}
              loading={accountsLoading}
              onAddBank={() => setDepositOpen(true)}
            />
          </div>

          {/* Right column: history */}
          <div className="min-w-0">
            <TransactionHistory
              transactions={transactions}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <DepositModal
        open={depositOpen}
        accounts={accounts}
        loading={accountsLoading}
        creating={creating}
        onClose={() => setDepositOpen(false)}
        onCreateAccount={handleCreateAccount}
      />
    </>
  );
}