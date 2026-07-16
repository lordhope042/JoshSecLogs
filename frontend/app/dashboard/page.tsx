"use client";

import {
  Wallet,
  ShoppingCart,
  CheckCircle,
  Clock3,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

import { useWallet } from "@/hooks/useWallet";
import { useOrders } from "@/hooks/useOrders";

export default function DashboardPage() {
  const {
    balance,
    transactions,
    loading: walletLoading,
  } = useWallet();

  const {
    orders,
    loading: ordersLoading,
  } = useOrders();

  const completedOrders = orders.filter(
    (order) =>
      order.status?.toUpperCase() ===
      "COMPLETED",
  ).length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status?.toUpperCase() ===
      "PENDING",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Welcome back to JoshSecLogs.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Wallet Balance"
          value={`₦${balance.toLocaleString()}`}
          icon={Wallet}
          loading={walletLoading}
        />

        <DashboardCard
          title="Orders"
          value={orders.length}
          icon={ShoppingCart}
          loading={ordersLoading}
        />

        <DashboardCard
          title="Completed"
          value={completedOrders}
          icon={CheckCircle}
          loading={ordersLoading}
        />

        <DashboardCard
          title="Pending"
          value={pendingOrders}
          icon={Clock3}
          loading={ordersLoading}
        />
      </div>

      {/* Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">
          <h2 className="mb-5 text-xl font-bold text-white">
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <p className="text-zinc-500">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {orders
                .slice(0, 5)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-900 p-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {order.service}
                      </p>

                      <p className="text-xs text-zinc-400">
                        {order.phoneNumber}
                      </p>
                    </div>

                    <span className="text-sm text-orange-500">
                      {order.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">
          <h2 className="mb-5 text-xl font-bold text-white">
            Recent Transactions
          </h2>

          {transactions.length === 0 ? (
            <p className="text-zinc-500">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions
                .slice(0, 5)
                .map((transaction) => (
                  <div
                    key={transaction.reference}
                    className="flex items-center justify-between rounded-xl bg-zinc-900 p-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {transaction.type}
                      </p>

                      <p className="text-xs text-zinc-400">
                        {new Date(
                          transaction.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-orange-500">
                      ₦
                      {Number(
                        transaction.amount,
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}