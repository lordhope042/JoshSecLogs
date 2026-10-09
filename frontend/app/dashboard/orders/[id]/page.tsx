"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  MessageSquare,
  Package,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";

const POLL_MS = 5000;
const LIVE_STATUSES = ["ACTIVE", "PENDING", "PROCESSING"];
const ORDER_TIMEOUT_MS = 20 * 60 * 1000; // must match the backend timeout

// Fallback when the order only has a numeric country code.
// Add more IDs here to match your provider's country list.
const COUNTRY_NAMES: Record<string, string> = {
  "0": "Russia",
  "1": "Ukraine",
  "2": "Kazakhstan",
  "3": "China",
  "4": "Philippines",
  "6": "Indonesia",
  "7": "Malaysia",
  "8": "Kenya",
  "10": "Vietnam",
  "12": "United States",
  "15": "Poland",
  "16": "United Kingdom",
  "19": "Nigeria",
  "22": "India",
  "36": "Canada",
  "43": "Germany",
  "52": "Thailand",
  "73": "Brazil",
  "78": "France",
  "187": "United States",
};

function countryLabel(order: any): string {
  if (order?.countryName) return String(order.countryName);
  const raw = order?.country;
  if (raw === undefined || raw === null || raw === "") return "—";
  return COUNTRY_NAMES[String(raw)] ?? String(raw);
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateTime(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusMeta(status?: string) {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "COMPLETED":
      return { label: "Completed", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", Icon: CheckCircle2 };
    case "ACTIVE":
      return { label: "Waiting for SMS", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400", Icon: LoaderCircle };
    case "PENDING":
    case "PROCESSING":
      return { label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400", Icon: Clock3 };
    case "CANCELLED":
    case "TIMEOUT":
    case "BANNED":
    case "FAILED":
      return { label: s.charAt(0) + s.slice(1).toLowerCase(), cls: "bg-red-500/10 text-red-600 dark:text-red-400", Icon: XCircle };
    default:
      return { label: status || "Unknown", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400", Icon: Package };
  }
}

// SMSBower/GrizzySMS return the code as a plain string, 5sim returns objects.
function smsText(item: any): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") return String(item.code ?? item.text ?? JSON.stringify(item));
  return String(item ?? "");
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { currentOrder: order, sms, loadOrder, loadSms, finishOrder, cancelOrder } = useOrders();

  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState<"finish" | "cancel" | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const status = String(order?.status || "").toUpperCase();
  const isLive = LIVE_STATUSES.includes(status);
  const meta = statusMeta(order?.status);
  const StatusIcon = meta.Icon;

  // Use the server's expiresAt if it sends one, otherwise createdAt + 20 minutes.
  const rawExpiry = order?.expiresAt
    ? new Date(order.expiresAt).getTime()
    : order?.createdAt
      ? new Date(order.createdAt).getTime() + ORDER_TIMEOUT_MS
      : 0;
  const expiresAt = Number.isNaN(rawExpiry) ? 0 : rawExpiry;
  const remainingMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const expired = isLive && expiresAt > 0 && remainingMs === 0;
  const countdown = `${String(Math.floor(remainingMs / 60000)).padStart(2, "0")}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")}`;

  // The hook toggles its shared `loading` flag on every call, so we only
  // show the skeleton for the first load and ignore it while polling.
  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      await loadOrder(id);
    } catch {
      setNotFound(true);
    } finally {
      setReady(true);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Tick every second while the order is live so the countdown moves.
  useEffect(() => {
    if (!isLive) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isLive]);

  // Poll for the SMS code while the order is waiting. Once the 20 minutes are up,
  // poll the order itself instead so the page picks up the server's timeout + refund.
  useEffect(() => {
    if (!id || !order || !isLive) return;

    const poll = () => {
      if (expired) loadOrder(id).catch(() => {});
      else loadSms(id).catch(() => {});
    };

    poll();
    timer.current = setInterval(poll, POLL_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [id, order?.id, isLive, expired]); // eslint-disable-line react-hooks/exhaustive-deps

  const messages = useMemo(() => sms.map(smsText).filter(Boolean), [sms]);

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  }

  async function onFinish() {
    if (!id) return;
    try {
      setBusy("finish");
      await finishOrder(id);
      toast.success("Order completed");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not complete this order");
    } finally {
      setBusy(null);
    }
  }

  async function onCancel() {
    if (!id) return;
    if (!window.confirm("Cancel this order? If no code has arrived, you will be refunded.")) return;
    try {
      setBusy("cancel");
      const res: any = await cancelOrder(id);
      toast.success(res?.refunded ? "Order cancelled and refunded" : "Order cancelled");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Could not cancel this order");
    } finally {
      setBusy(null);
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 pb-10">
        {[1, 2, 3].map((n) => <div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />)}
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500"><Package className="h-6 w-6" /></div>
        <h1 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Order not found</h1>
        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">This order doesn&apos;t exist or belongs to another account.</p>
        <Link href="/dashboard/orders" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </main>
    );
  }

  const serviceLabel = order.serviceName || order.service || "Service";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 pb-10">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* Header */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-black tracking-[-.03em] text-slate-950 dark:text-white">{serviceLabel} order</h1>
          <button onClick={() => copy(String(order.id), "Order ID")} className="mt-1 flex items-center gap-2 text-xs text-slate-500 hover:text-orange-500">
            #{String(order.id).slice(-8)} <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${meta.cls}`}>
          <StatusIcon className={`h-3.5 w-3.5 ${status === "ACTIVE" ? "animate-spin" : ""}`} />
          {meta.label}
        </span>
      </section>

      {/* Phone number */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1424]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your number</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-2xl font-black tracking-wide text-slate-950 dark:text-white">{order.phoneNumber ? `+${String(order.phoneNumber).replace(/^\+/, "")}` : "—"}</p>
          {order.phoneNumber && (
            <button onClick={() => copy(String(order.phoneNumber), "Number")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          )}
        </div>
      </section>

      {/* SMS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1424]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-black text-slate-950 dark:text-white">Verification code</h2>
        </div>

        {messages.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {messages.map((text, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-emerald-500/10 px-4 py-3">
                <span className="break-all text-lg font-black text-emerald-600 dark:text-emerald-400">{text}</span>
                <button onClick={() => copy(text, "Code")} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </li>
            ))}
          </ul>
        ) : isLive ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-blue-500/10 px-4 py-4 text-xs text-blue-600 dark:text-blue-400">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {expired ? (
              <span>Time is up. This order is being closed and refunded automatically.</span>
            ) : (
              <span>
                Waiting for the code. Use the number above, then this page updates on its own.
                {expiresAt > 0 && <> Expires in <b className="tabular-nums">{countdown}</b>.</>}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-500">No code was received for this order.</p>
        )}
      </section>

      {/* Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1424]">
        <h2 className="text-sm font-black text-slate-950 dark:text-white">Order details</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <Detail label="Service" value={serviceLabel} />
          <Detail label="Country" value={countryLabel(order)} />
          <Detail label="Price" value={money(order.sellingPriceNgn ?? order.amount)} />
          <Detail label="Created" value={dateTime(order.createdAt)} />
          <Detail label="Refunded" value={order.refundedAt ? dateTime(order.refundedAt) : "No"} />
        </dl>
      </section>

      {/* Actions */}
      {isLive && (
        <section className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onFinish}
            disabled={busy !== null || messages.length === 0}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "finish" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Mark as completed
          </button>
          <button
            onClick={onCancel}
            disabled={busy !== null || messages.length > 0 || expired}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
          >
            {busy === "cancel" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel and refund
          </button>
        </section>
      )}
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1 break-words font-bold text-slate-800 dark:text-slate-200">{value}</dd>
</div>
  );
}