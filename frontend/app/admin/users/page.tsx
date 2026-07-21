"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Wallet,
  UserCheck,
  Ban,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isActive?: boolean | null;
  wallet?: {
    balance?: number | null;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  _count?: {
    orders?: number;
    transactions?: number;
  };
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
function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "₦0";
  return `₦${value.toLocaleString("en-NG")}`;
}

function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "?";
  return name.charAt(0).toUpperCase();
}

function getDisplayName(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "Unknown User";
  return name;
}

function getDisplayEmail(email: string | null | undefined): string {
  if (!email || typeof email !== "string") return "No email";
  return email;
}

function getRole(role: string | null | undefined): string {
  if (!role || typeof role !== "string") return "USER";
  return role.toUpperCase();
}

function getStatus(isActive: boolean | null | undefined): boolean {
  return isActive === true;
}

function getBalance(wallet: { balance?: number | null } | null | undefined): number {
  return wallet?.balance ?? 0;
}

// Read the logged-in admin's own id from wherever your auth stores it.
// Adjust this if your app keeps the current user elsewhere (context, a
// decoded JWT, etc.) — localStorage is a placeholder matching this file's
// existing pattern of reading "access_token" directly.
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_id");
}

/* ───────────────────────────────────────────
   Stat Card
   ─────────────────────────────────────────── */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   User Details Modal
   ─────────────────────────────────────────── */
function UserDetailsModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null;

  const displayName = getDisplayName(user.name);
  const displayEmail = getDisplayEmail(user.email);
  const role = getRole(user.role);
  const isActive = getStatus(user.isActive);
  const balance = getBalance(user.wallet);
  const orders = user._count?.orders ?? 0;
  const transactions = user._count?.transactions ?? 0;
  const joined = formatDate(user.createdAt);

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4 rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-xl font-bold text-orange-500">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{displayName}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{displayEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Role</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{role}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Status</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                }`}
              >
                {isActive ? "Active" : "Suspended"}
              </span>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Balance</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(balance)}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Orders</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{orders}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Transactions</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{transactions}</p>
            </div>
            <div className="rounded-xl bg-gray-100/50 dark:bg-zinc-800/50 p-4">
              <p className="text-xs text-gray-400 dark:text-zinc-500">Joined</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{joined}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Main Page
   ─────────────────────────────────────────── */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "balance_high" | "balance_low">("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");

      const normalizedUsers = (Array.isArray(data) ? data : data.users || []).map((u: any) => ({
        id: u.id || "",
        name: u.name || null,
        email: u.email || null,
        role: u.role || "USER",
        isActive: u.isActive ?? true,
        wallet: u.wallet ? { balance: u.wallet.balance ?? 0 } : null,
        createdAt: u.createdAt || null,
        updatedAt: u.updatedAt || null,
        _count: {
          orders: u._count?.orders ?? 0,
          transactions: u._count?.transactions ?? 0,
        },
      }));

      setUsers(normalizedUsers);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load users";
      toast.error(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(keyword) ||
          (u.email?.toLowerCase() || "").includes(keyword),
      );
    }

    if (roleFilter !== "ALL") {
      result = result.filter((u) => getRole(u.role) === roleFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((u) =>
        statusFilter === "ACTIVE" ? getStatus(u.isActive) : !getStatus(u.isActive),
      );
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
      case "balance_high":
        result.sort((a, b) => getBalance(b.wallet) - getBalance(a.wallet));
        break;
      case "balance_low":
        result.sort((a, b) => getBalance(a.wallet) - getBalance(b.wallet));
        break;
    }

    return result;
  }, [users, search, roleFilter, statusFilter, sortBy]);

  // Pagination — fixed window calc, no duplicate page numbers at the tail
  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  const pageWindow = useMemo(() => {
    const windowSize = Math.min(totalPages, 5);
    const start = Math.max(1, Math.min(page - 2, totalPages - windowSize + 1));
    return Array.from({ length: windowSize }, (_, i) => start + i);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => getRole(u.role) === "ADMIN").length;
    const active = users.filter((u) => getStatus(u.isActive)).length;
    const suspended = users.filter((u) => !getStatus(u.isActive)).length;
    const totalBalance = users.reduce((sum, u) => sum + getBalance(u.wallet), 0);
    return { total, admins, active, suspended, totalBalance };
  }, [users]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // ── Actions ──

  const handleToggleRole = async (user: User) => {
    const isSelf = currentUserId != null && user.id === currentUserId;
    if (isSelf) {
      toast.error("You can't change your own role from here.");
      return;
    }

    const currentRole = getRole(user.role);
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const displayName = getDisplayName(user.name);

    if (!window.confirm(`Change ${displayName} to ${newRole}?`)) return;

    try {
      setActionLoading(user.id);
      await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
      toast.success(`${displayName} is now ${newRole}`);
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const isSelf = currentUserId != null && user.id === currentUserId;
    if (isSelf) {
      toast.error("You can't suspend your own account from here.");
      return;
    }

    const currentStatus = getStatus(user.isActive);
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "suspend";
    const displayName = getDisplayName(user.name);

    if (!window.confirm(`${action === "activate" ? "Activate" : "Suspend"} ${displayName}?`)) return;

    try {
      setActionLoading(user.id);
      await api.patch(`/admin/users/${user.id}/status`, { isActive: newStatus });
      toast.success(`${displayName} ${action}d`);
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500">Manage platform users and their accounts.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.total} icon={<Users size={24} />} color="blue" />
        <StatCard title="Admins" value={stats.admins} icon={<Shield size={24} />} color="orange" />
        <StatCard title="Active" value={stats.active} icon={<UserCheck size={24} />} color="green" />
        <StatCard title="Suspended" value={stats.suspended} icon={<Ban size={24} />} color="red" />
      </div>

      {/* Total Balance */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total User Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={<TrendingUp size={24} />}
          color="emerald"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as any);
            setPage(1);
          }}
          className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
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
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="balance_high">Balance: High → Low</option>
          <option value="balance_low">Balance: Low → High</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">User</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Role</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Balance</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400">Joined</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-zinc-500">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const displayName = getDisplayName(user.name);
                  const displayEmail = getDisplayEmail(user.email);
                  const role = getRole(user.role);
                  const isActive = getStatus(user.isActive);
                  const balance = getBalance(user.wallet);
                  const joined = formatDate(user.createdAt);
                  const isSelf = currentUserId != null && user.id === currentUserId;

                  return (
                    <tr key={user.id} className="transition hover:bg-gray-100/30 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-500">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                              {displayName}
                              {isSelf && (
                                <span className="rounded-full bg-gray-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-normal text-gray-700 dark:text-zinc-300">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">{displayEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            role === "ADMIN"
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                          <Wallet size={14} className="text-gray-400 dark:text-zinc-500" />
                          {formatCurrency(balance)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {joined}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Toggle Role */}
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={actionLoading === user.id || isSelf}
                            className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-orange-500/10 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              isSelf
                                ? "You can't change your own role"
                                : role === "ADMIN"
                                ? "Demote to User"
                                : "Promote to Admin"
                            }
                          >
                            {actionLoading === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : role === "ADMIN" ? (
                              <ShieldOff size={16} />
                            ) : (
                              <Shield size={16} />
                            )}
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user.id || isSelf}
                            className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              isActive
                                ? "text-gray-500 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                                : "text-gray-500 dark:text-zinc-400 hover:bg-green-500/10 hover:text-green-400"
                            }`}
                            title={isSelf ? "You can't suspend your own account" : isActive ? "Suspend" : "Activate"}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isActive ? (
                              <Ban size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
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
              {Math.min(page * limit, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* User Details Modal */}
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}