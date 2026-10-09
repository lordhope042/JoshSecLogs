"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  Filter,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { toast } from "sonner";

const PENDING_STATUSES = ["ACTIVE", "PENDING", "PROCESSING"];
const FAILED_STATUSES = ["FAILED", "CANCELLED", "TIMEOUT", "BANNED"];

function money(value: unknown) {
  const amount = Number(value || 0);
  return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateLabel(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusMeta(status?: string) {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "COMPLETED":
      return { label: "Completed", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", Icon: CheckCircle2 };
    case "ACTIVE":
      return { label: "Active", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400", Icon: LoaderCircle };
    case "PENDING":
      return { label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400", Icon: Clock3 };
    case "PROCESSING":
      return { label: "Processing", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400", Icon: LoaderCircle };
    case "CANCELLED":
    case "TIMEOUT":
    case "BANNED":
    case "FAILED":
      return { label: s.charAt(0) + s.slice(1).toLowerCase(), cls: "bg-red-500/10 text-red-600 dark:text-red-400", Icon: XCircle };
    default:
      return { label: status || "Unknown", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400", Icon: Package };
  }
}

export default function OrdersPage() {
  const { orders, loading, loadOrders } = useOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  // Fetch orders when the page opens.
  useEffect(() => {
    loadOrders().catch(() => toast.error("Could not load orders"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when the user returns to this tab.
  useEffect(() => {
    const onFocus = () => {
      loadOrders().catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order: any) => {
      const matchesStatus = status === "ALL" || String(order.status || "").toUpperCase() === status;
      const haystack = [order.id, order.service, order.serviceName, order.countryName, order.phoneNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [orders, query, status]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o: any) => PENDING_STATUSES.includes(String(o.status || "").toUpperCase())).length,
    completed: orders.filter((o: any) => String(o.status || "").toUpperCase() === "COMPLETED").length,
    cancelled: orders.filter((o: any) => FAILED_STATUSES.includes(String(o.status || "").toUpperCase())).length,
  }), [orders]);

  function copyId(id: string) {
    navigator.clipboard?.writeText(id);
    toast.success("Order ID copied");
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 pb-10">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-1 text-[11px] font-bold tracking-[.14em] text-orange-500">ORDER MANAGEMENT</p>
          <h1 className="text-[30px] font-black tracking-[-.03em] text-slate-950 dark:text-white sm:text-[36px]">My Orders</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">Track your virtual number and service orders from one place.</p>
        </div>
        <Link href="/dashboard/marketplace" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600">
          <ShoppingBag className="h-4 w-4" /> Buy a Service <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Orders" value={stats.total} icon={ShoppingBag} tone="orange" />
        <Stat label="Pending" value={stats.pending} icon={Clock3} tone="amber" />
        <Stat label="Completed" value={stats.completed} icon={CheckCircle2} tone="green" />
        <Stat label="Cancelled / Failed" value={stats.cancelled} icon={XCircle} tone="red" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0b1424]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">Order History</h2>
            <p className="mt-0.5 text-xs text-slate-500">Search and filter all your orders.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#071321] dark:text-white sm:w-64" />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-semibold outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-[#071321] dark:text-white sm:w-40">
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="TIMEOUT">Timed out</option>
                <option value="BANNED">Banned</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">{[1, 2, 3, 4].map((n) => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500"><ShoppingBag className="h-6 w-6" /></div>
            <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">No orders found</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Your orders will appear here after you purchase a service.</p>
            <Link href="/dashboard/marketplace" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600">Explore Marketplace <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-slate-100 text-[10px] uppercase tracking-[.13em] text-slate-400 dark:border-slate-800"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filtered.map((order: any) => <OrderRow key={order.id} order={order} onCopy={copyId} />)}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              {filtered.map((order: any) => <MobileOrder key={order.id} order={order} onCopy={copyId} />)}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, icon: Icon, tone }: any) {
  const tones: any = { orange: "bg-orange-500/10 text-orange-500", amber: "bg-amber-500/10 text-amber-500", green: "bg-emerald-500/10 text-emerald-500", red: "bg-red-500/10 text-red-500" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1424]"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div></div>;
}

function OrderRow({ order, onCopy }: any) {
  const meta = statusMeta(order.status); const Icon = meta.Icon;
  const spinning = ["ACTIVE", "PROCESSING"].includes(String(order.status || "").toUpperCase());
  return <tr className="group hover:bg-slate-50/70 dark:hover:bg-white/[.02]"><td className="px-5 py-4"><button onClick={() => onCopy(String(order.id))} className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white hover:text-orange-500"><span>#{String(order.id).slice(-8)}</span><Copy className="h-3.5 w-3.5 text-slate-400" /></button><p className="mt-1 text-[10px] text-slate-400">{order.phoneNumber || "Service order"}</p></td><td className="px-4 py-4"><p className="text-xs font-bold text-slate-900 dark:text-white">{order.serviceName || order.service || "Service"}</p><p className="mt-1 text-[10px] text-slate-400">{order.countryName || order.country || ""}</p></td><td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{money(order.sellingPriceNgn ?? order.amount)}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.cls}`}><Icon className={`h-3 w-3 ${spinning ? "animate-spin" : ""}`} />{meta.label}</span></td><td className="px-4 py-4"><div className="flex items-center gap-1.5 text-[11px] text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{dateLabel(order.createdAt)}</div></td><td className="px-5 py-4 text-right"><Link href={`/dashboard/orders/${order.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-600 hover:border-orange-300 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300"><Eye className="h-3.5 w-3.5" /> View</Link></td></tr>;
}

function MobileOrder({ order, onCopy }: any) {
  const meta = statusMeta(order.status); const Icon = meta.Icon;
  return <article className="p-4"><div className="flex items-start justify-between gap-3"><div><button onClick={() => onCopy(String(order.id))} className="text-xs font-black text-slate-900 dark:text-white">#{String(order.id).slice(-8)}</button><p className="mt-1 text-[11px] text-slate-400">{order.serviceName || order.service || "Service"}{order.countryName ? ` · ${order.countryName}` : ""}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${meta.cls}`}><Icon className="h-3 w-3" />{meta.label}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[9px] uppercase tracking-wider text-slate-400">Amount</p><p className="mt-1 text-xs font-bold text-slate-800 dark:text-white">{money(order.sellingPriceNgn ?? order.amount)}</p></div><div><p className="text-[9px] uppercase tracking-wider text-slate-400">Date</p><p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{dateLabel(order.createdAt)}</p></div></div><Link href={`/dashboard/orders/${order.id}`} className="mt-4 flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"><Eye className="h-3.5 w-3.5" /> View Order</Link></article>;
}