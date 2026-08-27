"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

import type { PocketFiBank, VirtualAccount } from "@/services/payments";

interface DepositModalProps {
  open: boolean;
  accounts: VirtualAccount[];
  loading: boolean;
  creating: boolean;
  onClose: () => void;
  onCreateAccount: (bank: PocketFiBank, phone: string) => void;
}

const BANKS: { value: PocketFiBank; label: string }[] = [
  { value: "kuda", label: "Kuda" },
  { value: "safeheaven", label: "SafeHaven" },
];

export default function DepositModal({
  open,
  accounts,
  loading,
  creating,
  onClose,
  onCreateAccount,
}: DepositModalProps) {
  const [phone, setPhone] = useState("");
  const [selectedBank, setSelectedBank] = useState<PocketFiBank>("kuda");

  const banksWithoutAccount = BANKS.filter(
    (b) => !accounts.some((a) => a.bank === b.value),
  );

  useEffect(() => {
    if (open) {
      setPhone("");
      if (banksWithoutAccount.length > 0) {
        setSelectedBank(banksWithoutAccount[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const phoneValid = /^0\d{10}$/.test(phone.trim());
  const noBanksLeft = !loading && banksWithoutAccount.length === 0;

  function submitCreate() {
    if (!phoneValid || creating) return;
    onCreateAccount(selectedBank, phone.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0B1322]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            {accounts.length === 0
              ? "Generate Deposit Account"
              : "Add Another Bank"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : noBanksLeft ? (
          <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            You already have a deposit account for every supported bank.
            You can see and copy your account numbers on the wallet page.
          </p>
        ) : (
          <>
            <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
              We&apos;ll generate a permanent account number — transfer
              any amount to it anytime and your wallet updates
              automatically.
            </p>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Bank
              </label>

              <div className="grid grid-cols-2 gap-2">
                {banksWithoutAccount.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setSelectedBank(b.value)}
                    disabled={creating}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                      selectedBank === b.value
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-zinc-200 text-zinc-600 hover:border-orange-400 dark:border-white/10 dark:text-zinc-300"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Phone number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 09029163518"
                disabled={creating}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />

              {phone.length > 0 && !phoneValid && (
                <p className="mt-1 text-xs text-red-500">
                  Enter an 11-digit number starting with 0.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={creating}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitCreate}
                disabled={!phoneValid || creating}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                {creating ? "Generating…" : "Generate Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}