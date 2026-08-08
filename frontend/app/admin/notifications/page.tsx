"use client";

// Suggested path: app/admin/notifications/page.tsx
// Adjust the import paths below (@/lib/axios, @/components/ui/*) if your
// project structure differs.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Bell, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface Notification {
  id: string;
  title: string;
  message: string;
  active: boolean;
  telegramUrl?: string | null;
  whatsappUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationFormData {
  title: string;
  message: string;
  active: boolean;
  telegramUrl: string;
  whatsappUrl: string;
}

const EMPTY_FORM: NotificationFormData = {
  title: "",
  message: "",
  active: true,
  telegramUrl: "",
  whatsappUrl: "",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NotificationFormData>({ defaultValues: EMPTY_FORM });

  async function loadNotifications() {
    setLoading(true);
    try {
      // NOTE: the shared axios instance's response interceptor already
      // unwraps `response.data`, so `res` here IS the array directly —
      // not `{ data: [...] }`. Do not destructure `.data` off of it again.
      const res = await api.get("/notifications");
      setNotifications((res as unknown as Notification[]) ?? []);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    reset(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(n: Notification) {
    setEditingId(n.id);
    reset({
      title: n.title,
      message: n.message,
      active: n.active,
      telegramUrl: n.telegramUrl ?? "",
      whatsappUrl: n.whatsappUrl ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    reset(EMPTY_FORM);
  }

  async function onSubmit(data: NotificationFormData) {
    const payload = {
      title: data.title,
      message: data.message,
      active: data.active,
      telegramUrl: data.telegramUrl || undefined,
      whatsappUrl: data.whatsappUrl || undefined,
    };

    try {
      if (editingId) {
        await api.patch(`/notifications/${editingId}`, payload);
        toast.success("Notification updated.");
      } else {
        await api.post("/notifications", payload);
        toast.success("Notification created.");
      }
      closeForm();
      loadNotifications();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Something went wrong.",
      );
    }
  }

  async function toggleActive(n: Notification) {
    setBusyId(n.id);
    try {
      await api.patch(`/notifications/${n.id}`, { active: !n.active });
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, active: !item.active } : item,
        ),
      );
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteNotification(id: string) {
    if (!confirm("Delete this notification? This can't be undone.")) return;
    setBusyId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Bell className="h-6 w-6 text-orange-500" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            The newest active notification shows to every user on login.
            First-time users see it as a "welcome" card; everyone else
            sees the same content as a "welcome back" card — the layout
            adapts automatically, nothing to configure here.
          </p>
        </div>

        <Button
          onClick={openCreateForm}
          className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-semibold text-white hover:from-orange-600 hover:to-orange-500"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Notification
        </Button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 space-y-4 rounded-2xl border border-orange-500/20 bg-gray-50 p-5 dark:bg-[#0b1220]"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {editingId ? "Edit Notification" : "New Notification"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Title
            </label>
            <input
              {...register("title", { required: true })}
              placeholder="e.g. Welcome to JoshSecLogs"
              className="w-full rounded-xl border border-zinc-700 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:bg-[#111827] dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Message
            </label>
            <textarea
              {...register("message", { required: true })}
              rows={3}
              placeholder="What should users see when they log in?"
              className="w-full resize-none rounded-xl border border-zinc-700 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:bg-[#111827] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Telegram link
              </label>
              <input
                {...register("telegramUrl")}
                placeholder="https://t.me/yourchannel"
                className="w-full rounded-xl border border-zinc-700 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:bg-[#111827] dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                WhatsApp link
              </label>
              <input
                {...register("whatsappUrl")}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full rounded-xl border border-zinc-700 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:bg-[#111827] dark:text-white"
              />
            </div>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
            <input
              type="checkbox"
              {...register("active")}
              className="accent-orange-500"
            />
            Active
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              className="h-9 rounded-lg px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-sm font-semibold text-white hover:from-orange-600 hover:to-orange-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-zinc-400">
          No notifications yet. Create one to greet users on their next login.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0b1220]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {n.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        n.active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-gray-500/10 text-gray-500 dark:text-zinc-400"
                      }`}
                    >
                      {n.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">
                    {n.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-zinc-600">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleActive(n)}
                    disabled={busyId === n.id}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    {n.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEditForm(n)}
                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-orange-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    disabled={busyId === n.id}
                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-500/10"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}