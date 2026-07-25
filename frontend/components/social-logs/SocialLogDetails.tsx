"use client";

import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  MapPin,
  Minus,
  Plus,
  Layers,
} from "lucide-react";

import { SocialLog } from "@/types/social-log";
import PurchaseButton from "./PurchaseButton";
import { CATEGORY_LABELS } from "./SocialLogCard";

interface Props {
  log: SocialLog | null;
  open: boolean;
  loading?: boolean;
  /** Total units currently available in this log's category — drives the
      quantity stepper's max and the "N in stock" badge. Defaults to 1
      (just this unit) if the caller doesn't have the full count handy. */
  availableCount?: number;
  onClose: () => void;
  /** Now takes how many units to buy — the caller resolves that into
      actual unit ids and loops the purchase call, since there's no
      batch-purchase endpoint on the backend. */
  onPurchase: (id: string, quantity: number) => void;
}

function Feature({ value, label }: { value: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {value ? (
        <CheckCircle2 size={20} className="text-green-500" />
      ) : (
        <XCircle size={20} className="text-red-500" />
      )}
    </div>
  );
}

export default function SocialLogDetails({
  log,
  open,
  loading,
  availableCount = 1,
  onClose,
  onPurchase,
}: Props) {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity whenever a different log is opened.
  useEffect(() => {
    setQuantity(1);
  }, [log?.id]);

  if (!open || !log) return null;

  const maxQuantity = Math.max(1, availableCount);
  const categoryLabel = CATEGORY_LABELS[log.category] ?? log.platform;
  const hasCountry = !!log.country;
  const hasFollowers = typeof log.followers === "number" && log.followers > 0;

  const statCount = 1 + (hasCountry ? 1 : 0) + (hasFollowers ? 1 : 0);
  const statGridClass =
    statCount === 3 ? "grid-cols-3" : statCount === 2 ? "grid-cols-2" : "grid-cols-1";

  const unitPrice = Number(log.price) || 0;
  const totalPrice = unitPrice * quantity;

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }
  function increment() {
    setQuantity((q) => Math.min(maxQuantity, q + 1));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Banner */}
        <div className="relative h-52 w-full overflow-hidden rounded-t-3xl bg-gradient-to-r from-orange-500 to-amber-500">
          {log.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL, can't allowlist every host
            <img
              src={log.image}
              alt={log.username}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShieldCheck size={70} className="text-gray-900/80 dark:text-white/80" />
            </div>
          )}

          {/* Stock badge */}
          <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Layers size={12} />
            {maxQuantity} in stock
          </div>

          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-black/40 p-2 text-gray-900 dark:text-white backdrop-blur transition hover:bg-black/60"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8 p-8">
          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-orange-500">{categoryLabel}</p>
              <h2 className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">{log.username}</h2>
              <p className="mt-2 text-gray-400 dark:text-zinc-500">Premium aged account</p>
            </div>

            {log.verified && (
              <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-400">
                <BadgeCheck size={18} />
                Verified
              </span>
            )}
          </div>

          {/* Stats — only shown when meaningful for this category */}
          <div className={`grid gap-4 ${statGridClass}`}>
            {hasCountry && (
              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <MapPin className="mb-3 text-orange-500" />
                <p className="text-xs text-gray-400 dark:text-zinc-500">Country</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{log.country}</p>
              </div>
            )}

            <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
              <Calendar className="mb-3 text-orange-500" />
              <p className="text-xs text-gray-400 dark:text-zinc-500">Age</p>
              <p className="font-semibold text-zinc-900 dark:text-white">{log.age} mo</p>
            </div>

            {hasFollowers && (
              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <Users className="mb-3 text-orange-500" />
                <p className="text-xs text-gray-400 dark:text-zinc-500">Followers</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{log.followers!.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Account Features</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Feature label="Email Attached" value={log.emailAttached} />
              <Feature label="Phone Attached" value={log.phoneAttached} />
              <Feature label="2FA Enabled" value={log.twoFactor} />
              <Feature label="Original Email" value={log.ogEmail} />
              <Feature label="Verified" value={log.verified} />
            </div>
          </div>

          {/* Description */}
          {log.description && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Description</h3>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-7 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                {log.description}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Quantity</p>
                <p className="text-xs text-zinc-500">
                  {maxQuantity} unit{maxQuantity === 1 ? "" : "s"} available in this category
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                >
                  <Minus size={16} />
                </button>

                <span className="w-8 text-center text-lg font-bold text-zinc-900 dark:text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increment}
                  disabled={quantity >= maxQuantity}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Live price breakdown */}
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <span className="text-sm text-zinc-500">
                ₦{unitPrice.toLocaleString()} × {quantity}
              </span>
              <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Purchase */}
          <PurchaseButton
            loading={loading}
            price={totalPrice}
            onPurchase={() => onPurchase(log.id, quantity)}
          />
        </div>
      </div>
    </div>
  );
}