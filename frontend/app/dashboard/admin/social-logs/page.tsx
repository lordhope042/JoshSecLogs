"use client";

import { useEffect } from "react";

import { Plus } from "lucide-react";

import { useAdminSocialLogs } from "@/hooks/useAdminSocialLogs";

import SocialLogTable from "@/components/admin/social-logs/SocialLogTable";

export default function AdminSocialLogsPage() {
  const {
    logs,

    loading,

    load,
  } = useAdminSocialLogs();

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Social Logs
          </h1>

          <p className="text-gray-500">
            Manage marketplace accounts
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white">

          <Plus size={18} />

          Add Account

        </button>

      </div>
<SocialLogTable
    logs={logs}
    loading={loading}
    onEdit={(log) => {
        // open edit modal
    }}
    onDelete={(log) => {
        // open delete dialog
    }}
/>
    </div>
  );
}