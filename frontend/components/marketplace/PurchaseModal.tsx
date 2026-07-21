"use client";

import type { ReactNode } from "react";

import {
  Globe,
  Package,
  Zap,
  CircleDollarSign,
  Wallet,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

interface PurchaseModalProps {
  open: boolean;
  loading: boolean;

  country: string;
  service: string;
  activationType: string;

  price: number;
  wallet: number;

  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

interface RowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

interface CardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: "green" | "orange" | "red";
}

/* ==========================================================
   HELPERS
========================================================== */

const money = (amount = 0): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const displayValue = (value?: string) =>
  value?.trim() || "Not Selected";

/* ==========================================================
   COMPONENT
========================================================== */

export default function PurchaseModal({
  open,
  loading,

  country,
  service,
  activationType,

  price,
  wallet,

  onClose,
  onConfirm,
}: PurchaseModalProps) {
  if (!open) return null;

  const insufficient = wallet < price;

  const remainingBalance = Math.max(
    wallet - price,
    0,
  );

  const amountNeeded = Math.max(
    price - wallet,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-md sm:items-center sm:p-5">

      <div className="max-h-[95vh] w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] shadow-[0_25px_100px_rgba(0,0,0,.65)]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="border-b border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent px-6 py-6">

          <div className="flex items-start justify-between gap-5">

            <div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm Purchase
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                Review your activation details before
                completing this transaction.
              </p>

            </div>

            <div className="rounded-2xl bg-orange-500/15 p-3">

              <ShieldCheck
                size={28}
                className="text-orange-400"
              />

            </div>

          </div>

        </div>

        <div className="max-h-[calc(95vh-100px)] overflow-y-auto">

          <div className="space-y-6 p-6">

            {/* ======================================================
                ORDER DETAILS
            ====================================================== */}

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

              <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                Order Details
              </h3>

              <div className="space-y-4">

                <Row
                  icon={<Globe size={18} />}
                  label="Country"
                  value={displayValue(country)}
                />

                <Row
                  icon={<Package size={18} />}
                  label="Service"
                  value={displayValue(service)}
                />

                <Row
                  icon={<Zap size={18} />}
                  label="Activation"
                  value={displayValue(
                    activationType,
                  )}
                />

              </div>

            </div>

            {/* ======================================================
                PAYMENT OVERVIEW
            ====================================================== */}

            <div className="grid grid-cols-2 gap-4">

              <Card
                title="Price"
                value={money(price)}
                color="orange"
                icon={
                  <CircleDollarSign
                    size={22}
                  />
                }
              />

              <Card
                title="Wallet"
                value={money(wallet)}
                color="green"
                icon={
                  <Wallet
                    size={22}
                  />
                }
              />

            </div>

            {/* ======================================================
                BALANCE AFTER PURCHASE
            ====================================================== */}

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Wallet After Purchase
                  </p>

                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      insufficient
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {money(
                      remainingBalance,
                    )}
                  </h3>

                </div>

                <div
                  className={`rounded-2xl p-4 ${
                    insufficient
                      ? "bg-red-500/15"
                      : "bg-green-500/15"
                  }`}
                >

                  <CreditCard
                    size={28}
                    className={
                      insufficient
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  />

                </div>

              </div>

            </div>

            {/* ======================================================
                PAYMENT BREAKDOWN
            ====================================================== */}

            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">

              <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                Payment Summary
              </h3>

              <div className="space-y-4">

                <div className="flex items-center justify-between">

                  <span className="text-gray-500 dark:text-zinc-400">
                    Wallet Balance
                  </span>

                  <span className="font-semibold text-gray-900 dark:text-white">
                    {money(wallet)}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-gray-500 dark:text-zinc-400">
                    Purchase Price
                  </span>

                  <span className="font-semibold text-orange-400">
                    {money(price)}
                  </span>

                </div>

                <div className="border-t border-gray-200 dark:border-zinc-800 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-gray-900 dark:text-white">
                      Remaining Balance
                    </span>

                    <span
                      className={`text-lg font-bold ${
                        insufficient
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {money(
                        remainingBalance,
                      )}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* ======================================================
                STATUS
            ====================================================== */}

            {insufficient ? (
              <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent p-6">

                <div className="flex gap-4">

                  <div className="rounded-2xl bg-red-500/20 p-3">

                    <AlertTriangle
                      size={24}
                      className="text-red-400"
                    />

                  </div>

                  <div className="flex-1">

                    <h3 className="font-semibold text-red-400">
                      Insufficient Wallet Balance
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-zinc-300">
                      Your wallet balance is not enough to complete
                      this purchase.
                    </p>

                    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                      <div className="flex items-center justify-between">

                        <span className="text-sm text-gray-500 dark:text-zinc-400">
                          Additional Funds Needed
                        </span>

                        <span className="text-lg font-bold text-red-400">
                          {money(amountNeeded)}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            ) : (

              <div className="rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent p-6">

                <div className="flex gap-4">

                  <div className="rounded-2xl bg-green-500/20 p-3">

                    <CheckCircle2
                      size={24}
                      className="text-green-400"
                    />

                  </div>

                  <div className="flex-1">

                    <h3 className="font-semibold text-green-400">
                      Ready to Purchase
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-zinc-300">
                      Everything looks good. Once you confirm,
                      the purchase amount will be deducted from
                      your wallet immediately and your activation
                      details will be delivered instantly.
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* ======================================================
                ACTION BUTTONS
            ====================================================== */}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">

              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-3.5 text-sm font-semibold text-gray-700 dark:text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading || insufficient}
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-black transition-all duration-200 hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
              >

                {loading ? (

                  <span className="flex items-center justify-center gap-2">

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Processing...

                  </span>

                ) : (

                  "Confirm Purchase"

                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   ORDER ROW
========================================================== */

function Row({
  icon,
  label,
  value,
}: RowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 px-4 py-3">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-gray-100 dark:bg-zinc-800 p-2 text-gray-500 dark:text-zinc-400">
          {icon}
        </div>

        <span className="text-sm text-gray-500 dark:text-zinc-400">
          {label}
        </span>

      </div>

      <span className="max-w-[180px] truncate text-right font-semibold text-gray-900 dark:text-white">
        {value}
      </span>

    </div>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function Card({
  title,
  value,
  icon,
  color,
}: CardProps) {
  const styles = {
    green: {
      border: "border-green-500/20",
      bg: "bg-green-500/10",
      text: "text-green-400",
      icon: "bg-green-500/20",
    },

    orange: {
      border: "border-orange-500/20",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      icon: "bg-orange-500/20",
    },

    red: {
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-400",
      icon: "bg-red-500/20",
    },
  };

  const style = styles[color];

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 transition-all duration-300 hover:scale-[1.02]`}
    >

      <div className="mb-5 flex items-center justify-between">

        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          {title}
        </span>

        <div
          className={`rounded-xl ${style.icon} p-2 ${style.text}`}
        >
          {icon}
        </div>

      </div>

      <h3 className={`text-2xl font-bold ${style.text}`}>
        {value}
      </h3>

    </div>
  );
}