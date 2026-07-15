"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import WalletBalance from "@/components/wallet/WalletBalance";
import DepositModal from "@/components/wallet/DepositModal";
import TransactionHistory from "@/components/wallet/TransactionHistory";

import { useWallet } from "@/hooks/useWallet";

export default function WalletPage() {
  const {
    wallet,
    transactions,
    loading,
    funding,
    loadWallet,
    loadTransactions,
    initializeDeposit,
  } = useWallet();

  const [depositOpen, setDepositOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Guards against overlapping load() calls from multiple triggers
  // (mount, visibility change, focus, Paystack return) firing close together.
  const loadInFlight = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
  =====================================
      LOAD WALLET DATA
  =====================================
  */
  const load = useCallback(async () => {
    if (loadInFlight.current) return;
    loadInFlight.current = true;

    try {
      await Promise.all([loadWallet(), loadTransactions()]);
    } catch (error) {
      console.error("Failed to load wallet:", error);
      toast.error("Couldn't refresh your wallet. Pull to retry.");
    } finally {
      loadInFlight.current = false;
    }
  }, [loadWallet, loadTransactions]);

  /*
  =====================================
      INITIAL LOAD + PAYSTACK RETURN
      (combined so a returning user only
      triggers one load, not two)
  =====================================
  */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference) {
      // Clean the URL immediately so a refresh doesn't re-trigger this
      window.history.replaceState({}, "", window.location.pathname);

      // Give the payment webhook a moment to land before reading wallet state.
      // Not a guarantee — if webhooks are slow, consider polling a
      // payment-status endpoint instead of a fixed delay.
      toast.info("Confirming your payment…");
      pendingTimeout.current = setTimeout(() => {
        load();
      }, 1500);
    } else {
      load();
    }

    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  =====================================
      AUTO-REFRESH ON RETURN TO TAB
  =====================================
  */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
      pendingTimeout.current = setTimeout(() => {
        load();
      }, 1000);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, [load]);

  /*
  =====================================
      MANUAL REFRESH
  =====================================
  */
  async function refreshWallet() {
    if (refreshing || loading) return;
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  /*
  =====================================
      INITIALIZE DEPOSIT
  =====================================
  */
  async function handleDeposit(amount: number) {
    if (funding) return;

    try {
      const payment = await initializeDeposit(amount);

      if (!payment?.authorizationUrl) {
        throw new Error("Authorization URL not returned.");
      }

      setDepositOpen(false);
      window.location.assign(payment.authorizationUrl);
    } catch (error) {
      console.error("Unable to initialize payment:", error);
      toast.error("Couldn't start the deposit. Please try again.");
    }
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

        <TransactionHistory transactions={transactions} loading={loading} />
      </div>

      <DepositModal
        open={depositOpen}
        loading={funding}
        onClose={() => setDepositOpen(false)}
        onConfirm={handleDeposit}
      />
    </>
  );
}