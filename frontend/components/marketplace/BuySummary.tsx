"use client";

import {
  Wallet,
  Globe,
  Package,
  Zap,
  CreditCard,
  CircleDollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import type { ReactNode } from "react";

/* ==========================================================
   TYPES
========================================================== */

interface BuySummaryProps {
  wallet?: number;
  country?: string;
  service?: string;
  activationType?: string;
  price?: number;
}

interface SummaryItemProps {
  icon: ReactNode;
  title: string;
  value: string;
}

interface InfoCardProps {
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

const displayValue = (
  value?: string,
) => value?.trim() || "Not Selected";

/* ==========================================================
   COMPONENT
========================================================== */

export default function BuySummary({
  wallet = 0,
  country,
  service,
  activationType,
  price = 0,
}: BuySummaryProps) {
  const enoughBalance = wallet >= price;

  const remainingBalance = Math.max(
    wallet - price,
    0,
  );

  const amountNeeded = Math.max(
    price - wallet,
    0,
  );

  return (
    <aside className="sticky top-24 overflow-hidden rounded-3xl border border-zinc-800 bg-[#0f172a] shadow-[0_20px_80px_rgba(0,0,0,.45)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-zinc-800 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent px-7 py-6">

        <h2 className="text-2xl font-bold text-white">
          Purchase Summary
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Review your order before confirming payment.
        </p>

      </div>

      <div className="space-y-6 p-7">

        {/* =====================================================
            WALLET CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">

          <div className="flex items-center justify-between p-6">

            <div>

              <p className="text-sm text-zinc-400">
                Wallet Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-400">
                {money(wallet)}
              </h2>

              <p className="mt-2 text-xs text-zinc-500">
                Available for purchases
              </p>

            </div>

            <div className="rounded-2xl bg-green-500/20 p-4">

              <Wallet
                size={30}
                className="text-green-400"
              />

            </div>

          </div>

        </div>

        {/* =====================================================
            ORDER DETAILS
        ===================================================== */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Order Details
          </h3>

          <div className="space-y-5">

            <SummaryItem
              icon={
                <Globe size={18} />
              }
              title="Country"
              value={displayValue(country)}
            />

            <SummaryItem
              icon={
                <Package size={18} />
              }
              title="Service"
              value={displayValue(service)}
            />

            <SummaryItem
              icon={
                <Zap size={18} />
              }
              title="Activation"
              value={displayValue(
                activationType,
              )}
            />

          </div>

        </div>

        {/* =====================================================
            PRICE OVERVIEW
        ===================================================== */}

        <div className="grid grid-cols-2 gap-4">

          <InfoCard
            title="Price"
            value={money(price)}
            color="orange"
            icon={
              <CircleDollarSign
                size={22}
              />
            }
          />

          <InfoCard
            title="Remaining"
            value={money(
              remainingBalance,
            )}
            color={
              enoughBalance
                ? "green"
                : "red"
            }
            icon={
              <CreditCard
                size={22}
              />
            }
          />

        </div>

        {/* =====================================================
            PURCHASE STATUS
        ===================================================== */}

        {price === 0 ? (

          <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">

              <Package
                size={30}
                className="text-zinc-500"
              />

            </div>

            <h3 className="text-lg font-semibold text-white">
              Nothing Selected
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Choose a country, service and activation type
              to see pricing and continue.
            </p>

          </div>

        ) : enoughBalance ? (

          <div className="rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent p-6">

            <div className="flex gap-4">

              <div className="rounded-xl bg-green-500/20 p-3">

                <CheckCircle2
                  size={24}
                  className="text-green-400"
                />

              </div>

              <div>

                <h3 className="font-semibold text-green-400">
                  Ready to Purchase
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Your wallet balance is sufficient for this
                  purchase. Once confirmed, the amount will be
                  deducted instantly and your virtual number
                  will be delivered immediately.
                </p>

              </div>

            </div>

          </div>

        ) : (
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent p-6">

            <div className="flex gap-4">

              <div className="rounded-xl bg-red-500/20 p-3">

                <AlertTriangle
                  size={24}
                  className="text-red-400"
                />

              </div>

              <div>

                <h3 className="font-semibold text-red-400">
                  Insufficient Balance
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  You need an additional{" "}
                  <span className="font-semibold text-white">
                    {money(amountNeeded)}
                  </span>{" "}
                  before you can complete this purchase.
                </p>

                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-zinc-400">
                      Wallet Balance
                    </span>

                    <span className="font-semibold text-white">
                      {money(wallet)}
                    </span>

                  </div>

                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-sm text-zinc-400">
                      Required
                    </span>

                    <span className="font-semibold text-orange-400">
                      {money(price)}
                    </span>

                  </div>

                  <div className="mt-3 border-t border-red-500/20 pt-3">

                    <div className="flex items-center justify-between">

                      <span className="text-sm font-medium text-red-300">
                        Additional Needed
                      </span>

                      <span className="text-lg font-bold text-red-400">
                        {money(amountNeeded)}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </aside>
  );
}

/* ==========================================================
   SUMMARY ITEM
========================================================== */

function SummaryItem({
  icon,
  title,
  value,
}: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-zinc-800 p-2 text-zinc-400">
          {icon}
        </div>

        <span className="text-sm text-zinc-400">
          {title}
        </span>

      </div>

      <span className="max-w-[180px] truncate text-right font-semibold text-white">
        {value}
      </span>

    </div>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  title,
  value,
  icon,
  color,
}: InfoCardProps) {
  const styles = {
    green: {
      border:
        "border-green-500/20",
      bg:
        "bg-green-500/10",
      text:
        "text-green-400",
      icon:
        "bg-green-500/20",
    },

    orange: {
      border:
        "border-orange-500/20",
      bg:
        "bg-orange-500/10",
      text:
        "text-orange-400",
      icon:
        "bg-orange-500/20",
    },

    red: {
      border:
        "border-red-500/20",
      bg:
        "bg-red-500/10",
      text:
        "text-red-400",
      icon:
        "bg-red-500/20",
    },
  };

  const style = styles[color];

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 transition-all duration-300 hover:scale-[1.02]`}
    >

      <div className="mb-5 flex items-center justify-between">

        <span className="text-sm font-medium text-zinc-300">
          {title}
        </span>

        <div
          className={`rounded-xl ${style.icon} p-2 ${style.text}`}
        >
          {icon}
        </div>

      </div>

      <h3
        className={`text-2xl font-bold ${style.text}`}
      >
        {value}
      </h3>

    </div>
  );
}