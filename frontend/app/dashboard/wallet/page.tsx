"use client";

import { useCallback, useEffect, useState } from "react";

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

  /*
  =====================================
      INITIAL LOAD

      FIX: virtual accounts now load right alongside the wallet, on
      page mount — previously they were only fetched when the deposit
      modal opened, so the account number(s) never showed up on the
      page itself unless the user clicked "Deposit" first. Now
      VirtualAccountsCard is rendered directly on the page and always
      has data as soon as the page loads.
  =====================================
  */
  useEffect(() => {
    load();
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  =====================================
      AUTO-REFRESH ON RETURN TO TAB

      Picks up a balance that changed while the user was away (a
      deposit credited in the background via webhook).
  =====================================
  */
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
    await Promise.all([load(), loadAccounts()]);
    setRefreshing(false);
  }

  async function handleCreateAccount(bank: PocketFiBank, phone: string) {
    await createAccount(bank, phone);
    setDepositOpen(false);
  }

  return (
    <>
      <div className="space-y-8">
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

        <TransactionHistory transactions={transactions} loading={loading} />
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
