"use client";

import { useState } from "react";
import { Check, Copy, Landmark, Plus } from "lucide-react";

import type { VirtualAccount } from "@/services/payments";

interface VirtualAccountsCardProps {
  accounts: VirtualAccount[];
  loading: boolean;
  onAddBank: () => void;
}

// Both spellings are mapped: the deposit modal uses "safeheaven" while the
// old label table here used "saveheaven", so SafeHaven rows showed the raw key.
const BANK_LABEL: Record<string, string> = {
  safeheaven: "SafeHaven",
  saveheaven: "SafeHaven",
  kuda: "Kuda",
};

const MAX_BANKS = 2;

function bankLabel(bank: string) {
  return BANK_LABEL[bank?.toLowerCase()] ?? bank;
}

export default function VirtualAccountsCard({
  accounts,
  loading,
  onAddBank,
}: VirtualAccountsCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyAccountNumber(id: string, accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard can be blocked (insecure origin / permissions); fail quietly.
      setCopiedId(null);
    }
  }

  const canAddMore = accounts.length > 0 && accounts.length < MAX_BANKS;

  return (
    <section
      aria-label="Deposit accounts"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0a1725] dark:shadow-none"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Deposit accounts
        </h2>

        <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Send any amount to these accounts, anytime. Your wallet updates
          automatically.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]"
            />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <button
          type="button"
          onClick={onAddBank}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center transition hover:border-orange-400 hover:bg-orange-500/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 dark:border-slate-700"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
            <Landmark size={20} />
          </span>

          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Get your deposit account number
          </span>

          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Takes a few seconds. You only need your phone number.
          </span>
        </button>
      ) : (
        <ul className="space-y-3">
          {accounts.map((account) => {
            const copied = copiedId === account.id;
            const label = bankLabel(account.bank);

            return (
              <li
                key={account.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/70 dark:bg-white/[0.03]"
              >
                <div
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-base font-black text-orange-500"
                >
                  {label.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {label}
                  </p>

                  <p className="mt-0.5 font-mono text-xl font-bold tracking-wider text-zinc-900 tabular-nums dark:text-white">
                    {account.accountNumber}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {account.accountName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyAccountNumber(account.id, account.accountNumber)
                  }
                  aria-label={`Copy ${label} account number`}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
                </button>
              </li>
            );
          })}

          {canAddMore && (
            <li>
              <button
                type="button"
                onClick={onAddBank}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-orange-400 hover:text-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 dark:border-slate-700 dark:text-slate-400"
              >
                <Plus size={15} />
                Add another bank
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
