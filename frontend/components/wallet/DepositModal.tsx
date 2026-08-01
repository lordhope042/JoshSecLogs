"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface DepositModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function DepositModal({
  open,
  loading,
  onClose,
  onConfirm,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");

  // Reset the field whenever the modal is (re)opened.
  useEffect(() => {
    if (open) setAmount("");
  }, [open]);

  if (!open) return null;

  const numericAmount = Number(amount);
  const valid = numericAmount > 0 && Number.isFinite(numericAmount);

  function submit() {
    if (!valid || loading) return;
    onConfirm(numericAmount);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0B1322]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Deposit Funds
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 transition hover:text-zinc-600 disabled:opacity-50 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the amount you want to deposit. You&apos;ll be redirected to
          Paystack to complete the payment securely.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount (₦)
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2000"
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(String(amt))}
              disabled={loading}
              className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
            >
              ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!valid || loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Redirecting…" : "Pay with Paystack"}
          </button>
        </div>
      </div>
    </div>
  );
}
