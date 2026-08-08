"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Search,
  Loader2,
  RotateCcw,
  Smartphone,
  Globe,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

/* ── Types ── */

interface AdminOrder {
  id: string;
  userId: string;
  providerOrderId: string | null;
  country: string;
  operator: string;
  service: string;
  phoneNumber: string | null;
  providerCostUsd: number | string;
  sellingPriceNgn: number | string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "FAILED" | "BANNED" | "TIMEOUT";
  createdAt: string;
  updatedAt: string;
  activationType: string;
  provider: string;
  refundedAt: string | null;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

/* ── Helpers ── */

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-yellow-500/10 text-yellow-500", icon: Clock, label: "Pending" },
  ACTIVE: { color: "bg-blue-500/10 text-blue-500", icon: Smartphone, label: "Active" },
  COMPLETED: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, label: "Completed" },
  CANCELLED: { color: "bg-gray-500/10 text-gray-500", icon: XCircle, label: "Cancelled" },
  FAILED: { color: "bg-red-500/10 text-red-500", icon: XCircle, label: "Failed" },
  BANNED: { color: "bg-red-500/10 text-red-500", icon: Ban, label: "Banned" },
  TIMEOUT: { color: "bg-orange-500/10 text-orange-500", icon: Clock, label: "Timeout" },
};

function formatNgn(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "₦0";
  return `₦${num.toLocaleString("en-NG")}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [refundLoading, setRefundLoading] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      // `api` (shared @/lib/axios) already unwraps the response in its
      // interceptor — this resolves DIRECTLY to the backend payload, not
      // `{ data: ... }`. Don't destructure `.data` off it again (that was
      // the bug: a bare-array response meant `data` here was `undefined`,
      // and `data.data` crashed with "Cannot read properties of undefined
      // (reading 'data')" — caught below and shown as this generic toast).
      const payload: any = await api.get("/admin/orders");
      const list = Array.isArray(payload) ? payload : payload?.data ?? payload?.orders ?? [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefund = async (orderId: string) => {
    if (!confirm("Refund this order? The selling price will be credited back to the user's wallet.")) {
      return;
    }
    try {
      setRefundLoading(orderId);
      await api.post(`/admin/orders/${orderId}/refund`);
      toast.success("Order refunded successfully.");
      loadOrders();
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to refund order.");
    } finally {
      setRefundLoading(null);
    }
  };

  /* ── Filtering ── */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.service.toLowerCase().includes(q) ||
          order.country.toLowerCase().includes(q) ||
          order.phoneNumber?.toLowerCase().includes(q) ||
          order.user?.name?.toLowerCase().includes(q) ||
          order.user?.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  /* ── Stats ── */

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status === "ACTIVE").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const refunded = orders.filter((o) => o.refundedAt).length;
    const totalRevenue = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + Number(o.sellingPriceNgn), 0);
    return { total: orders.length, active, completed, refunded, totalRevenue };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0B1220]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1220] text-gray-900 dark:text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShoppingCart className="text-orange-500" size={24} />
          Orders
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Manage all virtual number orders across the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Orders", value: stats.total, icon: ShoppingCart, color: "text-orange-500" },
          { label: "Active", value: stats.active, icon: Smartphone, color: "text-blue-500" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-500" },
          { label: "Refunded", value: stats.refunded, icon: RotateCcw, color: "text-yellow-500" },
          { label: "Revenue", value: formatNgn(stats.totalRevenue), icon: TrendingUp, color: "text-green-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-[#0f172a] p-4"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-gray-500 dark:text-zinc-400">{stat.label}</span>
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, service, country, phone, or user..."
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-[#0f172a] dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-[#0f172a] dark:text-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FAILED">Failed</option>
          <option value="BANNED">Banned</option>
          <option value="TIMEOUT">Timeout</option>
        </select>
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-[#0f172a] p-12 text-center">
          <ShoppingCart className="mx-auto text-gray-400 dark:text-zinc-600" size={40} />
          <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
            {orders.length === 0 ? "No orders found." : "No orders match your filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-[#0f172a]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 text-left text-xs text-gray-500 dark:text-zinc-400">
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 dark:border-zinc-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{order.service}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500">{order.provider}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                          <Globe size={14} className="text-gray-400" />
                          {order.country}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500">{order.operator}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-zinc-300 font-mono text-xs">
                        {order.phoneNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" />
                          <div>
                            <div className="text-xs font-medium text-gray-900 dark:text-white">
                              {order.user?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-500">{order.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {formatNgn(order.sellingPriceNgn)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${statusCfg.color}`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!order.refundedAt && (order.status === "ACTIVE" || order.status === "PENDING" || order.status === "COMPLETED") ? (
                          <button
                            onClick={() => handleRefund(order.id)}
                            disabled={refundLoading === order.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/20 px-3 py-1.5 text-xs font-medium text-orange-500 transition hover:bg-orange-500/10 disabled:opacity-60"
                          >
                            {refundLoading === order.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <RotateCcw size={12} />
                            )}
                            Refund
                          </button>
                        ) : order.refundedAt ? (
                          <span className="text-xs text-gray-400 dark:text-zinc-600">Refunded</span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}