"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  Loader2,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Globe,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

/* ── Types ── */

interface AdminPayment {
  id: string;
  userId: string;
  reference: string;
  amount: number | string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  gatewayReference: string | null;
  providerResponse: any;
  updatedAt: string;
  currency: string;
  paidAt: string | null;
  provider: string;
  verifiedAt: string | null;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

/* ── Helpers ── */

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: "bg-yellow-500/10 text-yellow-500", icon: Clock, label: "Pending" },
  SUCCESS: { color: "bg-green-500/10 text-green-500", icon: CheckCircle2, label: "Success" },
  FAILED: { color: "bg-red-500/10 text-red-500", icon: XCircle, label: "Failed" },
};

function formatMoney(value: number | string, currency: string): string {
  const num = Number(value);
  if (isNaN(num)) return `${currency === "NGN" ? "₦" : ""}0`;
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "";
  return `${symbol}${num.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Page ── */

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/payments");
      const data = Array.isArray(res.data) ? res.data : res.data?.payments ?? [];
      setPayments(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load payments.";
      toast.error(msg);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /* Stats */
  const stats = useMemo(() => {
    const total = payments.length;
    const successful = payments.filter((p) => p.status === "SUCCESS").length;
    const pending = payments.filter((p) => p.status === "PENDING").length;
    const failed = payments.filter((p) => p.status === "FAILED").length;
    const totalRevenue = payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { total, successful, pending, failed, totalRevenue };
  }, [payments]);

  const providers = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => set.add(p.provider || "UNKNOWN"));
    return Array.from(set).sort();
  }, [payments]);

  /* Filtered rows */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (providerFilter !== "ALL" && (p.provider || "UNKNOWN") !== providerFilter) return false;
      if (!q) return true;
      return (
        p.reference?.toLowerCase().includes(q) ||
        p.gatewayReference?.toLowerCase().includes(q) ||
        p.user?.email?.toLowerCase().includes(q) ||
        p.user?.name?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [payments, search, statusFilter, providerFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            All wallet funding transactions processed through payment gateways.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Payments" value={stats.total} icon={CreditCard} color="text-blue-500" />
        <StatCard label="Successful" value={stats.successful} icon={CheckCircle2} color="text-green-500" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-yellow-500" />
        <StatCard label="Failed" value={stats.failed} icon={XCircle} color="text-red-500" />
        <StatCard
          label="Total Revenue"
          value={formatMoney(stats.totalRevenue, "NGN")}
          icon={Banknote}
          color="text-emerald-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, gateway ref, user email or name..."
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All Providers</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <CreditCard className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    No payments found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-medium">{p.reference}</div>
                        {p.gatewayReference && (
                          <div className="font-mono text-xs text-muted-foreground">
                            gw: {p.gatewayReference}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <div className="text-xs font-medium">{p.user?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{p.user?.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{formatMoney(p.amount, p.currency)}</div>
                        <div className="text-xs text-muted-foreground">{p.currency}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          <Globe className="h-3 w-3" />
                          {p.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${cfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(p.createdAt)}
                        </div>
                        {p.paidAt && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600">
                            <ShieldCheck className="h-3 w-3" />
                            Paid {formatDate(p.paidAt)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} of {payments.length} payment{payments.length === 1 ? "" : "s"}.
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}
