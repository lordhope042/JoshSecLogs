"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Users, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Referral {
  id: string;
  name: string;
  joinedAt: string;
  status: "active" | "pending";
  earnings: number;
}

interface ReferralData {
  referralCode: string | null;
  referredUsers: Referral[];
  totalEarnings: number;
  activeCount: number;
}

async function fetchReferrals(): Promise<ReferralData> {
  const { data } = await api.get("/auth/me/referrals");
  return data.data ?? data;
}

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchReferrals();
        if (!cancelled) setReferralData(data);
      } catch (err: any) {
        if (err?.response?.status === 401) return; // handled by interceptor
        toast.error(err?.response?.data?.message ?? "Failed to load referral data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const referralLink = referralData?.referralCode
    ? `https://joshseclogs.com/register?ref=${referralData.referralCode}`
    : null;

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    );
  }

  const referrals = referralData?.referredUsers ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Referrals</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
          Invite friends and earn rewards when they join JoshSecLogs.
        </p>
      </div>

      {/* Referral link card */}
      <div className="bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-2">Your referral link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-zinc-200 truncate">
            {referralLink ?? "No referral code assigned yet"}
          </div>
          <button
            onClick={handleCopy}
            disabled={!referralLink}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Active referrals</p>
            <p className="text-xl font-semibold">{referralData?.activeCount ?? 0}</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Total earned</p>
            <p className="text-xl font-semibold">
              ₦{(referralData?.totalEarnings ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Referral list */}
      <div className="bg-gray-50 dark:bg-[#0B1220] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-zinc-800">
          <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Your referrals</p>
        </div>
        {referrals.length === 0 ? (
          <div className="p-6 text-center text-gray-400 dark:text-zinc-500 text-sm">
            No referrals yet. Share your link to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-zinc-800">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">
                    Joined {new Date(r.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-200/50 dark:bg-zinc-700/50 text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    {r.status}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-zinc-300 mt-1">
                    ₦{r.earnings.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}