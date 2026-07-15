"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Calendar,
  BadgeCheck,
  KeyRound,
} from "lucide-react";

import {
  getMyPurchases,
  getPurchasedSocialLog,
} from "@/services/socialLogs";

import type { SocialLog, PurchasedSocialLog } from "@/types/social-log";

const money = (price?: string | number) =>
  `₦${Number(price ?? 0).toLocaleString()}`;

// Builds the single "Label: value || Label: value || ..." description
// string the owner wants, instead of separate rows per field. Only
// fields that actually have a value get included.
function buildLogDescription(log: PurchasedSocialLog): string {
  const parts: string[] = [];

  if (log.loginEmail) parts.push(`Email: ${log.loginEmail}`);
  if (log.loginPhone) parts.push(`Phone: ${log.loginPhone}`);
  if (log.password) parts.push(`Password: ${log.password}`);
  if (log.twoFactorSecret) parts.push(`2FA: ${log.twoFactorSecret}`);
  if (log.recoveryEmail) parts.push(`Recovery Email: ${log.recoveryEmail}`);

  if (log.backupCodes && log.backupCodes.length > 0) {
    parts.push(`Backup Codes: ${log.backupCodes.join(", ")}`);
  }

  if (log.cookies) {
    const cookieStr =
      typeof log.cookies === "string"
        ? log.cookies
        : JSON.stringify(log.cookies);
    parts.push(`Cookies: ${cookieStr}`);
  }

  return parts.join(" || ");
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
          DETAIL MODAL
  =============================== */

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<PurchasedSocialLog | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadPurchases() {
    try {
      const data = await getMyPurchases();
      setPurchases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  async function openDetail(id: string) {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelected(null);
    setRevealed(false);

    try {
      const data = await getPurchasedSocialLog(id);
      setSelected(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setSelected(null);
    setRevealed(false);
  }

  async function copyDescription(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Purchases</h1>
        <p className="text-zinc-400">Accounts you've bought</p>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#0f172a] p-10 text-center text-zinc-500">
          You haven't purchased any accounts yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((log) => (
            <div
              key={log.id}
              className="group overflow-hidden rounded-3xl border border-zinc-800 bg-[#0f172a] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl"
            >
              {/* Cover */}
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500">
                <span className="text-5xl font-black text-white">
                  {log.platform.charAt(0)}
                </span>

                <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {log.platform}
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold text-white">
                  <BadgeCheck size={13} />
                  Owned
                </div>
              </div>

              {/* Body */}
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="truncate text-lg font-bold text-white">
                    @{log.username}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{log.country}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                  {log.purchasedAt && (
                    <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1">
                      <Calendar size={12} />
                      {new Date(log.purchasedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                  <div>
                    <p className="text-xs text-zinc-500">Paid</p>
                    <p className="text-xl font-bold text-orange-400">
                      {money(log.price)}
                    </p>
                  </div>

                  <button
                    onClick={() => openDetail(log.id)}
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
                  >
                    <KeyRound size={15} />
                    View Login
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL / CREDENTIALS MODAL — single description-style block */}

      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeDetail}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-[#0f172a] p-6"
          >
            {detailLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            )}

            {!detailLoading && selected && (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      @{selected.username}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {selected.platform} · {selected.country}
                    </p>
                  </div>

                  <button
                    onClick={closeDetail}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-3 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400">
                  These credentials belong to you. Keep them private — anyone
                  with this info can access the account.
                </div>

                <div className="mt-5">
                  {(() => {
                    const description = buildLogDescription(selected);

                    if (!description) {
                      return (
                        <p className="py-6 text-center text-sm text-zinc-500">
                          No credentials found for this account. Contact
                          support if this looks wrong.
                        </p>
                      );
                    }

                    return (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium text-zinc-500">
                            Account Details
                          </p>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setRevealed((r) => !r)}
                              title={revealed ? "Hide" : "Show"}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            >
                              {revealed ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>

                            <button
                              onClick={() => copyDescription(description)}
                              title="Copy all"
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            >
                              {copied ? (
                                <Check size={15} className="text-green-400" />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="whitespace-pre-wrap break-all font-mono text-sm leading-6 text-zinc-200">
                          {revealed
                            ? description
                            : "•".repeat(Math.min(description.length, 80))}
                        </p>
                      </div>
                    );
                  })()}

                  {selected.notes && (
                    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <p className="mb-1 text-xs font-medium text-zinc-500">
                        Notes
                      </p>
                      <p className="text-sm text-zinc-200">
                        {selected.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeDetail}
                    className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
