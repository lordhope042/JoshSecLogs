"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CreditCard,
  Smartphone,
  ShoppingBag,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  User,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */
type BackendType = "CREDIT" | "DEBIT" | "PURCHASE" | "WITHDRAWAL" | "REFUND" | "ADJUSTMENT" | string;
type BackendStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | string;

type FrontendType = "DEPOSIT" | "WITHDRAWAL" | "VIRTUAL_NUMBER" | "SOCIAL_LOG" | "REFUND" | "ADJUSTMENT";
type Direction = "in" | "out" | "refund";

interface RawTransaction {
  id: string;
  type: BackendType;
  status: BackendStatus;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;
  reference?: string | null;
  userId: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: FrontendType;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  direction: Direction;       // ground truth for +/- and color, derived from balance delta
  displayAmount: number;      // absolute value for display
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;
  reference?: string | null;
  userId: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  metadata?: Record<string, any> | null;
  createdAt: string | null;
}

/* ───────────────────────────────────────────
   Backend → Frontend Mapping
   ─────────────────────────────────────────── */
const SOCIAL_KEYWORDS = ["facebook", "instagram", "reddit", "twitter", "tiktok", "social"];
const VIRTUAL_NUMBER_KEYWORDS = ["whatsapp", "airbnb", "virtual", "telegram"];

function matchesKeyword(desc: string, keywords: string[]): boolean {
  return keywords.some((k) => desc.includes(k));
}

function mapBackendType(raw: BackendType, description?: string | null): FrontendType {
  const desc = (description || "").toLowerCase();

  switch (raw) {
    case "CREDIT":
      return "DEPOSIT";
    case "DEBIT":
      // DEBIT = virtual number purchase (WhatsApp, Airbnb, etc.)
      return matchesKeyword(desc, SOCIAL_KEYWORDS) ? "SOCIAL_LOG" : "VIRTUAL_NUMBER";
    case "PURCHASE":
      // PURCHASE = social media account purchase — inspect description to distinguish
      return matchesKeyword(desc, SOCIAL_KEYWORDS) ? "SOCIAL_LOG" : "VIRTUAL_NUMBER";
    case "WITHDRAWAL":
      return "WITHDRAWAL";
    case "REFUND":
      return "REFUND";
    case "ADJUSTMENT":
      return "ADJUSTMENT";
    default:
      // Fallback: inspect description for keywords
      if (matchesKeyword(desc, SOCIAL_KEYWORDS)) return "SOCIAL_LOG";
      if (matchesKeyword(desc, VIRTUAL_NUMBER_KEYWORDS)) return "VIRTUAL_NUMBER";
      return "ADJUSTMENT";
  }
}

function mapBackendStatus(raw: BackendStatus): Transaction["status"] {
  switch (raw) {
    case "PENDING":
    case "SUCCESS":
    case "FAILED":
    case "CANCELLED":
      return raw;
    default:
      return "PENDING";
  }
}

// Ground truth for direction is the balance delta, not the sign of `amount`.
// Different endpoints have proven inconsistent about signing `amount`, but
// balanceBefore/balanceAfter can't lie about which way money actually moved.
function resolveDirection(t: RawTransaction, mappedType: FrontendType): Direction {
  if (mappedType === "REFUND") return "refund";

  const delta = (t.balanceAfter ?? 0) - (t.balanceBefore ?? 0);
  if (delta !== 0) return delta > 0 ? "in" : "out";

  // Fallback only if balances are equal/missing (shouldn't normally happen)
  return mappedType === "DEPOSIT" ? "in" : "out";
}

function resolveDisplayAmount(t: RawTransaction): number {
  const delta = Math.abs((t.balanceAfter ?? 0) - (t.balanceBefore ?? 0));
  return delta > 0 ? delta : Math.abs(t.amount ?? 0);
}

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */
function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-NG", {
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

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "₦0";
  return `₦${Math.abs(value).toLocaleString("en-NG")}`;
}

function getTypeIcon(type: FrontendType) {
  switch (type) {
    case "DEPOSIT":
      return <ArrowDownLeft size={18} />;
    case "WITHDRAWAL":
      return <ArrowUpRight size={18} />;
    case "VIRTUAL_NUMBER":
      return <Smartphone size={18} />;
    case "SOCIAL_LOG":
      return <ShoppingBag size={18} />;
    case "REFUND":
      return <RotateCcw size={18} />;
    case "ADJUSTMENT":
      return <Activity size={18} />;
    default:
      return <CreditCard size={18} />;
  }
}

function getTypeColor(type: FrontendType): string {
  switch (type) {
    case "DEPOSIT":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "WITHDRAWAL":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "VIRTUAL_NUMBER":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "SOCIAL_LOG":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "REFUND":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "ADJUSTMENT":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

// Amount color follows direction (green=in, sky=refund, red=out), but only
// when SUCCESS — pending/failed/cancelled never colored as if money moved.
function getAmountColor(direction: Direction, status: Transaction["status"]): string {
  if (status !== "SUCCESS") return "text-zinc-400";
  switch (direction) {
    case "in":
      return "text-emerald-400";
    case "refund":
      return "text-sky-400";
    case "out":
      return "text-red-400";
  }
}

function getAmountSign(direction: Direction, status: Transaction["status"]): string {
  if (status !== "SUCCESS") return "";
  return direction === "out" ? "-" : "+";
}

function getStatusBadge(status: Transaction["status"]): string {
  switch (status) {
    case "SUCCESS":
      return "bg-green-500/10 text-green-400";
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-400";
    case "FAILED":
      return "bg-red-500/10 text-red-400";
    case "CANCELLED":
      return "bg-zinc-500/10 text-zinc-400";
    default:
      return "bg-zinc-500/10 text-zinc-400";
  }
}

function getStatusIcon(status: Transaction["status"]) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle size={14} />;
    case "PENDING":
      return <Clock size={14} />;
    case "FAILED":
      return <XCircle size={14} />;
    case "CANCELLED":
      return <XCircle size={14} />;
    default:
      return <Clock size={14} />;
  }
}

function getDisplayName(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "Unknown User";
  return name;
}

/* ───────────────────────────────────────────
   Stat Card
   ─────────────────────────────────────────── */
function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{subtitle}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Transaction Details Modal
   ─────────────────────────────────────────── */
function TransactionDetailsModal({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  if (!transaction) return null;

  const userName = getDisplayName(transaction.user?.name);
  const userEmail = transaction.user?.email || "No email";
  const amountColor = getAmountColor(transaction.direction, transaction.status);
  const sign = getAmountSign(transaction.direction, transaction.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* Amount Header */}
          <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4 text-center">
            <p className="text-xs text-gray-400 dark:text-zinc-500">Amount</p>
            <p className={`mt-1 text-3xl font-bold ${amountColor}`}>
              {sign}
              {formatCurrency(transaction.displayAmount)}
            </p>
            {transaction.direction === "refund" && (
              <p className="mt-1 text-xs text-sky-400">Refund</p>
            )}
            <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Transaction ID</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-all">{transaction.id}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Reference</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{transaction.reference || "N/A"}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Type</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{transaction.type.replace("_", " ")}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Date</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDate(transaction.createdAt)}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Balance Before</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(transaction.balanceBefore)}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Balance After</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(transaction.balanceAfter)}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4 col-span-2">
              <p className="text-xs text-gray-400 dark:text-zinc-500">User</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500">{userEmail}</p>
            </div>
            {transaction.description && (
              <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4 col-span-2">
                <p className="text-xs text-gray-400 dark:text-zinc-500">Description</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</p>
              </div>
            )}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4 col-span-2">
                <p className="text-xs text-gray-400 dark:text-zinc-500">Metadata</p>
                <pre className="mt-1 text-xs text-gray-500 dark:text-zinc-400 overflow-x-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Main Page
   ─────────────────────────────────────────── */
export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | FrontendType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Transaction["status"]>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount_high" | "amount_low">("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/transactions");

      const rawItems: RawTransaction[] = Array.isArray(data) ? data : data.transactions || [];

      const normalized: Transaction[] = rawItems.map((t) => {
        const mappedType = mapBackendType(t.type, t.description);
        const direction = resolveDirection(t, mappedType);

        return {
          id: t.id || "",
          type: mappedType,
          status: mapBackendStatus(t.status),
          direction,
          displayAmount: resolveDisplayAmount(t),
          balanceBefore: t.balanceBefore ?? 0,
          balanceAfter: t.balanceAfter ?? 0,
          description: t.description || null,
          reference: t.reference || null,
          userId: t.userId || "",
          user: t.user
            ? {
                name: t.user.name || null,
                email: t.user.email || null,
              }
            : null,
          metadata: t.metadata || null,
          createdAt: t.createdAt || null,
        };
      });

      setTransactions(normalized);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load transactions";
      toast.error(msg);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.reference?.toLowerCase() || "").includes(keyword) ||
          (t.user?.name?.toLowerCase() || "").includes(keyword) ||
          (t.user?.email?.toLowerCase() || "").includes(keyword) ||
          (t.description?.toLowerCase() || "").includes(keyword),
      );
    }

    if (typeFilter !== "ALL") {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const fromTime = fromDate.getTime();
      result = result.filter((t) => (t.createdAt ? new Date(t.createdAt).getTime() >= fromTime : false));
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // include the entire "to" day
      const toTime = toDate.getTime();
      result = result.filter((t) => (t.createdAt ? new Date(t.createdAt).getTime() <= toTime : false));
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case "oldest":
        result.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });
        break;
      case "amount_high":
        result.sort((a, b) => b.displayAmount - a.displayAmount);
        break;
      case "amount_low":
        result.sort((a, b) => a.displayAmount - b.displayAmount);
        break;
    }

    return result;
  }, [transactions, search, typeFilter, statusFilter, sortBy, dateRange]);

  // Pagination — fixed window calc, no duplicate page numbers at the tail
  const totalPages = Math.ceil(filteredTransactions.length / limit) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTransactions.slice(start, start + limit);
  }, [filteredTransactions, page, limit]);

  const pageWindow = useMemo(() => {
    const windowSize = Math.min(totalPages, 5);
    const start = Math.max(1, Math.min(page - 2, totalPages - windowSize + 1));
    return Array.from({ length: windowSize }, (_, i) => start + i);
  }, [page, totalPages]);

  // Stats — driven by direction (balance-delta based), not amount sign
  const stats = useMemo(() => {
    const successful = transactions.filter((t) => t.status === "SUCCESS");

    const totalIn = successful
      .filter((t) => t.direction === "in")
      .reduce((sum, t) => sum + t.displayAmount, 0);
    const totalOut = successful
      .filter((t) => t.direction === "out")
      .reduce((sum, t) => sum + t.displayAmount, 0);
    const totalRefunded = successful
      .filter((t) => t.direction === "refund")
      .reduce((sum, t) => sum + t.displayAmount, 0);

    const netFlow = totalIn + totalRefunded - totalOut;
    const pending = transactions.filter((t) => t.status === "PENDING").length;
    const deposits = successful.filter((t) => t.type === "DEPOSIT").length;
    const virtualNumbers = successful.filter((t) => t.type === "VIRTUAL_NUMBER").length;
    const socialLogs = successful.filter((t) => t.type === "SOCIAL_LOG").length;
    const refunds = successful.filter((t) => t.type === "REFUND").length;

    return {
      total: transactions.length,
      totalIn,
      totalOut,
      totalRefunded,
      netFlow,
      pending,
      deposits,
      virtualNumbers,
      socialLogs,
      refunds,
    };
  }, [transactions]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet & Transactions</h1>
          <p className="text-gray-500">Monitor all user transactions, deposits, and purchases.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Transactions" value={stats.total} icon={<Activity size={24} />} color="blue" />
        <StatCard
          title="Money In"
          value={formatCurrency(stats.totalIn)}
          icon={<TrendingUp size={24} />}
          color="emerald"
          subtitle={`${stats.deposits} deposits`}
        />
        <StatCard
          title="Money Out"
          value={formatCurrency(stats.totalOut)}
          icon={<TrendingDown size={24} />}
          color="red"
          subtitle={`${stats.virtualNumbers} VN · ${stats.socialLogs} Logs`}
        />
        <StatCard
          title="Refunded"
          value={formatCurrency(stats.totalRefunded)}
          icon={<RotateCcw size={24} />}
          color="sky"
          subtitle={`${stats.refunds} refunds`}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <StatCard
          title="Net Flow"
          value={formatCurrency(stats.netFlow)}
          icon={<Wallet size={24} />}
          color={stats.netFlow >= 0 ? "green" : "red"}
          subtitle={`In + refunds − out · ${stats.pending} pending`}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock size={24} />}
          color="yellow"
          subtitle="Awaiting confirmation"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search by reference, user name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="VIRTUAL_NUMBER">Virtual Numbers</option>
            <option value="SOCIAL_LOG">Social Logs</option>
            <option value="REFUND">Refunds</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Amount: High → Low</option>
            <option value="amount_low">Amount: Low → High</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400 dark:text-zinc-500" />
            <span className="text-sm text-gray-500 dark:text-zinc-400">From:</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => {
                setDateRange((prev) => ({ ...prev, from: e.target.value }));
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-zinc-400">To:</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => {
                setDateRange((prev) => ({ ...prev, to: e.target.value }));
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
            />
          </div>
          {(dateRange.from || dateRange.to) && (
            <button
              onClick={() => {
                setDateRange({ from: "", to: "" });
                setPage(1);
              }}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Transaction</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">User</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Type</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Amount</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Date</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-zinc-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => {
                  const userName = getDisplayName(txn.user?.name);
                  const amountColor = getAmountColor(txn.direction, txn.status);
                  const sign = getAmountSign(txn.direction, txn.status);

                  return (
                    <tr key={txn.id} className="transition hover:bg-gray-100/30 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${getTypeColor(txn.type)}`}>
                            {getTypeIcon(txn.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{txn.description || txn.type.replace("_", " ")}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">{txn.reference || txn.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400 dark:text-zinc-500" />
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{userName}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">{txn.user?.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getTypeColor(txn.type)}`}>
                          {txn.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold ${amountColor}`}>
                          {sign}
                          {formatCurrency(txn.displayAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(txn.status)}`}>
                          {getStatusIcon(txn.status)}
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(txn.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setSelectedTransaction(txn)}
                            className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 px-6 py-4">
            <p className="text-sm text-gray-400 dark:text-zinc-500">
              Showing {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 dark:border-zinc-700 p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              {pageWindow.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pageNum === page
                      ? "bg-orange-600 text-white"
                      : "border border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 dark:border-zinc-700 p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
    </div>
  );
}
