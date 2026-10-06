"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  History,
  Plus,
  ReceiptText,
  ShoppingBag,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { useWalletContext } from "@/contexts/WalletContext";
import { useOrders } from "@/hooks/useOrders";

// 08143002438 in international format (Nigeria +234, leading 0 dropped)
const WHATSAPP_NUMBER = "2348143002438";
const WHATSAPP_MESSAGE = "Hello JoshSecLogs, I need help with my account.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

function money(value: number) {
  return `₦${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusClasses(status?: string) {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20";
    case "PENDING":
      return "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20";
    case "FAILED":
      return "bg-red-500/10 text-red-500 ring-1 ring-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 ring-1 ring-gray-500/20";
  }
}

export default function DashboardPage() {
  const { balance, transactions, loading: walletLoading, loadTransactions } =
    useWalletContext();
  const { orders, loading: ordersLoading, loadOrders } = useOrders();

  useEffect(() => {
    loadTransactions();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedOrders = orders.filter(
    (order) => order.status?.toUpperCase() === "COMPLETED",
  ).length;
  const pendingOrders = orders.filter(
    (order) => order.status?.toUpperCase() === "PENDING",
  ).length;

  const recentOrders = orders.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-20">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
            <Zap className="h-3.5 w-3.5" />
            Account overview
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            Good evening, welcome back 👋
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Here&apos;s what&apos;s happening with your JoshSecLogs account today.
          </p>
        </div>

        <Link
          href="/dashboard/marketplace"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Buy a Service
        </Link>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet Balance"
          value={walletLoading ? "—" : money(balance)}
          helper="Available balance"
          icon={Wallet}
          accent="green"
        />
        <StatCard
          label="Total Orders"
          value={ordersLoading ? "—" : orders.length}
          helper="All your orders"
          icon={ShoppingBag}
          accent="blue"
        />
        <StatCard
          label="Completed"
          value={ordersLoading ? "—" : completedOrders}
          helper="Successfully completed"
          icon={CheckCircle2}
          accent="violet"
        />
        <StatCard
          label="Pending Orders"
          value={ordersLoading ? "—" : pendingOrders}
          helper="Awaiting completion"
          icon={Clock3}
          accent="amber"
        />
      </section>

      {/* Main content */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        {/* Orders */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0B1424]">
          <SectionHeader
            icon={ShoppingBag}
            title="Recent Orders"
            description="Your latest service activity"
            href="/dashboard/orders"
          />

          <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                description="Your recent orders will appear here."
                href="/dashboard/marketplace"
                action="Explore Marketplace"
              />
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-white/[0.025]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                    <Smartphone className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                      {order.service || "Service order"}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-zinc-500">
                      {order.phoneNumber || "Order reference"}
                    </p>
                  </div>

                  <span
                    className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${statusClasses(order.status)}`}
                  >
                    {order.status || "Unknown"}
                  </span>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wallet activity */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0B1424]">
          <SectionHeader
            icon={Activity}
            title="Wallet Activity"
            description="Recent account transactions"
            href="/dashboard/transactions"
          />

          <div className="divide-y divide-gray-100 dark:divide-zinc-800/80">
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No transactions yet"
                description="Your wallet activity will appear here."
                href="/dashboard/wallet"
                action="Open Wallet"
              />
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.reference}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-white/[0.025]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CreditCard className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {transaction.type || "Transaction"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-emerald-500">
                    {money(Number(transaction.amount))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">
              Get where you need to go faster.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            href="/dashboard/marketplace"
            icon={Smartphone}
            title="Buy Virtual Number"
            description="Browse available numbers"
          />
          <QuickAction
            href="/dashboard/social-logs"
            icon={Zap}
            title="Social Logs"
            description="View available services"
          />
          <QuickAction
            href="/dashboard/wallet"
            icon={Wallet}
            title="Fund Wallet"
            description="Add funds to your account"
          />
          <QuickAction
            href="/dashboard/api"
            icon={CreditCard}
            title="API Access"
            description="Manage your API keys"
          />
        </div>
      </section>

      {/* Bottom insight */}
      <div className="flex flex-col gap-4 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-orange-500/[0.04] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Keep your account funded
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Add wallet funds before placing your next order for a smoother checkout.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 px-4 py-2.5 text-sm font-bold text-orange-500 transition hover:bg-orange-500 hover:text-white"
        >
          Open Wallet
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* WhatsApp contact button — fixed to the bottom-right corner */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-4 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:bottom-6 sm:right-6 sm:px-5"
      >
        <FaWhatsapp className="h-7 w-7 shrink-0" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof Wallet;
  accent: "green" | "blue" | "violet" | "amber";
}) {
  const accents = {
    green: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/15",
    blue: "bg-sky-500/10 text-sky-500 ring-sky-500/15",
    violet: "bg-violet-500/10 text-violet-500 ring-violet-500/15",
    amber: "bg-amber-500/10 text-amber-500 ring-amber-500/15",
  };

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-md dark:border-zinc-800 dark:bg-[#0B1424]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-zinc-500">
            {label}
          </p>
          <p className="mt-3 truncate text-2xl font-black tracking-tight text-gray-950 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{helper}</p>
        </div>
        <div className={`rounded-xl p-3 ring-1 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof ShoppingBag;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-zinc-800/80">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-orange-500/10 p-2 text-orange-500">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-500">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="text-xs font-bold text-orange-500 transition hover:text-orange-600"
      >
        View all
      </Link>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: typeof ShoppingBag;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
      <div className="rounded-2xl bg-gray-100 p-3 text-gray-400 dark:bg-zinc-900 dark:text-zinc-500">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-zinc-500">{description}</p>
      <Link
        href={href}
        className="mt-4 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
      >
        {action}
      </Link>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Smartphone;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-[#0B1424]"
    >
      <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-zinc-500">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:text-orange-500" />
    </Link>
  );
}