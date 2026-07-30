"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Key,
  Plus,
  Trash2,
  Power,
  Copy,
  Check,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";

interface ApiKey {
  id: string;
  key: string;
  active: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyId, setNewKeyId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string>("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api-keys");
      const list = data.data ?? data;
      setKeys(Array.isArray(list) ? list : []);
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async () => {
    try {
      setCreating(true);
      const { data } = await api.post("/api-keys", {});
      const result = data.data ?? data;
      setNewKeyId(result.id);
      setNewKeyValue(result.key);
      setShowNewKey(true);
      toast.success("API key created!");
      loadKeys();
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to create API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/api-keys/${id}/toggle`);
      toast.success("API key status updated.");
      loadKeys();
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to update key.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this API key? This cannot be undone.")) {
      return;
    }
    try {
      await api.delete(`/api-keys/${id}`);
      toast.success("API key deleted.");
      loadKeys();
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      toast.error(err?.response?.data?.message ?? "Failed to delete key.");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Key className="text-orange-500" size={24} />
            API Keys
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Generate and manage API keys for programmatic access to JoshSecLogs.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {creating ? "Creating..." : "Generate New Key"}
        </button>
      </div>

      {/* New key banner */}
      {newKeyId && (
        <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
              <Key className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Your new API key</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-zinc-400">
                Copy this key now — it will only be shown in full this one time. After you close this banner, only a masked version will be visible.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-orange-500/20 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm font-mono text-gray-900 dark:text-white break-all">
                  {showNewKey ? newKeyValue : "••••••••••••••••••••••••••••••••"}
                </code>
                <button
                  onClick={() => setShowNewKey(!showNewKey)}
                  className="rounded-lg border border-gray-200 dark:border-zinc-700 p-2 text-gray-500 hover:text-orange-500 transition"
                >
                  {showNewKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyKey(newKeyValue)}
                  className="rounded-lg border border-gray-200 dark:border-zinc-700 p-2 text-gray-500 hover:text-orange-500 transition"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <button
                onClick={() => {
                  setNewKeyId(null);
                  setNewKeyValue("");
                }}
                className="mt-3 text-xs text-orange-500 hover:text-orange-600 transition"
              >
                I&apos;ve copied my key — dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-[#0B1220] p-4">
        <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
        <div>
          <p className="text-sm text-gray-700 dark:text-zinc-300">
            Use your API key to authenticate requests to the JoshSecLogs REST API.
          </p>
          <Link
            href="/api-docs"
            className="mt-1 inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition"
          >
            View API Documentation
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#0B1220] p-12 text-center">
          <Key className="mx-auto text-gray-400 dark:text-zinc-600" size={40} />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No API keys yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Generate your first API key to start integrating with the JoshSecLogs API.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Generate Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-[#0B1220] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                <Key className="h-5 w-5 text-orange-500" />
              </div>

              <div className="flex-1 min-w-0">
                <code className="block text-sm font-mono text-gray-900 dark:text-white truncate">
                  {key.key}
                </code>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-500">
                  Created {formatDate(key.createdAt)}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                  key.active
                    ? "bg-green-500/10 text-green-500"
                    : "bg-gray-500/10 text-gray-500"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${key.active ? "bg-green-500" : "bg-gray-400"}`} />
                {key.active ? "Active" : "Inactive"}
              </span>

              <button
                onClick={() => handleToggle(key.id)}
                title={key.active ? "Deactivate" : "Activate"}
                className="rounded-lg border border-gray-200 dark:border-zinc-700 p-2 text-gray-500 hover:text-orange-500 transition"
              >
                <Power size={16} />
              </button>

              <button
                onClick={() => handleDelete(key.id)}
                title="Delete"
                className="rounded-lg border border-gray-200 dark:border-zinc-700 p-2 text-gray-500 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
