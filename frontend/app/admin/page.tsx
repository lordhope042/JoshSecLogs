"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Wallet,
  LogOut,
  Loader2,
  TrendingUp,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */
interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  successfulOrders: number;
  cancelledOrders: number;
  totalDeposits: number;
  totalLogsPurchased: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
}

interface RecentOrder {
  id: string;
  user: { username: string };
  status: string;
  amount: number;
  createdAt: string;
}

interface RecentUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

/* ───────────────────────────────────────────
   API Client
   ─────────────────────────────────────────── */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */
function formatCurrency(value: number): string {
  if (!value || isNaN(value)) return "₦0";
  return `₦${value.toLocaleString("en-NG")}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ───────────────────────────────────────────
   Stat Card Component
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
  color: "blue" | "green" | "orange" | "purple" | "red" | "emerald";
  subtitle?: string;
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 transition hover:border-zinc-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Admin Dashboard Page
   ─────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/dashboard");
      setStats(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load dashboard data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220]">
        <div className="text-center">
          <p className="text-zinc-400">Failed to load dashboard data.</p>
          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#0B1220]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || 0}
            icon={<Users size={24} />}
            color="blue"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders?.toLocaleString() || 0}
            icon={<ShoppingCart size={24} />}
            color="orange"
            subtitle={`${stats.successfulOrders || 0} successful · ${stats.cancelledOrders || 0} cancelled`}
          />
          <StatCard
            title="Successful Orders"
            value={stats.successfulOrders?.toLocaleString() || 0}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <StatCard
            title="Cancelled Orders"
            value={stats.cancelledOrders?.toLocaleString() || 0}
            icon={<XCircle size={24} />}
            color="red"
          />
          <StatCard
            title="Total Deposits"
            value={formatCurrency(stats.totalDeposits || 0)}
            icon={<Wallet size={24} />}
            color="emerald"
          />
          <StatCard
            title="Logs Purchased"
            value={stats.totalLogsPurchased?.toLocaleString() || 0}
            icon={<CreditCard size={24} />}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue || 0)}
            icon={<TrendingUp size={24} />}
            color="green"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <button
                onClick={() => router.push("/admin/orders")}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-zinc-800">
              {stats.recentOrders?.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-zinc-500">
                  No orders yet
                </p>
              )}
              {stats.recentOrders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {order.user?.username || "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(order.amount || 0)}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "SUCCESS" || order.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : order.status === "CANCELLED" || order.status === "FAILED"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h2 className="text-lg font-semibold">Recent Users</h2>
              <button
                onClick={() => router.push("/admin/users")}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-zinc-800">
              {stats.recentUsers?.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-zinc-500">
                  No users yet
                </p>
              )}
              {stats.recentUsers?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.username}
                    </p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}