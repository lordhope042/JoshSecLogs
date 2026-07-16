"use client";

import { useState } from "react";
import { User, Lock, Bell, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // TODO: wire to real API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

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
              <Save size={16} />
              {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}