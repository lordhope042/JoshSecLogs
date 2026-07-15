"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  data: { authorizationUrl: string };
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
  `${currency} ${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const loadInFlight = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- STATUS & TYPE CONFIGS ----
  const statusConfig: Record<string, { color: string; bg: string; border: string; label: string; iconPath: string }> = {
    success: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Success", iconPath: "M5 13l4 4L19 7" },
    pending: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Pending", iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    failed: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Failed", iconPath: "M6 18L18 6M6 6l12 12" },
    cancelled: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", label: "Cancelled", iconPath: "M6 18L18 6M6 6l12 12" },
  };

  const typeConfig: Record<string, { color: string; bg: string; sign: string; iconPath: string }> = {
    credit: { color: "text-emerald-600", bg: "bg-emerald-50", sign: "+", iconPath: "M7 11l5-5m0 0l5 5m-5-5v12" },
    debit: { color: "text-red-600", bg: "bg-red-50", sign: "-", iconPath: "M17 13l-5 5m0 0l-5-5m5 5V6" },
    refund: { color: "text-blue-600", bg: "bg-blue-50", sign: "+", iconPath: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    purchase: { color: "text-gray-700", bg: "bg-gray-50", sign: "-", iconPath: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  };

  // ---- DATA LOADING ----
  const loadTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await getTransactions({
        page,
        limit: 10,
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      });
      setTransactions(response.data);
      setPagination(response.meta);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error("Couldn't load transactions.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery]);

  const loadWallet = useCallback(async () => {
    try {
      const response = await getWallet();
      setWallet(response.data);
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
      const response = await initializeDepositApi(amount);
      if (!response.data?.authorizationUrl) throw new Error("No authorization URL");
      setDepositOpen(false);
      setDepositAmount("");
      window.location.assign(response.data.authorizationUrl);
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
  const totalIn = transactions
    .filter((t) => t.type === "credit" || t.type === "refund")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === "debit" || t.type === "purchase")
    .reduce((s, t) => s + t.amount, 0);

  const hasActiveFilters = typeFilter || statusFilter || searchQuery;

  // ---- RENDER ----
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your balance and view transaction history</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* WALLET BALANCE CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-bold">{wallet?.currency ?? "₦"}</span>
              <span className="text-3xl md:text-4xl font-bold">
                {loading ? "—" : (wallet?.balance ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setDepositOpen(true)}
                className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Deposit
              </button>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total In</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalIn)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Out</p>
                <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalOut)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{pagination.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                <p className="text-xs text-gray-500">View and manage all your transactions</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by reference or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); applyFilters(); }}
                  className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transaction List */}
          <div className="divide-y divide-gray-50">
            {loading && transactions.length === 0 ? (
              // Skeleton Loading
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium text-gray-500">No transactions found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or make a deposit</p>
              </div>
            ) : (
              // Transaction Items
              transactions.map((tx) => {
                const sCfg = statusConfig[tx.status];
                const tCfg = typeConfig[tx.type] || typeConfig.purchase;
                return (
                  <button
                    key={tx.id}
                    onClick={() => handleViewDetails(tx.reference)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${tCfg.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <svg className={`w-5 h-5 ${tCfg.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tCfg.iconPath} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                        <span className={`text-sm font-semibold flex-shrink-0 ${tCfg.color}`}>
                          {tCfg.sign}{tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sCfg.iconPath} />
                            </svg>
                            {sCfg.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{tx.reference.slice(0, 10)}...</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {((pagination.page - 1) * 10) + 1} - {Math.min(pagination.page * 10, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs font-medium text-gray-700 px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {depositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setDepositOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Deposit Funds</h3>
              <button onClick={() => setDepositOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                  <input
                    type="number"
                    min={100}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 text-lg font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Minimum deposit: ₦100</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
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
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {funding ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setDetailOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            {(() => {
              const sCfg = statusConfig[selectedTx.status];
              const tCfg = typeConfig[selectedTx.type] || typeConfig.purchase;
              return (
                <>
                  <div className={`px-6 py-8 text-center ${sCfg.bg} border-b ${sCfg.border} relative`}>
                    <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 transition-colors">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className={`w-16 h-16 mx-auto rounded-full ${sCfg.bg} border-2 ${sCfg.border} flex items-center justify-center mb-3`}>
                      <svg className={`w-8 h-8 ${sCfg.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sCfg.iconPath} />
                      </svg>
                    </div>
                    <h3 className={`text-2xl font-bold ${sCfg.color}`}>
                      {tCfg.sign}₦{selectedTx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{selectedTx.type}</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-gray-500 flex-shrink-0">Reference</span>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-sm font-medium text-gray-900 font-mono">{selectedTx.reference}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(selectedTx.reference); toast.success("Reference copied!"); }}
                          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-gray-500 flex-shrink-0">Description</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{selectedTx.description}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-gray-500 flex-shrink-0">Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.bg} ${sCfg.color} border ${sCfg.border}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sCfg.iconPath} />
                        </svg>
                        {sCfg.label}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-gray-500 flex-shrink-0">Date</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-gray-500 flex-shrink-0">Updated</span>
                    </div>
                    {selectedTx.metadata && Object.keys(selectedTx.metadata).length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Additional Info</p>
                        <div className="space-y-2">
                          {Object.entries(selectedTx.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-start justify-between gap-4">
                              <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                              <span className="text-sm font-medium text-gray-900 text-right">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button onClick={() => setDetailOpen(false)} className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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