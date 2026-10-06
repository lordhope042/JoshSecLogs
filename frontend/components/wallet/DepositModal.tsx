"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

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
  const phoneRef = useRef<HTMLInputElement>(null);

  const banksWithoutAccount = BANKS.filter(
    (b) => !accounts.some((a) => a.bank === b.value),
  );

  // Reset the form each time the modal opens
  useEffect(() => {
    if (open) {
      setPhone("");
      if (banksWithoutAccount.length > 0) {
        setSelectedBank(banksWithoutAccount[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on Escape (unless an account is being generated)
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !creating) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, creating, onClose]);

  // Focus the phone field once the form is visible
  useEffect(() => {
    if (open && !loading && banksWithoutAccount.length > 0) {
      phoneRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  if (!open) return null;

  const phoneValid = /^0\d{10}$/.test(phone.trim());
  const noBanksLeft = !loading && banksWithoutAccount.length === 0;

  function submitCreate() {
    if (!phoneValid || creating) return;
    onCreateAccount(selectedBank, phone.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        // Only a click on the backdrop itself closes the modal
        if (e.target === e.currentTarget && !creating) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-modal-title"
        className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20 dark:border-slate-800 dark:bg-[#0a1725] sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id="deposit-modal-title"
            className="text-lg font-bold text-zinc-900 dark:text-white"
          >
            {accounts.length === 0
              ? "Get your deposit account"
              : "Add another bank"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-slate-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : noBanksLeft ? (
          <div className="py-4">
            <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              You already have a deposit account for every supported bank.
              Copy your account numbers from the wallet page.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              We&apos;ll generate a permanent account number. Transfer any
              amount to it anytime and your wallet updates automatically.
            </p>

            <fieldset className="mb-4" disabled={creating}>
              <legend className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Bank
              </legend>

              <div className="grid grid-cols-2 gap-2">
                {banksWithoutAccount.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    aria-pressed={selectedBank === b.value}
                    onClick={() => setSelectedBank(b.value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                      selectedBank === b.value
                        ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "border-slate-200 text-slate-600 hover:border-orange-400 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mb-6">
              <label
                htmlFor="deposit-phone"
                className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
              >
                Phone number
              </label>

              <input
                id="deposit-phone"
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitCreate();
                }}
                placeholder="e.g. 08012345678"
                disabled={creating}
                aria-invalid={phone.length > 0 && !phoneValid}
                aria-describedby={
                  phone.length > 0 && !phoneValid ? "deposit-phone-error" : undefined
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-white/[0.03] dark:text-white"
              />

              {phone.length > 0 && !phoneValid && (
                <p
                  id="deposit-phone-error"
                  className="mt-1.5 text-xs text-red-500"
                >
                  Enter an 11-digit number starting with 0.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={creating}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitCreate}
                disabled={!phoneValid || creating}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                {creating ? "Generating…" : "Generate account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
