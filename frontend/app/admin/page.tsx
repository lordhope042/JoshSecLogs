"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  ShoppingCart,
  Wallet,
  LogOut,
  Loader2,
  TrendingUp,
  CreditCard,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AdminStatCard from "@/components/admin/AdminStatCard";

function formatCurrency(value: number): string {
  if (!value || isNaN(value)) return "₦0";
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { stats, loading, refresh } = useAdminDashboard();

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
            onClick={refresh}
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
        {/* Stats Grid — every field here matches AdminDashboardStats exactly */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AdminStatCard
            title="Total Users"
            value={stats.users?.toLocaleString() ?? 0}
            icon={<Users size={24} />}
            color="blue"
          />
          <AdminStatCard
            title="Wallet Balance"
            value={formatCurrency(stats.walletBalance ?? 0)}
            icon={<Wallet size={24} />}
            color="green"
          />
          <AdminStatCard
            title="Total Orders"
            value={stats.orders?.toLocaleString() ?? 0}
            icon={<ShoppingCart size={24} />}
            color="orange"
          />
          <AdminStatCard
            title="Active Orders"
            value={stats.activeOrders?.toLocaleString() ?? 0}
            icon={<Activity size={24} />}
            color="purple"
          />
          <AdminStatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue ?? 0)}
            icon={<TrendingUp size={24} />}
            color="green"
          />
          <AdminStatCard
            title="Payments"
            value={stats.payments?.toLocaleString() ?? 0}
            icon={<CreditCard size={24} />}
            color="blue"
          />
          <AdminStatCard
            title="Social Logs"
            value={stats.socialLogs?.toLocaleString() ?? 0}
            icon={<Layers size={24} />}
            color="orange"
          />
          <AdminStatCard
            title="Available Logs"
            value={stats.availableLogs?.toLocaleString() ?? 0}
            icon={<Layers size={24} />}
            color="purple"
          />
        </div>

        {/*
          Recent Orders / Recent Users panels removed — AdminDashboardStats
          has no fields for either. If your backend actually returns recent
          activity data (under any field name), share the real response
          shape and these can come back properly wired, instead of reading
          fields that don't exist on the type.
        */}
      </main>
    </div>
  );
}