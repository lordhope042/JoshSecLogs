"use client";

import { useEffect, useMemo, useState } from "react";

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
  MapPin,
  Users,
} from "lucide-react";

import {
  getMyPurchases,
  getPurchasedSocialLog,
} from "@/services/socialLogs";

import { CATEGORY_LABELS, PAGE_TYPE_LABELS } from "@/components/social-logs/SocialLogCard";

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

/*
=====================================
BATCH GROUPING
Buying N units in one "buy N" action on the marketplace creates N
separate SocialLog rows — same category/pageType/country/price,
purchased within moments of each other. Group those back together
into one "bought together" card instead of showing N near-identical
cards. Anything that doesn't share a near-simultaneous match with
something else just renders as its own single card, same as before.

Matching rule: same category + pageType + country + price, and
purchased within BATCH_WINDOW_MS of the batch's *first* log (anchored
to the first, not the most recent, so a slow trickle of individually
unrelated same-price purchases can't chain into one giant batch just
by each being within the window of the last).
=====================================
*/

interface PurchaseBatch {
  key: string;
  category: string;
  pageType: string | null;
  country: string | null;
  platform: string;
  price: number;
  purchasedAt: string | null;
  logs: SocialLog[];
}

const BATCH_WINDOW_MS = 5000;

function groupPurchasesIntoBatches(purchases: SocialLog[]): PurchaseBatch[] {
  const sorted = [...purchases].sort(
    (a, b) => new Date(a.purchasedAt ?? 0).getTime() - new Date(b.purchasedAt ?? 0).getTime(),
  );

  const batches: PurchaseBatch[] = [];

  for (const log of sorted) {
    const logTime = new Date(log.purchasedAt ?? 0).getTime();
    const logPrice = Number(log.price) || 0;

    const match = batches.find((b) => {
      if (b.category !== log.category) return false;
      if ((b.pageType ?? null) !== (log.pageType ?? null)) return false;
      if ((b.country ?? null) !== (log.country ?? null)) return false;
      if (b.price !== logPrice) return false;
      const anchorTime = new Date(b.logs[0].purchasedAt ?? 0).getTime();
      return Math.abs(logTime - anchorTime) <= BATCH_WINDOW_MS;
    });

    if (match) {
      match.logs.push(log);
    } else {
      batches.push({
        key: `${log.category}|${log.pageType ?? ""}|${log.country ?? ""}|${logPrice}|${log.purchasedAt ?? log.id}`,
        category: log.category,
        pageType: log.pageType ?? null,
        country: log.country ?? null,
        platform: log.platform,
        price: logPrice,
        purchasedAt: log.purchasedAt ?? null,
        logs: [log],
      });
    }
  }

  // Most recent purchase/batch first
  return batches.reverse();
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);

  const batches = useMemo(() => groupPurchasesIntoBatches(purchases), [purchases]);

  /* ===============================
          DETAIL MODAL — single account credentials
  =============================== */

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<PurchasedSocialLog | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ===============================
          BATCH PICKER MODAL
  =============================== */

  const [batchOpen, setBatchOpen] = useState(false);
  const [activeBatch, setActiveBatch] = useState<PurchaseBatch | null>(null);

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
    // If this was opened from the batch picker, close it behind us so
    // there's only ever one modal on screen at a time.
    setBatchOpen(false);
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

  function openBatch(batch: PurchaseBatch) {
    setActiveBatch(batch);
    setBatchOpen(true);
  }

  function closeBatch() {
    setBatchOpen(false);
    setActiveBatch(null);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Purchases</h1>
        <p className="text-gray-500 dark:text-zinc-400">Accounts you've bought</p>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] p-10 text-center text-gray-400 dark:text-zinc-500">
          You haven't purchased any accounts yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const isBatch = batch.logs.length > 1;
            const representative = batch.logs[0];
            const categoryLabel = CATEGORY_LABELS[batch.category] ?? batch.platform;
            const subLabel = batch.pageType
              ? PAGE_TYPE_LABELS[batch.pageType] ?? batch.pageType
              : batch.country ?? undefined;

            const totalPaid = batch.logs.reduce((sum, l) => sum + (Number(l.price) || 0), 0);

            return (
              <div
                key={batch.key}
                className="group overflow-hidden rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl"
              >
                {/* Cover */}
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">
                    {batch.platform.charAt(0)}
                  </span>

                  <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-gray-900 dark:text-white backdrop-blur">
                    {categoryLabel}
                  </div>

                  <div
                    className={`absolute right-4 top-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                      isBatch ? "bg-blue-500/90" : "bg-green-500/90"
                    }`}
                  >
                    {isBatch ? (
                      <>
                        <Users size={13} />
                        Bought Together
                      </>
                    ) : (
                      <>
                        <BadgeCheck size={13} />
                        Owned
                      </>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                      {isBatch ? categoryLabel : `@${representative.username}`}
                    </h3>
                    {isBatch ? (
                      <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
                        {batch.logs.length} accounts{subLabel ? ` · ${subLabel}` : ""}
                      </p>
                    ) : (
                      subLabel && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-400 dark:text-zinc-500">
                          {!batch.pageType && batch.country && <MapPin size={12} />}
                          {subLabel}
                        </p>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-zinc-400">
                    {batch.purchasedAt && (
                      <span className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-zinc-800 px-2.5 py-1">
                        <Calendar size={12} />
                        {new Date(batch.purchasedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 pt-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {isBatch ? "Total Paid" : "Paid"}
                      </p>
                      <p className="text-xl font-bold text-orange-400">{money(totalPaid)}</p>
                    </div>

                    <button
                      onClick={() => (isBatch ? openBatch(batch) : openDetail(representative.id))}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
                    >
                      <KeyRound size={15} />
                      {isBatch ? "View Accounts" : "View Login"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BATCH PICKER MODAL — lists each unit in a "bought together" batch */}
      {batchOpen && activeBatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeBatch}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {CATEGORY_LABELS[activeBatch.category] ?? activeBatch.platform}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                  {activeBatch.logs.length} accounts bought together
                </p>
              </div>
              <button
                onClick={closeBatch}
                className="rounded-lg p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {activeBatch.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      @{log.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{money(log.price)}</p>
                  </div>
                  <button
                    onClick={() => openDetail(log.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-orange-600"
                  >
                    <KeyRound size={13} />
                    View Login
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL / CREDENTIALS MODAL — single description-style block, unchanged */}

      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeDetail}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] p-6"
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      @{selected.username}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                      {CATEGORY_LABELS[selected.category] ?? selected.platform}
                      {selected.country ? ` · ${selected.country}` : ""}
                    </p>
                  </div>

                  <button
                    onClick={closeDetail}
                    className="rounded-lg p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
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
                        <p className="py-6 text-center text-sm text-gray-400 dark:text-zinc-500">
                          No credentials found for this account. Contact
                          support if this looks wrong.
                        </p>
                      );
                    }

                    return (
                      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                            Account Details
                          </p>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setRevealed((r) => !r)}
                              title={revealed ? "Hide" : "Show"}
                              className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
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
                              className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                            >
                              {copied ? (
                                <Check size={15} className="text-green-400" />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="whitespace-pre-wrap break-all font-mono text-sm leading-6 text-gray-800 dark:text-zinc-200">
                          {revealed
                            ? description
                            : "•".repeat(Math.min(description.length, 80))}
                        </p>
                      </div>
                    );
                  })()}

                  {selected.notes && (
                    <div className="mt-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4">
                      <p className="mb-1 text-xs font-medium text-gray-400 dark:text-zinc-500">
                        Notes
                      </p>
                      <p className="text-sm text-gray-800 dark:text-zinc-200">
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