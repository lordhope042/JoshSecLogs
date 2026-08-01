"use client";

/**
 * useWallet — central wallet state for the dashboard.
 *
 * Exposes everything the dashboard pages need:
 *   - balance / wallet / transactions / loading / funding  (state)
 *   - loadWallet / loadBalance / loadTransactions           (fetchers)
 *   - initializeDeposit(amount)                              (start Paystack flow)
 *   - verifyDeposit(reference)                               (confirm + credit wallet)
 *
 * The deposit bug this hook fixes: previously the wallet page returned from
 * Paystack and only *reloaded* the wallet after a delay, hoping the backend
 * webhook had already credited the balance. `verifyDeposit` instead actively
 * tells the backend "verify this reference with Paystack and credit me", then
 * reloads — so the balance updates even when the webhook is slow or missing.
 */
import { useCallback, useState } from "react";
import { toast } from "sonner";

import api from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Wallet {
  id?: string;
  userId?: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  reference: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface DepositResult {
  success: boolean;
  reference: string;
  authorizationUrl?: string;
  authorization_url?: string;
  accessCode?: string;
  data?: {
    authorizationUrl?: string;
    authorization_url?: string;
    reference?: string;
  };
}

// Backend wraps payloads in `{ data: ... }` most of the time, but a few
// endpoints return bare objects. These helpers normalise both shapes.
function unwrap<T>(res: any): T {
  return (res && typeof res === "object" && "data" in res ? res.data : res) as T;
}

function toNumber(v: any): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);

  const balance = wallet?.balance ?? 0;

  /**
   * GET /wallet → { data: { balance, currency, ... } } (or bare object).
   */
  const loadWallet = useCallback(async () => {
    try {
      const res: any = await api.get("/wallet");
      const w = unwrap<Wallet | null>(res);
      if (w && typeof w === "object") {
        setWallet({
          ...w,
          balance: toNumber((w as any).balance),
          currency: (w as any).currency || "₦",
        });
      }
    } catch (err) {
      console.error("useWallet.loadWallet failed:", err);
    }
  }, []);

  // Alias used by some pages (buy-number, marketplace).
  const loadBalance = loadWallet;

  /**
   * GET /wallet/transactions → { data: [...] } | [...] | { transactions: [...] }
   */
  const loadTransactions = useCallback(async () => {
    try {
      const res: any = await api.get("/wallet/transactions");
      const raw = unwrap<any>(res);
      const list: WalletTransaction[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.transactions)
            ? raw.transactions
            : [];
      setTransactions(
        list.map((t) => ({
          ...t,
          amount: toNumber(t.amount),
        })),
      );
    } catch (err) {
      console.error("useWallet.loadTransactions failed:", err);
    }
  }, []);

  /**
   * Convenience: reload both at once.
   */
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadWallet(), loadTransactions()]);
    } finally {
      setLoading(false);
    }
  }, [loadWallet, loadTransactions]);

  /**
   * POST /payments/initialize { amount } → start a Paystack deposit.
   * Returns the normalized deposit result (with `authorizationUrl`).
   */
  const initializeDeposit = useCallback(
    async (amount: number): Promise<DepositResult> => {
      setFunding(true);
      try {
        const res: any = await api.post("/payments/initialize", { amount });
        const data = unwrap<DepositResult>(res);
        return data;
      } finally {
        setFunding(false);
      }
    },
    [],
  );

  /**
   * POST /payments/verify { reference } → ask the backend to verify the
   * Paystack payment and credit the wallet, then reload wallet + transactions
   * so the new balance is visible immediately.
   *
   * This is the function that was effectively missing from the deposit return
   * flow. Without it the balance only updates if the Paystack webhook lands
   * first — which is why deposits appeared to succeed (admin shows "Success")
   * but the user-side balance never moved.
   *
   * Returns the backend response so callers can inspect it (e.g. whether the
   * backend reported success:false, which means the credit did NOT happen and
   * should be surfaced to the user rather than silently swallowed).
   */
  const verifyDeposit = useCallback(
    async (reference: string): Promise<any> => {
      if (!reference) throw new Error("Missing payment reference");
      let verifyRes: any = null;
      try {
        verifyRes = await api.post("/payments/verify", { reference });
      } catch (err: any) {
        // Some backends return 200 with success:false, others throw on a
        // not-yet-verified payment. We still reload so the UI shows current
        // state, then rethrow so the caller can surface the failure.
        await Promise.all([loadWallet(), loadTransactions()]);
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Verification failed";
        const e: any = new Error(
          status === 400
            ? `Deposit verification failed: ${msg}. The payment may not have completed on Paystack.`
            : status === 401
              ? "Your session expired. Please log in again."
              : status && status >= 500
                ? "The server couldn't verify your deposit right now. If you were charged, your balance will update shortly."
                : `Could not verify deposit: ${msg}`,
        );
        e.status = status;
        e.raw = err?.response?.data;
        throw e;
      } finally {
        // Always reload so the UI reflects whatever the backend now reports.
        await Promise.all([loadWallet(), loadTransactions()]);
      }
      return verifyRes;
    },
    [loadWallet, loadTransactions],
  );

  return {
    // state
    wallet,
    balance,
    transactions,
    loading,
    funding,
    // actions
    loadWallet,
    loadBalance,
    loadTransactions,
    reload,
    initializeDeposit,
    verifyDeposit,
  };
}

export default useWallet;
