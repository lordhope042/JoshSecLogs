"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ShoppingBag,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  X,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";

// =====================================
// API CLIENT (inline - no separate file)
// =====================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// =====================================
// TYPES (inline)
// =====================================
type TransactionType = "credit" | "debit" | "refund" | "purchase";
type TransactionStatus = "pending" | "success" | "failed" | "cancelled";

interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface Wallet {
  balance: number;
  currency: string;
  userId: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TransactionsResponse {
  data: Transaction[];
  meta: PaginationMeta;
}

interface WalletResponse {
  data: Wallet;
}

interface DepositResponse {
  success: boolean;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  // Some gateways / wrappers nest under `data` — kept for safety.
  data?: { authorizationUrl: string; authorization_url?: string };
}

interface SingleTransactionResponse {
  data: Transaction;
}

// =====================================
// API CALLS (inline - direct endpoints)
// =====================================
const getWallet = (): Promise<WalletResponse> => apiClient.get("/wallet");

const getTransactions = (params?: { page?: number; limit?: number; type?: string; status?: string; search?: string }): Promise<TransactionsResponse> =>
  apiClient.get("/wallet/transactions", { params });

const getTransactionByReference = (reference: string): Promise<SingleTransactionResponse> =>
  apiClient.get(`/wallet/transactions/${reference}`);

const refreshWalletApi = (): Promise<WalletResponse> => apiClient.get("/wallet/refresh");

const initializeDepositApi = (amount: number): Promise<DepositResponse> =>
  apiClient.post("/payments/initialize", { amount });

// =====================================
// UTILITIES (inline)
// =====================================
const formatCurrency = (amount: number, currency = "₦") =>
  `${currency}${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

// =====================================
// STATUS & TYPE CONFIGS — same visual language as the admin build
// =====================================
const statusConfig: Record<
  TransactionStatus,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  success: { label: "Success", badge: "bg-green-500/10 text-green-400", icon: <CheckCircle size={14} /> },
  pending: { label: "Pending", badge: "bg-yellow-500/10 text-yellow-400", icon: <Clock size={14} /> },
  failed: { label: "Failed", badge: "bg-red-500/10 text-red-400", icon: <XCircle size={14} /> },
  cancelled: { label: "Cancelled", badge: "bg-zinc-500/10 text-zinc-400", icon: <XCircle size={14} /> },
};

const typeConfig: Record<
  TransactionType,
  { color: string; badge: string; sign: string; icon: React.ReactNode }
> = {
  credit: {
    color: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    sign: "+",
    icon: <ArrowDownLeft size={18} />,
  },
  debit: {
    color: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    sign: "-",
    icon: <ArrowUpRight size={18} />,
  },
  refund: {
    color: "text-sky-400",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    sign: "+",
    icon: <RotateCcw size={18} />,
  },
  purchase: {
    color: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    sign: "-",
    icon: <ShoppingBag size={18} />,
  },
};

/* ───────────────────────────────────────────
   Stat Card — matches the admin build's StatCard
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
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">{title}</p>
          <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{subtitle}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// =====================================
// MAIN PAGE
// =====================================
export default function TransactionsPage() {
  // ---- STATE ----
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });

  // Bulletproof accessor — if pagination ever becomes undefined, fall back to
  // safe defaults so `pagination.total` can never throw "Cannot read properties
  // of undefined (reading 'total')".
  const safePagination: PaginationMeta = pagination ?? {
    page: 1, limit: 10, total: 0, totalPages: 1,
  };

  const loadInFlight = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- DATA LOADING ----
  const loadTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response: any = await getTransactions({
        page,
        limit: 10,
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      // Backend returns { success, data: [...] } with NO meta field.
      // Guard against every possible shape so pagination.total never crashes.
      const raw: any = response?.data ?? response;
      const list: Transaction[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.transactions)
            ? raw.transactions
            : [];

      const meta: PaginationMeta | undefined =
        response?.meta ?? raw?.meta ?? undefined;

      setTransactions(list);
      setPagination(
        meta && typeof meta.total === "number"
          ? meta
          : {
              page,
              limit: 10,
              total: list.length,
              totalPages: Math.max(1, Math.ceil(list.length / 10)),
            },
      );
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error("Couldn't load transactions.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery]);

  const loadWallet = useCallback(async () => {
    try {
      const response: any = await getWallet();
      const w: Wallet | undefined = response?.data ?? response;
      setWallet(w && typeof w === "object" ? w : null);
    } catch (err) {
      console.error("Failed to load wallet:", err);
    }
  }, []);

  const load = useCallback(async () => {
    if (loadInFlight.current) return;
    loadInFlight.current = true;
    try {
      await Promise.all([loadWallet(), loadTransactions(1)]);
    } catch (err) {
      console.error("Failed to load:", err);
      toast.error("Couldn't refresh your wallet.");
    } finally {
      loadInFlight.current = false;
    }
  }, [loadWallet, loadTransactions]);

  // ---- PAYSTACK RETURN HANDLER ----
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference) {
      window.history.replaceState({}, "", window.location.pathname);
      toast.info("Confirming your payment…");
      pendingTimeout.current = setTimeout(() => load(), 1500);
    } else {
      load();
    }

    return () => {
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- AUTO-REFRESH ON TAB RETURN ----
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
      pendingTimeout.current = setTimeout(() => load(), 1000);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, [load]);

  // ---- MANUAL REFRESH ----
  async function handleRefresh() {
    if (refreshing || loading) return;
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success("Wallet refreshed!");
  }

  // ---- DEPOSIT ----
  async function handleDeposit(amount: number) {
    if (funding) return;
    setFunding(true);
    try {
      const response: any = await initializeDepositApi(amount);
      // The inline apiClient has a response interceptor that unwraps
      // `response.data`, so `response` IS the backend JSON body already.
      // The backend returns { success, reference, authorizationUrl, accessCode }
      // with authorizationUrl at the top level — NOT nested under `.data`.
      const authUrl =
        response?.authorizationUrl ??
        response?.data?.authorizationUrl ??
        response?.authorization_url ??
        response?.data?.authorization_url;
      if (!authUrl) throw new Error("No authorization URL");
      setDepositOpen(false);
      setDepositAmount("");
      window.location.assign(authUrl);
    } catch (err) {
      console.error("Deposit failed:", err);
      toast.error("Couldn't start the deposit. Please try again.");
      setFunding(false);
    }
  }

  // ---- VIEW TRANSACTION DETAIL ----
  async function handleViewDetails(reference: string) {
    try {
      const response = await getTransactionByReference(reference);
      setSelectedTx(response.data);
      setDetailOpen(true);
    } catch (err) {
      toast.error("Failed to load transaction details");
    }
  }

  // ---- PAGINATION ----
  function handlePageChange(page: number) {
    loadTransactions(page);
  }

  // ---- APPLY FILTERS ----
  function applyFilters() {
    loadTransactions(1);
  }

  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
    loadTransactions(1);
  }

  // ---- STATS ----
  // NOTE: these totals only reflect the currently loaded page (the backend
  // paginates /wallet/transactions), not the user's lifetime totals — hence
  // "This Page" in the subtitle. Swap in a real aggregate endpoint if one
  // becomes available; don't silently relabel this as a lifetime total.
  const totalIn = transactions
    .filter((t) => t.type === "credit" || t.type === "refund")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === "debit" || t.type === "purchase")
    .reduce((s, t) => s + t.amount, 0);

  const hasActiveFilters = typeFilter || statusFilter || searchQuery;

  // ---- RENDER ----
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your balance and view transaction history</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 transition hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* WALLET BALANCE CARD */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-0 h-48 w-48 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-orange-100">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold">{wallet?.currency ?? "₦"}</span>
              <span className="text-3xl md:text-4xl font-bold">
                {loading ? "—" : (wallet?.balance ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setDepositOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-orange-700 shadow-lg transition active:scale-95 hover:bg-orange-50"
              >
                <Plus size={16} />
                Deposit
              </button>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Total In"
            value={formatCurrency(totalIn)}
            icon={<TrendingUp size={20} />}
            color="emerald"
            subtitle="This page"
          />
          <StatCard
            title="Total Out"
            value={formatCurrency(totalOut)}
            icon={<TrendingDown size={20} />}
            color="red"
            subtitle="This page"
          />
          <StatCard
            title="Transactions"
            value={safePagination.total}
            icon={<Activity size={20} />}
            color="blue"
            subtitle="All time"
          />
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80">
          {/* Section Header */}
          <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-zinc-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Activity size={16} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">View and manage all your transactions</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 transition hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="space-y-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/50 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by reference or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); applyFilters(); }}
                  className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
                >
                  <option value="">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="refund">Refund</option>
                  <option value="purchase">Purchase</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}
                  className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-500/20"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transaction List */}
          <div className="divide-y divide-gray-50 dark:divide-zinc-800">
            {loading && transactions.length === 0 ? (
              // Skeleton Loading
              <div className="space-y-4 p-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex animate-pulse items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-800" />
                      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-zinc-600">
                <WalletIcon size={56} className="mb-4 text-gray-200 dark:text-zinc-800" />
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">No transactions found</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-zinc-600">Try adjusting your filters or make a deposit</p>
              </div>
            ) : (
              // Transaction Items
              transactions.map((tx) => {
                const sCfg = statusConfig[tx.status] ?? statusConfig.pending;
                const tCfg = typeConfig[tx.type] ?? typeConfig.purchase;
                return (
                  <button
                    key={tx.id}
                    onClick={() => handleViewDetails(tx.reference)}
                    className="group flex w-full items-center gap-4 p-4 text-left transition hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition group-hover:scale-110 ${tCfg.badge}`}>
                      {tCfg.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                        <span className={`flex-shrink-0 text-sm font-semibold ${tCfg.color}`}>
                          {tCfg.sign}{tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sCfg.badge}`}>
                          {sCfg.icon}
                          {sCfg.label}
                        </span>
                        <span className="font-mono text-xs text-gray-400 dark:text-zinc-500">{tx.reference.slice(0, 10)}...</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 text-gray-300 dark:text-zinc-700 transition group-hover:text-gray-500 dark:group-hover:text-zinc-400" />
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {safePagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-4">
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Showing {((safePagination.page - 1) * 10) + 1} - {Math.min(safePagination.page * 10, safePagination.total)} of {safePagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(safePagination.page - 1)}
                  disabled={safePagination.page <= 1 || loading}
                  className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-gray-600 dark:text-zinc-400 transition hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 text-xs font-medium text-gray-700 dark:text-zinc-300">
                  Page {safePagination.page} of {safePagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(safePagination.page + 1)}
                  disabled={safePagination.page >= safePagination.totalPages || loading}
                  className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-gray-600 dark:text-zinc-400 transition hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {depositOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDepositOpen(false)}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deposit Funds</h3>
              <button onClick={() => setDepositOpen(false)} className="rounded-lg p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500 dark:text-zinc-400">₦</span>
                  <input
                    type="number"
                    min={100}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 py-3 pl-10 pr-4 text-lg font-semibold text-gray-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">Minimum deposit: ₦100</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 transition hover:bg-gray-100 dark:hover:bg-zinc-700"
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const amt = Number(depositAmount);
                  if (!amt || amt < 100) { toast.error("Minimum deposit is ₦100"); return; }
                  handleDeposit(amt);
                }}
                disabled={funding}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-semibold text-white transition active:scale-[0.98] hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {funding ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAIL MODAL */}
      {detailOpen && selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDetailOpen(false)}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl">
            {(() => {
              const sCfg = statusConfig[selectedTx.status] ?? statusConfig.pending;
              const tCfg = typeConfig[selectedTx.type] ?? typeConfig.purchase;
              return (
                <>
                  <div className={`relative border-b px-6 py-8 text-center ${sCfg.badge} border-current/20`}>
                    <button
                      onClick={() => setDetailOpen(false)}
                      className="absolute right-4 top-4 rounded-full p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <X size={18} />
                    </button>
                    <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 ${sCfg.badge}`}>
                      {sCfg.icon}
                    </div>
                    <h3 className={`text-2xl font-bold ${tCfg.color}`}>
                      {tCfg.sign}₦{selectedTx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="mt-1 text-sm capitalize text-gray-600 dark:text-zinc-400">{selectedTx.type}</p>
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-gray-500 dark:text-zinc-400">Reference</span>
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{selectedTx.reference}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(selectedTx.reference); toast.success("Reference copied!"); }}
                          className="rounded-md p-1 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                          <Copy size={14} className="text-gray-400 dark:text-zinc-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-gray-500 dark:text-zinc-400">Description</span>
                      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{selectedTx.description}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-gray-500 dark:text-zinc-400">Status</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sCfg.badge}`}>
                        {sCfg.icon}
                        {sCfg.label}
                      </span>
                    </div>
                    {/* FIX: these two rows previously showed only the label
                        with no value — the date spans were never added. */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-gray-500 dark:text-zinc-400">Date</span>
                      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedTx.createdAt)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-gray-500 dark:text-zinc-400">Updated</span>
                      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedTx.updatedAt)}</span>
                    </div>
                    {selectedTx.metadata && Object.keys(selectedTx.metadata).length > 0 && (
                      <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Additional Info</p>
                        <div className="space-y-2">
                          {Object.entries(selectedTx.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-start justify-between gap-4">
                              <span className="text-sm capitalize text-gray-500 dark:text-zinc-400">{key.replace(/_/g, " ")}</span>
                              <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 px-6 py-4">
                    <button
                      onClick={() => setDetailOpen(false)}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 transition hover:bg-gray-50 dark:hover:bg-zinc-800"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}