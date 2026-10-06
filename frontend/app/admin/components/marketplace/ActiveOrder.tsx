"use client";

import type { ReactNode } from "react";
import {
  Smartphone,
  Globe,
  Radio,
  Package,
  CircleDollarSign,
  Calendar,
  Shield,
  CheckCircle2,
  Clock3,
  XCircle,
  Ban,
} from "lucide-react";

import { MarketplaceOrder } from "@/types/order";

interface Props {
  order?: MarketplaceOrder | null;

  onFinish?: () => void;
  onCancel?: () => void;
  onBan?: () => void;

  loading?: boolean;
}

export default function ActiveOrder({
  order,
  onFinish,
  onCancel,
  onBan,
  loading = false,
}: Props) {
  if (!order) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#111827] p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Active Number
        </h2>

        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <Smartphone className="mb-4 h-12 w-12 text-zinc-700" />

          <p className="text-lg font-medium text-gray-500 dark:text-zinc-400">
            No Active Number
          </p>

          <p className="mt-2 text-sm text-gray-400 dark:text-zinc-500">
            Purchase a number to receive SMS.
          </p>
        </div>
      </div>
    );
  }

  const status = order.status.toUpperCase();

  const badge =
    status === "ACTIVE"
      ? "bg-green-500/20 text-green-400"
      : status === "COMPLETED"
      ? "bg-blue-500/20 text-blue-400"
      : status === "CANCELLED" ||
        status === "CANCELED"
      ? "bg-red-500/20 text-red-400"
      : "bg-yellow-500/20 text-yellow-400";

  const Icon =
    status === "ACTIVE"
      ? Clock3
      : status === "COMPLETED"
      ? CheckCircle2
      : status === "CANCELLED" ||
        status === "CANCELED"
      ? XCircle
      : Clock3;

  return (
    <div className="rounded-3xl border border-orange-500 bg-white dark:bg-[#111827] p-8 shadow-xl">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {order.phoneNumber}
          </h2>

          <p className="mt-2 text-gray-400 dark:text-zinc-500">
            Provider Order #{order.providerOrderId}
          </p>

        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${badge}`}
        >
          <Icon className="h-4 w-4" />
          {status}
        </div>

      </div>

      {/* Details */}

      <div className="mt-8 grid gap-4 md:grid-cols-2">

        <InfoRow
          icon={<Globe size={18} />}
          label="Country"
          value={order.country}
        />

        <InfoRow
          icon={<Radio size={18} />}
          label="Operator"
          value={order.operator}
        />

        <InfoRow
          icon={<Package size={18} />}
          label="Service"
          value={order.service}
        />

        <InfoRow
          icon={<Shield size={18} />}
          label="Activation"
          value={order.activationType}
        />

        <InfoRow
          icon={<CircleDollarSign size={18} />}
          label="Paid"
          value={`₦${Number(
            order.sellingPriceNgn
          ).toLocaleString()}`}
          highlight
        />

        <InfoRow
          icon={<Calendar size={18} />}
          label="Purchased"
          value={new Date(
            order.createdAt
          ).toLocaleString()}
        />

      </div>

      {/* Actions */}

      {status === "ACTIVE" && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">

          <button
            disabled={loading}
            onClick={onFinish}
            className="rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            Finish
          </button>

          <button
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={onBan}
            className="rounded-xl bg-yellow-600 py-3 font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              <Ban size={16} />
              Ban Number
            </div>
          </button>

        </div>
      )}

    </div>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: InfoRowProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4">

      <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p
        className={`mt-2 break-all text-lg font-semibold ${
          highlight
            ? "text-orange-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}