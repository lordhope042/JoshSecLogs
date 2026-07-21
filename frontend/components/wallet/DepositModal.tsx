"use client";

import { useEffect, useState } from "react";
import {
  X,
  Wallet,
  CircleDollarSign,
  CreditCard,
} from "lucide-react";

interface DepositModalProps {
  open: boolean;
  loading?: boolean;

  onClose: () => void;

  onConfirm: (
    amount: number,
  ) => Promise<void> | void;
}

const QUICK_AMOUNTS = [
  1000,
  2000,
  5000,
  10000,
  20000,
  50000,
];

export default function DepositModal({
  open,
  loading = false,
  onClose,
  onConfirm,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("");
    }
  }, [open]);

  if (!open) return null;

  const numericAmount = Number(amount);

  async function handleContinue() {
    if (numericAmount < 100) return;

    await onConfirm(numericAmount);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

      <div className="w-full max-w-lg rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-orange-500/20 p-3">
              <Wallet className="h-6 w-6 text-orange-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fund Wallet
              </h2>

              <p className="text-sm text-gray-400 dark:text-zinc-500">
                Deposit securely with Paystack
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-6">

          {/* Quick Amounts */}

          <div>

            <p className="mb-3 text-sm font-medium text-gray-500 dark:text-zinc-400">
              Quick Amount
            </p>

            <div className="grid grid-cols-3 gap-3">

              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setAmount(value.toString())
                  }
                  className={`rounded-xl border py-3 font-semibold transition ${
                    numericAmount === value
                      ? "border-orange-500 bg-orange-500 text-black"
                      : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white hover:border-orange-500"
                  }`}
                >
                  ₦{value.toLocaleString()}
                </button>
              ))}

            </div>

          </div>

          {/* Amount */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-zinc-400">
              Deposit Amount
            </label>

            <div className="relative">

              <CircleDollarSign className="absolute left-4 top-4 h-5 w-5 text-gray-400 dark:text-zinc-500" />

              <input
                type="number"
                min={100}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Enter amount"
                className="w-full rounded-2xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-4 pl-12 pr-4 text-lg text-gray-900 dark:text-white outline-none transition focus:border-orange-500"
              />

            </div>

            <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
              Minimum deposit: ₦100
            </p>

          </div>

          {/* Summary */}

          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">

            <div className="flex justify-between">

              <span className="text-gray-500 dark:text-zinc-400">
                Amount
              </span>

              <span className="font-bold text-gray-900 dark:text-white">
                ₦
                {numericAmount
                  ? numericAmount.toLocaleString()
                  : "0"}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-500 dark:text-zinc-400">
                Payment Gateway
              </span>

              <div className="flex items-center gap-2 font-semibold text-green-400">

                <CreditCard className="h-4 w-4" />
                Paystack

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex gap-4 border-t border-gray-200 dark:border-zinc-800 p-6">

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-2xl border border-gray-300 dark:border-zinc-700 py-3 text-gray-900 dark:text-white transition hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            onClick={handleContinue}
            disabled={
              loading ||
              numericAmount < 100
            }
            className="flex-1 rounded-2xl bg-orange-500 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Redirecting..."
              : "Continue"}
          </button>

        </div>

      </div>

    </div>
  );
}