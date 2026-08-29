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
  Link as LinkIcon,
  Wrench,
} from "lucide-react";

import {
  getMyPurchases,
  getPurchasedSocialLog,
} from "@/services/socialLogs";

import { CATEGORY_LABELS, PAGE_TYPE_LABELS } from "@/components/social-logs/SocialLogCard";

import type { SocialLog, PurchasedSocialLog } from "@/types/social-log";

const money = (price?: string | number) =>
  `₦${Number(price ?? 0).toLocaleString()}`;

interface CredentialRow {
  label: string;
  value: string;
}

function buildCredentialRows(log: PurchasedSocialLog): CredentialRow[] {
  const rows: CredentialRow[] = [];

  const usernameValue = log.loginUsername ?? log.username;
  if (usernameValue) rows.push({ label: "Username", value: usernameValue });

  if (log.password) rows.push({ label: "Password", value: log.password });

  if (log.twoFactorSecret)
    rows.push({ label: "2FA", value: log.twoFactorSecret });

  if (log.loginEmail) rows.push({ label: "Mail", value: log.loginEmail });

  if (log.emailPassword)
    rows.push({ label: "Mail Password", value: log.emailPassword });

  if (log.recoveryEmail)
    rows.push({ label: "Recovery Mail", value: log.recoveryEmail });

  if (log.loginPhone) rows.push({ label: "Phone", value: log.loginPhone });

  if (log.backupCodes && log.backupCodes.length > 0)
    rows.push({ label: "Backup Codes", value: log.backupCodes.join(", ") });

  if (log.cookies) {
    const cookieStr =
      typeof log.cookies === "string"
        ? log.cookies
        : JSON.stringify(log.cookies);
    rows.push({ label: "Cookies", value: cookieStr });
  }

  // ADD THIS: Show tool link for working tools
  if (log.toolLink) {
    rows.push({ label: "Tool Link", value: log.toolLink });
  }

  return rows;
}

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

  return batches.reverse();
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<SocialLog[]>([]);
  const [loading, setLoading] = useState(true);

  const batches = useMemo(() => groupPurchasesIntoBatches(purchases), [purchases]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<PurchasedSocialLog | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

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
    setBatchOpen(false);
    setDetailOpen(true);
    setDetailLoading(true);
    setSelected(null);
    setRevealed(false);
    setCopiedLabel(null);

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

  async function copyValue(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1500);
  }

  async function copyAll(rows: CredentialRow[]) {
    const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedLabel("ALL");
    setTimeout(() => setCopiedLabel(null), 1500);
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
        <p className="text-gray-500 dark:text-zinc-400">Accounts and tools you've bought</p>
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
            const isWorkingTool = batch.category === "ALL_WORKING_TOOLS";
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
                    {isWorkingTool ? "🔧" : batch.platform.charAt(0)}
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
                      {isBatch ? categoryLabel : isWorkingTool ? representative.username : `@${representative.username}`}
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
                      {isWorkingTool ? <LinkIcon size={15} /> : <KeyRound size={15} />}
                      {isWorkingTool ? "View Link" : isBatch ? "View Accounts" : "View Login"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BATCH PICKER MODAL */}
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
                      {log.category === "ALL_WORKING_TOOLS" ? log.username : `@${log.username}`}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{money(log.price)}</p>
                  </div>
                  <button
                    onClick={() => openDetail(log.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-orange-600"
                  >
                    {log.category === "ALL_WORKING_TOOLS" ? <LinkIcon size={13} /> : <KeyRound size={13} />}
                    {log.category === "ALL_WORKING_TOOLS" ? "View Link" : "View Login"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL / CREDENTIALS MODAL */}
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
                      {selected.category === "ALL_WORKING_TOOLS" ? selected.username : `@${selected.username}`}
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
                  {selected.category === "ALL_WORKING_TOOLS"
                    ? "This tool link belongs to you. Keep it private."
                    : "These credentials belong to you. Keep them private — anyone with this info can access the account."}
                </div>

                <div className="mt-5">
                  {(() => {
                    const rows = buildCredentialRows(selected);

                    if (rows.length === 0) {
                      return (
                        <p className="py-6 text-center text-sm text-gray-400 dark:text-zinc-500">
                          No credentials found. Contact support if this looks wrong.
                        </p>
                      );
                    }

                    return (
                      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                            {selected.category === "ALL_WORKING_TOOLS" ? "Tool Details" : "Account Details"}
                          </p>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setRevealed((r) => !r)}
                              title={revealed ? "Hide all" : "Show all"}
                              className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                            >
                              {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>

                            <button
                              onClick={() => copyAll(rows)}
                              title="Copy all"
                              className="rounded-lg p-2 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                            >
                              {copiedLabel === "ALL" ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                            </button>
                          </div>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                          {rows.map((row) => {
                            const hidden = !revealed;
                            const masked = "•".repeat(Math.min(row.value.length, 32));

                            return (
                              <div
                                key={row.label}
                                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                              >
                                <div className="w-28 shrink-0">
                                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                                    {row.label}
                                  </p>
                                </div>

                                <p className="flex-1 break-all font-mono text-sm leading-5 text-gray-800 dark:text-zinc-200">
                                  {hidden ? masked : row.value}
                                </p>

                                <button
                                  onClick={() => copyValue(row.label, row.value)}
                                  title={`Copy ${row.label}`}
                                  className="shrink-0 rounded-lg p-1.5 text-gray-400 dark:text-zinc-500 transition hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white"
                                >
                                  {copiedLabel === row.label ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {selected.notes && (
                    <div className="mt-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4">
                      <p className="mb-1 text-xs font-medium text-gray-400 dark:text-zinc-500">Notes</p>
                      <p className="text-sm text-gray-800 dark:text-zinc-200">{selected.notes}</p>
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