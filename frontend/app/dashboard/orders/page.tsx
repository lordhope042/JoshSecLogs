"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

import {
  Loader2,
  RefreshCcw,
  MessageSquare,
  Copy,
  X,
  Check,
  Hourglass,
  Smartphone,
  Clock3,
  Mail,
  XCircle,
  CheckCircle2,
} from "lucide-react";

type Order = {
  id: string;
  provider: string;
  providerOrderId: string;
  country: string;
  operator: string;
  activationType: string;
  service: string;
  phoneNumber: string;
  providerCostUsd: string;
  sellingPriceNgn: string;
  status: string;
  createdAt: string;
};

type SmsMessage = {
  id: number;
  text: string;
  code?: string;
  created_at?: string;
  expires?: string;
};

const COUNTRY_FLAGS: Record<string, string> = {
  Philippines: "🇵🇭",
  Nigeria: "🇳🇬",
  "United States": "🇺🇸",
  Indonesia: "🇮🇩",
  India: "🇮🇳",
  Vietnam: "🇻🇳",
  Ghana: "🇬🇭",
  Kenya: "🇰🇪",
  "United Kingdom": "🇬🇧",
  Austria: "🇦🇹",
};

// Used to split "+4367870326897" into "+43 67870326897". Add more
// countries here as your provider list grows — anything missing just
// falls back to displaying the raw, unsplit number.
const COUNTRY_DIAL_CODES: Record<string, string> = {
  Philippines: "63",
  Nigeria: "234",
  "United States": "1",
  Indonesia: "62",
  India: "91",
  Vietnam: "84",
  Ghana: "233",
  Kenya: "254",
  "United Kingdom": "44",
  Austria: "43",
};

// TODO: confirm these match your real Prisma OrderStatus enum values
const ACTIVE_LIKE_STATUSES = new Set(["ACTIVE", "PENDING", "WAITING"]);
const CANCELLED_LIKE_STATUSES = new Set(["CANCELLED", "FAILED", "BANNED"]);

// NOTE: Order has no `expiresAt` field from the API yet — assuming a
// 20-minute activation window from createdAt for the countdown shown
// in the top-right corner of the active card. Swap this out for a real
// expiry field as soon as the backend exposes one.
const ASSUMED_WINDOW_MINUTES = 20;

type OrderSmsState = {
  messages: SmsMessage[];
  code: string | null;
  loading: boolean;
};

// Backend response shapes vary — try the flat cases first, then one
// level of nesting under `data` (common with a NestJS interceptor
// that wraps every response as { success, data } or similar).
function extractSmsList(data: any): SmsMessage[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.sms)) return data.sms;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.messages)) return data.data.messages;
  if (Array.isArray(data?.data?.sms)) return data.data.sms;

  // Confirmed shape from this backend: { Data: [...] | null, Total: number }
  if (Array.isArray(data?.Data)) return data.Data;
  if (data?.Data && (data.Data.text || data.Data.code)) return [data.Data];

  // Some 5sim-style providers return a single object per SMS instead
  // of an array — e.g. { text, code, created_at } directly, or
  // nested under `data`. Wrap it as a one-item list if it looks like
  // a message.
  const maybeSingle = data?.text || data?.code ? data : data?.data;
  if (maybeSingle && (maybeSingle.text || maybeSingle.code)) {
    return [maybeSingle];
  }

  return [];
}

function withFallbackIds(list: any[]): SmsMessage[] {
  return list.map((m, i) => ({
    ...m,
    id: m.id ?? m._id ?? i,
  }));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [workingAction, setWorkingAction] = useState<string | null>(null);

  // Per-order SMS state, keyed by order id — drives the inline
  // "Code from SMS" box on active cards and the message count in
  // the history table.
  const [smsByOrder, setSmsByOrder] = useState<Record<string, OrderSmsState>>(
    {},
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // "View all messages" modal, usable from either view.
  const [modalOrder, setModalOrder] = useState<Order | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadOrders() {
    try {
      const { data } = await api.get("/marketplace/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function isWorking(id: string, action: string) {
    return workingId === id && workingAction === action;
  }

  async function refreshOrders() {
    setRefreshing(true);

    try {
      await Promise.all(
        orders.map((order) =>
          api.get(`/marketplace/orders/${order.id}/sync`).catch(() => null),
        ),
      );

      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }

  async function copy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  async function syncOne(id: string) {
    try {
      setWorkingId(id);
      setWorkingAction("sync");

      await api.get(`/marketplace/orders/${id}/sync`);
      await loadOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setWorkingId(null);
      setWorkingAction(null);
    }
  }

  async function finish(id: string) {
    try {
      setWorkingId(id);
      setWorkingAction("finish");

      await api.post(`/marketplace/orders/${id}/finish`);
      await loadOrders();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? "Unable to complete order.");
    } finally {
      setWorkingId(null);
      setWorkingAction(null);
    }
  }

  async function cancel(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?\n\nIf the provider approves the cancellation, your wallet will be refunded.",
    );

    if (!confirmed) return;

    try {
      setWorkingId(id);
      setWorkingAction("cancel");

      const { data } = await api.post(`/marketplace/orders/${id}/cancel`);

      alert(data?.message ?? "Order cancelled successfully.");

      await loadOrders();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message ?? "Unable to cancel order.");
    } finally {
      setWorkingId(null);
      setWorkingAction(null);
    }
  }

  async function ban(id: string) {
    try {
      setWorkingId(id);
      setWorkingAction("ban");

      await api.post(`/marketplace/orders/${id}/ban`);
      await loadOrders();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? "Unable to ban number.");
    } finally {
      setWorkingId(null);
      setWorkingAction(null);
    }
  }

  /* Defensive parsing — backend shape may be an array, or wrapped
     under messages/sms/data. */
  async function fetchSms(orderId: string, opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setSmsByOrder((prev) => ({
        ...prev,
        [orderId]: {
          messages: prev[orderId]?.messages ?? [],
          code: prev[orderId]?.code ?? null,
          loading: true,
        },
      }));
    }

    try {
      const { data } = await api.get(`/marketplace/orders/${orderId}/sms`);

      // eslint-disable-next-line no-console
      console.log(`[SMS RAW RESPONSE] order=${orderId}`, data);

      const list: SmsMessage[] = withFallbackIds(extractSmsList(data));

      if (
        list.length === 0 &&
        data != null &&
        !(("Data" in data && data.Total === 0) || ("total" in data && data.total === 0))
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `[SMS PARSE MISS] order=${orderId} — response didn't match any known shape, see raw response above.`,
        );
      }

      const latestCode = [...list].reverse().find((m) => m.code)?.code ?? null;

      setSmsByOrder((prev) => ({
        ...prev,
        [orderId]: { messages: list, code: latestCode, loading: false },
      }));

      return list;
    } catch (e) {
      console.error("[SMS FETCH ERROR]", e);

      setSmsByOrder((prev) => ({
        ...prev,
        [orderId]: {
          messages: prev[orderId]?.messages ?? [],
          code: prev[orderId]?.code ?? null,
          loading: false,
        },
      }));

      return [];
    }
  }

  /* Background polling — every order that's still "active" gets its
     SMS inbox polled automatically, so the code appears inline on the
     card the moment it arrives. Once an order moves to a
     cancelled/completed state it naturally falls out of this list and
     drops into the history table below instead. */
  useEffect(() => {
    const activeOrders = orders.filter((o) =>
      ACTIVE_LIKE_STATUSES.has(o.status),
    );

    if (activeOrders.length === 0) return;

    pollRef.current = setInterval(async () => {
      await Promise.all(
        activeOrders.map((order) => fetchSms(order.id, { silent: true })),
      );
      await loadOrders();
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.map((o) => `${o.id}:${o.status}`).join(",")]);

  function flagFor(country: string) {
    return COUNTRY_FLAGS[country] ?? null;
  }

  function formatPhoneNumber(order: Order) {
    const raw = order.phoneNumber.replace(/\s+/g, "");
    const dial = COUNTRY_DIAL_CODES[order.country];

    if (dial && raw.startsWith(`+${dial}`)) {
      return `+${dial} ${raw.slice(dial.length + 1)}`;
    }

    return raw;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function minutesRemaining(order: Order) {
    const created = new Date(order.createdAt).getTime();
    const elapsedMs = Date.now() - created;
    const remaining = ASSUMED_WINDOW_MINUTES - Math.floor(elapsedMs / 60000);
    return Math.max(remaining, 0);
  }

  function statusDotColor(status: string) {
    if (CANCELLED_LIKE_STATUSES.has(status)) return "bg-red-500";
    if (status === "COMPLETED") return "bg-green-500";
    if (ACTIVE_LIKE_STATUSES.has(status)) return "bg-blue-500";
    return "bg-zinc-500";
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_LIKE_STATUSES.has(o.status));
  const historyOrders = orders.filter((o) => !ACTIVE_LIKE_STATUSES.has(o.status));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-gray-500 dark:text-zinc-400">Purchased activation numbers</p>
        </div>

        <button
          onClick={refreshOrders}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
          Refresh All
        </button>
      </div>

      {/* ================= ACTIVE ORDERS — CARD VIEW ================= */}

      <div className="space-y-3">
        {activeOrders.length === 0 && historyOrders.length === 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] p-10 text-center text-gray-400 dark:text-zinc-500">
            No orders found.
          </div>
        )}

        {activeOrders.map((order) => {
          const rowBusy = workingId === order.id;
          const flag = flagFor(order.country);
          const sms = smsByOrder[order.id];
          const smsCount = sms?.messages.length ?? 0;
          const code = sms?.code ?? null;
          const remaining = minutesRemaining(order);

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] px-6 py-4 transition hover:border-gray-300 dark:hover:border-zinc-700"
            >
              {/* Top row: order id + countdown + time + status dot */}
              <div className="flex items-center justify-between text-sm text-gray-400 dark:text-zinc-500">
                <span>№ {order.providerOrderId || order.id}</span>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-orange-400">
                    <Clock3 size={14} />
                    {remaining} min
                  </span>

                  <span>{formatTime(order.createdAt)}</span>

                  <span
                    className={`h-2 w-2 rounded-full ${statusDotColor(order.status)}`}
                    title={order.status}
                  />
                </div>
              </div>

              {/* Main row: service / operator / price / sms count  —  actions */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {order.service?.charAt(0)}
                    </span>
                    {order.service}
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-zinc-300">
                    {flag ? (
                      <span className="text-lg leading-none">{flag}</span>
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    )}
                    {order.operator || order.country}
                  </div>

                  <div className="font-medium text-gray-900 dark:text-white">
                    ₦{Number(order.sellingPriceNgn).toLocaleString()}
                  </div>

                  <button
                    onClick={() => setModalOrder(order)}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 transition hover:bg-zinc-700"
                  >
                    <MessageSquare size={12} />
                    {smsCount > 0 ? `${smsCount} SMS` : ">1 SMS"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncOne(order.id)}
                    disabled={rowBusy}
                    title="Sync this order"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50"
                  >
                    {isWorking(order.id, "sync") ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Hourglass size={16} />
                    )}
                  </button>

                  {code ? (
                    <button
                      onClick={() => finish(order.id)}
                      disabled={rowBusy}
                      className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isWorking(order.id, "finish") ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Complete"
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => ban(order.id)}
                        disabled={rowBusy}
                        className="rounded-xl border border-blue-500 px-5 py-2.5 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10 disabled:opacity-50"
                      >
                        {isWorking(order.id, "ban") ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Ban"
                        )}
                      </button>

                      <button
                        onClick={() => cancel(order.id)}
                        disabled={rowBusy}
                        className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isWorking(order.id, "cancel") ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom row: phone number pill + live code from SMS */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-blue-500 pl-4 pr-2 py-2.5 text-white">
                  <Smartphone size={16} className="text-gray-900/80 dark:text-white/80" />
                  <span className="font-mono font-semibold tracking-wide">
                    {formatPhoneNumber(order)}
                  </span>

                  <button
                    onClick={() => copy(`phone:${order.id}`, order.phoneNumber)}
                    title="Copy number"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 transition hover:bg-blue-700"
                  >
                    {copiedKey === `phone:${order.id}` ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                    Code from SMS
                  </span>

                  <div className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-2 py-2">
                    <input
                      readOnly
                      value={code ?? ""}
                      placeholder={sms?.loading ? "…" : "—"}
                      className="w-28 bg-transparent font-mono font-bold tracking-widest text-orange-400 outline-none placeholder:text-zinc-600"
                    />

                    <button
                      onClick={() => code && copy(`code:${order.id}`, code)}
                      disabled={!code}
                      title="Copy code"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copiedKey === `code:${order.id}` ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Latest SMS text — the actual message body, not just the code */}
              {sms?.messages.length > 0 && (
                <div className="mt-3 flex items-start justify-between gap-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-4 py-3">
                  <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300">
                    <Mail size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    <span>{sms.messages[sms.messages.length - 1].text}</span>
                  </div>

                  {sms.messages[sms.messages.length - 1].created_at && (
                    <span className="shrink-0 text-xs text-gray-400 dark:text-zinc-500">
                      {formatTime(
                        sms.messages[sms.messages.length - 1].created_at!,
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= HISTORY (COMPLETED / CANCELLED) — TABLE VIEW ================= */}

      {historyOrders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order History</h2>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-zinc-800">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-white/80 dark:bg-zinc-900/80 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                  <th className="px-5 py-4 border-r border-gray-200 dark:border-zinc-800">ID</th>
                  <th className="px-5 py-4 border-r border-gray-200 dark:border-zinc-800">Date</th>
                  <th className="px-5 py-4 border-r border-gray-200 dark:border-zinc-800">Service</th>
                  <th className="px-5 py-4 border-r border-gray-200 dark:border-zinc-800">Country</th>
                  <th className="px-5 py-4 border-r border-gray-200 dark:border-zinc-800">
                    Price
                    <div className="mt-0.5 text-[10px] font-medium normal-case text-gray-400 dark:text-zinc-500">
                      Operator
                    </div>
                  </th>
                  <th className="px-5 py-4 border-r border-gray-200 dark:border-zinc-800">
                    Number
                    <div className="mt-0.5 text-[10px] font-medium normal-case text-gray-400 dark:text-zinc-500">
                      Code
                    </div>
                  </th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {historyOrders.map((order) => {
                  const flag = flagFor(order.country);
                  const sms = smsByOrder[order.id];
                  const smsCount = sms?.messages.length ?? 0;
                  const cancelledLike = CANCELLED_LIKE_STATUSES.has(order.status);
                  const completed = order.status === "COMPLETED";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setModalOrder(order)}
                      className="cursor-pointer border-t border-gray-200/70 dark:border-zinc-800/70 bg-white dark:bg-[#0f172a] transition hover:bg-gray-50/60 dark:hover:bg-zinc-900/60"
                    >
                      <td className="px-5 py-4 align-top font-semibold text-gray-900 dark:text-white">
                        {order.providerOrderId || order.id}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-orange-400">
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">
                          {formatTime(order.createdAt)}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200">
                          {order.service?.charAt(0)}
                        </div>
                        <div className="mt-1 text-sm font-medium text-blue-400">
                          {order.service}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        {flag ? (
                          <span className="text-lg leading-none">{flag}</span>
                        ) : (
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                        )}
                        <div className="mt-1 text-sm font-medium text-blue-400">
                          {order.country}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ₦{Number(order.sellingPriceNgn).toLocaleString()}
                        </div>
                        <div className="mt-0.5 text-sm text-blue-400">
                          {order.operator}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="font-mono font-semibold text-gray-900 dark:text-white">
                          {formatPhoneNumber(order)}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-blue-400">
                          <Mail size={13} />
                          {smsCount}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            cancelledLike
                              ? "bg-red-500/90 text-white"
                              : completed
                                ? "bg-green-500/90 text-white"
                                : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300"
                          }`}
                          title={order.status}
                        >
                          {cancelledLike ? (
                            <XCircle size={18} />
                          ) : completed ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <Clock3 size={18} />
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full message history modal — opened from either view */}
      {modalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setModalOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalOrder.service} — SMS Messages
                </h3>
                <p className="mt-1 font-mono text-sm text-gray-500 dark:text-zinc-400">
                  {formatPhoneNumber(modalOrder)}
                </p>
              </div>

              <button
                onClick={() => setModalOrder(null)}
                className="rounded-lg p-1.5 text-gray-500 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 max-h-80 space-y-3 overflow-y-auto">
              {smsByOrder[modalOrder.id]?.loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              )}

              {!smsByOrder[modalOrder.id]?.loading &&
                (smsByOrder[modalOrder.id]?.messages.length ?? 0) === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
                    No messages received yet.
                  </p>
                )}

              {smsByOrder[modalOrder.id]?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-4"
                >
                  <p className="text-sm text-gray-800 dark:text-zinc-200">{msg.text}</p>

                  {msg.code && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-100 dark:bg-zinc-800 px-3 py-2">
                      <span className="font-mono text-lg font-bold tracking-widest text-orange-400">
                        {msg.code}
                      </span>

                      <button
                        onClick={() => copy(`modal:${msg.id}`, msg.code!)}
                        className="flex items-center gap-1.5 rounded-md bg-gray-200 dark:bg-zinc-700 px-2.5 py-1.5 text-xs font-medium text-gray-800 dark:text-zinc-200 transition hover:bg-zinc-600"
                      >
                        {copiedKey === `modal:${msg.id}` ? (
                          <>
                            <Check size={14} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {msg.created_at && (
                    <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => fetchSms(modalOrder.id)}
                disabled={smsByOrder[modalOrder.id]?.loading}
                className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white transition hover:bg-zinc-700 disabled:opacity-60"
              >
                <RefreshCcw
                  size={14}
                  className={
                    smsByOrder[modalOrder.id]?.loading ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>

              <button
                onClick={() => setModalOrder(null)}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}