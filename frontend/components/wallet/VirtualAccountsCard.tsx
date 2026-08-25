"use client";

import { useState } from "react";
import { Copy, Check, Landmark, Plus, Loader2 } from "lucide-react";

import type { VirtualAccount } from "@/services/payments";

interface VirtualAccountsCardProps {
  accounts: VirtualAccount[];
  loading: boolean;
  onAddBank: () => void;
}

const BANK_LABEL: Record<string, string> = {
  "9psb": "9PSB",
  kuda: "Kuda",
};

export default function VirtualAccountsCard({
  accounts,
  loading,
  onAddBank,
}: VirtualAccountsCardProps) {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  async function copyAccountNumber(bank: string, accountNumber: string) {
    await navigator.clipboard.writeText(accountNumber);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 1500);
  }

  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1322] dark:shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Your Deposit Accounts
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Transfer any amount here, anytime — your wallet updates
            automatically.
          </p>
        </div>

        {accounts.length > 0 && accounts.length < 2 && !loading && (
          <button
            type="button"
            onClick={onAddBank}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 sm:flex dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <Plus size={14} />
            Add Bank
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-emerald-500" />
        </div>
      ) : accounts.length === 0 ? (
        <button
          type="button"
          onClick={onAddBank}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-500/5 dark:border-white/15"
        >
          <Landmark size={22} className="text-zinc-400 dark:text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Generate your deposit account number
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Tap to get started
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <Landmark size={13} />
                {BANK_LABEL[account.bank] ?? account.bank}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xl font-bold tracking-wide text-zinc-900 dark:text-white">
                    {account.accountNumber}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {account.accountName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyAccountNumber(account.bank, account.accountNumber)
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600"
                  title="Copy account number"
                >
                  {copiedBank === account.bank ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}

          {accounts.length < 2 && (
            <button
              type="button"
              onClick={onAddBank}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition hover:border-emerald-400 hover:text-emerald-500 dark:border-white/15 dark:text-zinc-400"
            >
              <Plus size={15} />
              Add another bank
            </button>
          )}
        </div>
      )}
    </div>
  );
}
