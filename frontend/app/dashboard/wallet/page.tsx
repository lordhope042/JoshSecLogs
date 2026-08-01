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
    verifyDeposit,
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

      On return from Paystack the URL carries ?reference=...
      Previously we only waited 1.5s and reloaded the wallet, which relied on
      the backend webhook having already credited the balance. If the webhook
      was slow/missing the balance never updated even though the payment was
      successful — hence the "deposit shows success but balance doesn't
      reflect" bug.

      We now EXPLICITLY call verifyDeposit(reference) so the backend verifies
      the payment with Paystack and credits the wallet, then reload. If the
      balance still hasn't moved we retry a couple of times (webhook/verify
      can lag), then fall back to a normal load.
  =====================================
  */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");
    const successFlag = urlParams.get("success");
    const failedFlag = urlParams.get("failed");

    if (reference) {
      // Clean the URL immediately so a refresh doesn't re-trigger verify.
      window.history.replaceState({}, "", window.location.pathname);

      const prevBalance = wallet?.balance ?? 0;
      let verifyFailed = false;

      const confirmAndReload = async (attempt = 0) => {
        toast.info("Confirming your payment…");
        try {
          await verifyDeposit(reference);
        } catch (err: any) {
          // verifyDeposit reloads wallet+transactions in its finally block,
          // so the UI is refreshed even on error. We capture the failure so
          // we can show a real error message (instead of a silent stale
          // balance) once we've confirmed the balance didn't rise.
          verifyFailed = true;
          if (attempt === 0) console.error("verifyDeposit error:", err);
        }

        // Did the balance actually move? If not, retry a few times — the
        // backend verify + credit (or webhook) can lag behind the redirect.
        // Read the balance straight from the /wallet response — the `wallet`
        // state variable is stale inside this closure (it won't update until
        // the next render), so comparing against it would never detect a rise.
        let after = prevBalance;
        try {
          const res: any = await (await import("@/lib/axios")).default.get("/wallet");
          const w = res && typeof res === "object" && "data" in res ? res.data : res;
          after = typeof w?.balance === "number" ? w.balance : Number(w?.balance ?? prevBalance);
          if (!Number.isFinite(after)) after = prevBalance;
        } catch {
          // fall back to a normal reload below
        }
        await loadWallet();
        await loadTransactions();

        if (after > prevBalance) {
          toast.success("Deposit confirmed — your balance has been updated.");
        } else if (attempt < 3) {
          pendingTimeout.current = setTimeout(
            () => confirmAndReload(attempt + 1),
            2000,
          );
        } else if (verifyFailed) {
          // The backend verify call failed AND the balance never rose — this
          // is a real error (server side credit failed), not just webhook lag.
          toast.error(
            "We couldn't confirm your deposit with the server. If you were charged, please contact support with your payment reference.",
          );
        } else {
          toast.message(
            "Payment received. If your balance hasn't updated, tap refresh in a moment.",
          );
        }
      };

      pendingTimeout.current = setTimeout(() => confirmAndReload(0), 800);
    } else if (successFlag) {
      // Came back via the /wallet/callback route after a verified deposit.
      window.history.replaceState({}, "", window.location.pathname);
      toast.success("Deposit confirmed — your balance has been updated.");
      pendingTimeout.current = setTimeout(() => load(), 500);
    } else if (failedFlag) {
      window.history.replaceState({}, "", window.location.pathname);
      toast.error("Deposit could not be verified. Please try again.");
      pendingTimeout.current = setTimeout(() => load(), 500);
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

      const authUrl =
        payment?.authorizationUrl ??
        payment?.authorization_url ??
        payment?.data?.authorizationUrl ??
        payment?.data?.authorization_url;

      if (!authUrl) {
        throw new Error("Authorization URL not returned.");
      }

      setDepositOpen(false);
      window.location.assign(authUrl);
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
