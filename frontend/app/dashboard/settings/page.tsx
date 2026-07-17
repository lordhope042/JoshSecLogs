"use client";

import { useEffect, useState } from "react";
import { User, Lock, Bell, Shield, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

/* ===============================
   Types
=============================== */

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
}

interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

/* ===============================
   Service calls
   Adjust paths/payload shape to match your actual DTOs —
   I only have /api/v1/auth/me (GET) confirmed from your route log.
   PATCH endpoints below are my best-guess REST convention;
   swap them for the real paths if they differ.
=============================== */

async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get("/auth/me");
  const user = data.data ?? data;
  return {
    fullName: user.fullName ?? user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
  };
}

async function updateProfile(payload: UserProfile) {
  const { data } = await api.patch("/auth/me", payload);
  return data.data ?? data;
}

async function updatePassword(payload: { current: string; next: string }) {
  const { data } = await api.patch("/auth/me/password", {
    currentPassword: payload.current,
    newPassword: payload.next,
  });
  return data.data ?? data;
}

async function updateNotifications(payload: NotificationPrefs) {
  const { data } = await api.patch("/auth/me/notifications", payload);
  return data.data ?? data;
}

/* ===============================
   Page
=============================== */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
  });

  /* ── Load current user on mount ── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchMe();
        if (!cancelled) setProfile(data);
      } catch (err: any) {
        if (err?.response?.status === 401) return; // handled by interceptor
        toast.error(err?.response?.data?.message ?? "Failed to load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Save handlers, one per tab ── */

  const handleSaveProfile = async () => {
    if (!profile.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!profile.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile(profile);
      toast.success("Profile updated.");
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!password.current) {
      toast.error("Enter your current password.");
      return;
    }
    if (password.next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (password.next !== password.confirm) {
      toast.error("New password and confirmation don't match.");
      return;
    }

    try {
      setSaving(true);
      await updatePassword({ current: password.current, next: password.next });
      toast.success("Password changed.");
      setPassword({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await updateNotifications(notifications);
      toast.success("Notification preferences saved.");
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "profile") return handleSaveProfile();
    if (activeTab === "security") return handleSavePassword();
    return handleSaveNotifications();
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your account, security, and notification preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="md:w-56 shrink-0">
          <div className="bg-[#0B1220] border border-zinc-800 rounded-xl p-2 flex md:flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#0B1220] border border-zinc-800 rounded-xl p-6">
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-medium mb-4">Profile information</h2>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Full name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Phone number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  placeholder="+234..."
                />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Shield size={18} className="text-orange-500" />
                Change password
              </h2>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Current password</label>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">New password</label>
                <input
                  type="password"
                  value={password.next}
                  onChange={(e) => setPassword({ ...password, next: e.target.value })}
                  className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  className="w-full bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-medium mb-4">Notification preferences</h2>
              {[
                { key: "email" as const, label: "Email notifications" },
                { key: "sms" as const, label: "SMS notifications" },
                { key: "orderUpdates" as const, label: "Order status updates" },
                { key: "promotions" as const, label: "Promotions & offers" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between bg-[#0f172a] border border-zinc-800 rounded-lg px-4 py-3"
                >
                  <span className="text-sm text-zinc-200">{item.label}</span>
                  <button
                    onClick={() =>
                      setNotifications({ ...notifications, [item.key]: !notifications[item.key] })
                    }
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${
                      notifications[item.key] ? "bg-orange-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        notifications[item.key] ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
