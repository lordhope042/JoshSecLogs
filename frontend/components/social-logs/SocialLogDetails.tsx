"use client";

import Image from "next/image";
import {
  X,
  Globe,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  MapPin,
} from "lucide-react";

import { SocialLog } from "@/types/social-log";
import PurchaseButton from "./PurchaseButton";
import { CATEGORY_LABELS } from "./SocialLogCard";

interface Props {
  log: SocialLog | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onPurchase: (id: string) => void;
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

export default function SocialLogDetails({ log, open, loading, onClose, onPurchase }: Props) {
  if (!open || !log) return null;

  const categoryLabel = CATEGORY_LABELS[log.category] ?? log.platform;
  const hasCountry = !!log.country;
  const hasFollowers = typeof log.followers === "number" && log.followers > 0;

  // Age box always shows (every category has one); country/followers only
  // when meaningful — VPN/Mail/Telegram/TextPlus logs won't have either.
  const statCount = 1 + (hasCountry ? 1 : 0) + (hasFollowers ? 1 : 0);
  const statGridClass =
    statCount === 3 ? "grid-cols-3" : statCount === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Banner */}
        <div className="relative h-52 w-full overflow-hidden rounded-t-3xl bg-gradient-to-r from-orange-500 to-amber-500">
          {log.image ? (
            <Image src={log.image} alt={log.username} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShieldCheck size={70} className="text-white/80" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
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
              <p className="mt-2 text-zinc-500">Premium aged account</p>
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
                <p className="text-xs text-zinc-500">Country</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{log.country}</p>
              </div>
            )}

            <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
              <Calendar className="mb-3 text-orange-500" />
              <p className="text-xs text-zinc-500">Age</p>
              {/* NOTE: aligned to months to match SocialLogCard's "{age} mo" —
                  flip both together if years was actually intended. */}
              <p className="font-semibold text-zinc-900 dark:text-white">{log.age} mo</p>
            </div>

            {hasFollowers && (
              <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900">
                <Users className="mb-3 text-orange-500" />
                <p className="text-xs text-zinc-500">Followers</p>
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

          {/* Purchase */}
          <PurchaseButton loading={loading} price={Number(log.price)} onPurchase={() => onPurchase(log.id)} />
        </div>
      </div>
    </div>
  );
}