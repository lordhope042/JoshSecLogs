"use client";

import { useState } from "react";
import { Copy, Check, Users, Wallet } from "lucide-react";

const REFERRAL_CODE = "JSL-4X92QP"; // TODO: replace with dynamic user referral code
const REFERRAL_LINK = `https://joshseclogs.com/signup?ref=${REFERRAL_CODE}`;

interface Referral {
  id: string;
  name: string;
  joinedAt: string;
  status: "active" | "pending";
  earnings: number;
}

const mockReferrals: Referral[] = [
  { id: "1", name: "Ade B.", joinedAt: "2026-07-10", status: "active", earnings: 500 },
  { id: "2", name: "Chioma N.", joinedAt: "2026-07-08", status: "active", earnings: 500 },
  { id: "3", name: "Tunde K.", joinedAt: "2026-07-14", status: "pending", earnings: 0 },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = mockReferrals.reduce((sum, r) => sum + r.earnings, 0);
  const activeCount = mockReferrals.filter((r) => r.status === "active").length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Referrals</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Invite friends and earn rewards when they join JoshSecLogs.
        </p>
      </div>

      {/* Referral link card */}
      <div className="bg-[#0B1220] border border-zinc-800 rounded-xl p-5">
        <p className="text-sm text-zinc-400 mb-2">Your referral link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#0f172a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 truncate">
            {REFERRAL_LINK}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0B1220] border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Active referrals</p>
            <p className="text-xl font-semibold">{activeCount}</p>
          </div>
        </div>
        <div className="bg-[#0B1220] border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded-lg">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Total earned</p>
            <p className="text-xl font-semibold">₦{totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Referral list */}
      <div className="bg-[#0B1220] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-sm font-medium text-zinc-300">Your referrals</p>
        </div>
        {mockReferrals.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-sm">
            No referrals yet. Share your link to get started.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {mockReferrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-zinc-500">Joined {r.joinedAt}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-zinc-700/50 text-zinc-400"
                    }`}
                  >
                    {r.status}
                  </span>
                  <p className="text-sm text-zinc-300 mt-1">₦{r.earnings.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}