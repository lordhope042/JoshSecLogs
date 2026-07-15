"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Clock3,
  XCircle,
  Copy,
  Check,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/types/wallet";

interface TransactionCardProps {
  transaction: WalletTransaction;
}

type Direction = "in" | "out" | "refund";

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */

function resolveDirection(transaction: WalletTransaction): Direction {
  // Confirmed refund from the backend
  if (transaction.type === "REFUND") return "refund";

  const delta = transaction.balanceAfter - transaction.balanceBefore;

  if (delta > 0) return "in";
  if (delta < 0) return "out";

  // Fallback if balances are equal/missing
  return transaction.type === "CREDIT" ? "in" : "out";
}

function resolveAmount(transaction: WalletTransaction): number {
  const delta = Math.abs(transaction.balanceAfter - transaction.balanceBefore);
  return delta > 0 ? delta : Math.abs(transaction.amount);
}

function formatNaira(value: number): string {
  return `₦${Math.abs(value).toLocaleString("en-NG")}`;
}

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

// Word-boundary match — a bare substring check let short keywords like "x"
// false-positive on unrelated words (e.g. "Netflix", "Tax refund").
function matchesKeyword(description: string | undefined, keywords: string[]): boolean {
  if (!description) return false;
  const text = description.toLowerCase();
  return keywords.some((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(text);
  });
}

const VIRTUAL_NUMBER_KEYWORDS = [
  "virtual number",
  "sms",
  "otp",
  "activation",
  "airbnb",
  "telegram",
  "whatsapp",
];

const SOCIAL_LOGIN_KEYWORDS = [
  "facebook",
  "instagram",
  "reddit",
  "twitter",
  "tiktok",
  "social",
];

function formatTitle(type: WalletTransactionType, description: string): string {
  switch (type) {
    case "CREDIT":
      return "Wallet Funding";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "REFUND":
      return description || "Wallet Refund";
    case "ADJUSTMENT":
      return description || "Account Adjustment";
    case "PURCHASE":
      return description || "Purchase";
    case "DEBIT":
      return description || "Wallet Debit";
    default:
      return description || type;
  }
}

function formatSubLabel(type: WalletTransactionType, description: string): string {
  switch (type) {
    case "CREDIT":
      return "Wallet Funding";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "ADJUSTMENT":
      return "Account Adjustment";
    case "REFUND":
      if (matchesKeyword(description, VIRTUAL_NUMBER_KEYWORDS)) return "Refund · Virtual Number";
      if (matchesKeyword(description, SOCIAL_LOGIN_KEYWORDS)) return "Refund · Social Login";
      return "Refund";
    case "DEBIT":
      if (matchesKeyword(description, VIRTUAL_NUMBER_KEYWORDS)) return "Virtual Number";
      if (matchesKeyword(description, SOCIAL_LOGIN_KEYWORDS)) return "Social Login";
      return "Wallet Debit";
    case "PURCHASE":
      if (matchesKeyword(description, VIRTUAL_NUMBER_KEYWORDS)) return "Virtual Number";
      if (matchesKeyword(description, SOCIAL_LOGIN_KEYWORDS)) return "Social Login";
      return "Purchase";
    default:
      return type;
  }
}

function statusMeta(status: WalletTransactionStatus) {
  switch (status) {
    case "COMPLETED":
      return { icon: CheckCircle2, badge: "bg-green-500/20 text-green-400" };
    case "PENDING":
      return { icon: Clock3, badge: "bg-yellow-500/20 text-yellow-400" };
    case "FAILED":
      return { icon: XCircle, badge: "bg-red-500/20 text-red-400" };
    case "CANCELLED":
      return { icon: XCircle, badge: "bg-zinc-500/20 text-zinc-400" };
    default:
      return { icon: Clock3, badge: "bg-zinc-500/20 text-zinc-400" };
  }
}

function directionMeta(direction: Direction, settled: boolean) {
  if (!settled) {
    return { color: "text-zinc-400", iconBg: "bg-zinc-500/20", Icon: Clock3, sign: "" };
  }
  switch (direction) {
    case "in":
      return { color: "text-green-400", iconBg: "bg-green-500/20", Icon: ArrowDownLeft, sign: "+" };
    case "refund":
      return { color: "text-blue-400", iconBg: "bg-blue-500/20", Icon: RotateCcw, sign: "+" };
    case "out":
      return { color: "text-red-400", iconBg: "bg-red-500/20", Icon: ArrowUpRight, sign: "-" };
  }
}

/* ───────────────────────────────────────────
   Component
   ─────────────────────────────────────────── */
export default function TransactionCard({ transaction }: TransactionCardProps) {
  const [copied, setCopied] = useState(false);

  const direction = resolveDirection(transaction);
  const amount = resolveAmount(transaction);
  const settled = transaction.status === "COMPLETED";

  const baseMeta = directionMeta(direction, settled);
  const { icon: StatusIcon, badge } = statusMeta(transaction.status);

  const baseTitle = formatTitle(transaction.type, transaction.description);
  const baseSubLabel = formatSubLabel(transaction.type, transaction.description);

  // A client-side, unconfirmed guess set by TransactionHistory — only ever
  // applies to CREDIT transactions the backend hasn't distinguished from a
  // real top-up. Never overrides a backend-confirmed REFUND.
  const isInferredRefund =
    Boolean(transaction.inferredRefundOf) && transaction.type === "CREDIT" && direction === "in";

  const color = isInferredRefund ? "text-blue-400" : baseMeta.color;
  const iconBg = isInferredRefund ? "bg-blue-500/20" : baseMeta.iconBg;
  const Icon = isInferredRefund ? RotateCcw : baseMeta.Icon;
  const sign = baseMeta.sign;

  const title = isInferredRefund ? transaction.description || "Wallet Refund" : baseTitle;
  const subLabel = isInferredRefund ? "Possible Refund · Unconfirmed" : baseSubLabel;

  async function copyReference() {
    if (!transaction.reference) {
      toast.error("No reference to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(transaction.reference);
      setCopied(true);
      toast.success("Reference copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy reference");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-5 transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              {isInferredRefund && (
                <span title="We matched this credit to a recent purchase of the same amount, but the backend hasn't confirmed it as a refund.">
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-zinc-400">{subLabel}</p>
            <p className="mt-1 text-xs text-zinc-500">{formatDate(transaction.createdAt)}</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className={`text-xl font-bold ${color}`}>
            {sign}
            {formatNaira(amount)}
          </h2>

          <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{transaction.status}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-zinc-800" />

      {/* Balance Information */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Balance Before</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatNaira(transaction.balanceBefore)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Balance After</p>
          <p className="mt-2 text-lg font-semibold text-orange-400">{formatNaira(transaction.balanceAfter)}</p>
        </div>
      </div>

      {/* Description */}
      {transaction.description && (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Description</p>
          <p className="mt-2 break-words text-sm leading-6 text-zinc-300">{transaction.description}</p>
        </div>
      )}

      {/* Reference */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Transaction Reference</p>
          <p className="mt-1 truncate font-mono text-sm text-white">{transaction.reference || "N/A"}</p>
        </div>

        <button
          onClick={copyReference}
          title="Copy Reference"
          className="ml-4 rounded-lg p-2 transition-colors duration-200 hover:bg-zinc-800"
        >
          {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
}