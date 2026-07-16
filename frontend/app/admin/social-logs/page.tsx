"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Users,
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import AdminStatCard from "@/components/admin/AdminStatCard";
import SocialLogFilters from "@/components/admin/social-logs/SocialLogFilters";
import SocialLogForm from "@/components/admin/social-logs/SocialLogForm";
import SocialLogsTable from "@/components/admin/social-logs/SocialLogTable";
import { createSocialLog, deleteSocialLog, getSocialLogs, markSoldSocialLog, updateSocialLog } from "@/services/socialLogs";
import type { CreateSocialLogDto, SocialLog, SocialLogFilters as FilterType, UpdateSocialLogDto } from "@/types/social-log";
/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */

function normalizeStatus(status: string | undefined | null): string {
  return (status ?? "").toString().toUpperCase().trim();
}

function formatCurrency(value: number): string {
  if (isNaN(value) || value === 0) return "₦0";
  return `₦${value.toLocaleString("en-NG")}`;
}

/* ───────────────────────────────────────────
   Page
   ─────────────────────────────────────────── */

export default function AdminSocialLogsPage() {
  const [logs, setLogs] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({});
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<SocialLog | null>(null);

  /* ===============================
        MARK SOLD MODAL
  =============================== */
  const [markingSold, setMarkingSold] = useState<SocialLog | null>(null);
  const [buyerIdInput, setBuyerIdInput] = useState("");
  const [submittingSold, setSubmittingSold] = useState(false);

  /* ── Load Data ── */
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSocialLogs();
      // Ensure we always have an array
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load social logs.";
      toast.error(msg);
      setLogs([]); // Prevent undefined crashes
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  /* ── Stats (safe, case-insensitive) ── */
  const stats = useMemo(() => {
    const total = logs.length;
    const available = logs.filter(
      (log) => normalizeStatus(log.status) === "AVAILABLE"
    ).length;
    const sold = logs.filter(
      (log) => normalizeStatus(log.status) === "SOLD"
    ).length;
    const revenue = logs
      .filter((log) => normalizeStatus(log.status) === "SOLD")
      .reduce((sum, log) => sum + (Number(log.price) || 0), 0);

    return { total, available, sold, revenue };
  }, [logs]);

  /* ── Filtered & Sorted Logs ── */
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filters.search) {
      const keyword = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.username?.toLowerCase().includes(keyword) ||
          log.platform?.toLowerCase().includes(keyword) ||
          log.country?.toLowerCase().includes(keyword)
      );
    }

    if (filters.platform) {
      result = result.filter((log) => log.platform === filters.platform);
    }

    // Category filter — independent of platform, since Facebook alone
    // spans two categories (FACEBOOK_PAGE / FACEBOOK_COUNTRY).
    if (filters.category) {
      result = result.filter((log) => log.category === filters.category);
    }

    if (filters.status) {
      result = result.filter(
        (log) => normalizeStatus(log.status) === normalizeStatus(filters.status)
      );
    }

    if (filters.country) {
      const keyword = filters.country.toLowerCase();
      result = result.filter((log) =>
        log.country?.toLowerCase().includes(keyword)
      );
    }

    switch (filters.sort) {
      case "price_desc":
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "price_asc":
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "followers_desc":
        result.sort((a, b) => (Number(b.followers) || 0) - (Number(a.followers) || 0));
        break;
      case "followers_asc":
        result.sort((a, b) => (Number(a.followers) || 0) - (Number(b.followers) || 0));
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime()
        );
        break;
      default:
        // Default: newest first
        result.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
    }

    return result;
  }, [logs, filters]);

  /* ── Handlers ── */

  const handleCreate = useCallback(
    async (values: CreateSocialLogDto) => {
      try {
        await createSocialLog(values);
        toast.success("Social log created successfully.");
        setOpenForm(false);
        await loadLogs();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Failed to create social log.";
        toast.error(msg);
      }
    },
    [loadLogs]
  );

  const handleUpdate = useCallback(
    async (values: CreateSocialLogDto) => {
      if (!editing) return;

      const updateData: UpdateSocialLogDto = { ...values };

      try {
        await updateSocialLog(editing.id, updateData);
        toast.success("Social log updated successfully.");
        setEditing(null);
        setOpenForm(false);
        await loadLogs();
      } catch (err: any) {
        if (err.response?.status === 401) return; // Handled by interceptor
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Failed to update social log.";
        toast.error(msg);
      }
    },
    [editing, loadLogs]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this social log? This action cannot be undone."))
        return;
      try {
        await deleteSocialLog(id);
        toast.success("Social log deleted.");
        await loadLogs();
      } catch (err: any) {
        if (err.response?.status === 401) return;
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Failed to delete social log.";
        toast.error(msg);
      }
    },
    [loadLogs]
  );

  const openMarkSold = useCallback((log: SocialLog) => {
    setMarkingSold(log);
    setBuyerIdInput("");
  }, []);

  const closeMarkSold = useCallback(() => {
    setMarkingSold(null);
    setBuyerIdInput("");
  }, []);

  const handleMarkSold = useCallback(async () => {
    if (!markingSold) return;
    const buyerId = buyerIdInput.trim();
    if (!buyerId) {
      toast.error("Enter a buyer ID to continue.");
      return;
    }
    try {
      setSubmittingSold(true);
      await markSoldSocialLog(markingSold.id, buyerId);
      toast.success(`@${markingSold.username} marked as sold.`);
      closeMarkSold();
      await loadLogs();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to mark social log as sold.";
      toast.error(msg);
    } finally {
      setSubmittingSold(false);
    }
  }, [markingSold, buyerIdInput, loadLogs, closeMarkSold]);

  /* ── Edit Form Data ── */
  const editData = editing
    ? {
        platform: editing.platform,
        category: editing.category,
        pageType: editing.pageType ?? undefined,
        country: editing.country ?? undefined,
        username: editing.username,
        age: editing.age,
        followers: editing.followers ?? undefined,
        price: editing.price,
        emailAttached: editing.emailAttached,
        phoneAttached: editing.phoneAttached,
        twoFactor: editing.twoFactor,
        ogEmail: editing.ogEmail,
        verified: editing.verified,
        description: editing.description ?? undefined,
        image: editing.image ?? undefined,
      }
    : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Logs</h1>
          <p className="text-gray-500">
            Manage marketplace social media accounts.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 active:scale-95"
        >
          <Plus size={18} />
          Add Social Log
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total Logs"
          value={stats.total}
          icon={<Users size={24} />}
          color="blue"
        />
        <AdminStatCard
          title="Available"
          value={stats.available}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <AdminStatCard
          title="Sold"
          value={stats.sold}
          icon={<XCircle size={24} />}
          color="orange"
        />
        <AdminStatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={<span className="text-2xl font-bold">₦</span>}
          color="purple"
        />
      </div>

      {/* Filters */}
      <SocialLogFilters
        filters={filters}
        onChange={(value) => setFilters((prev) => ({ ...prev, ...value }))}
      />

      {/* Table */}
      <SocialLogsTable
        logs={filteredLogs}
        loading={loading}
        onEdit={(log) => {
          setEditing(log);
          setOpenForm(true);
        }}
        onDelete={handleDelete}
        onMarkSold={openMarkSold}
      />

      {/* Empty State (when not loading and no results) */}
      {!loading && filteredLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16">
          <Users size={48} className="text-zinc-600" />
          <p className="mt-4 text-lg font-medium text-zinc-400">
            No social logs found
          </p>
          <p className="text-sm text-zinc-500">
            {filters.search ||
            filters.platform ||
            filters.category ||
            filters.status ||
            filters.country
              ? "Try adjusting your filters."
              : "Get started by adding a new social log."}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editing ? "Edit Social Log" : "Create Social Log"}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {editing
                    ? "Update the selected social account."
                    : "Fill in the information below to create a new social account."}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditing(null);
                  setOpenForm(false);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-xl text-zinc-400 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="bg-zinc-900 p-8">
              <SocialLogForm
                initialData={editData}
                onSubmit={editing ? handleUpdate : handleCreate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mark Sold Modal */}
      {markingSold && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={closeMarkSold}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Mark as Sold
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  @{markingSold.username} · {markingSold.platform}
                </p>
              </div>
              <button
                onClick={closeMarkSold}
                className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Buyer User ID
              </label>
              <input
                type="text"
                value={buyerIdInput}
                onChange={(e) => setBuyerIdInput(e.target.value)}
                placeholder="Enter the buyer's user ID"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-orange-500"
              />
              <p className="mt-2 text-xs text-zinc-500">
                This manually assigns the account to a user outside of the
                normal purchase flow.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeMarkSold}
                disabled={submittingSold}
                className="rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkSold}
                disabled={submittingSold}
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {submittingSold && <Loader2 size={16} className="animate-spin" />}
                {submittingSold ? "Marking…" : "Confirm Sold"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
