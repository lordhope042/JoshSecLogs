import {
  Wallet,
  ShoppingCart,
  CheckCircle,
  Clock3,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

export default function DashboardPage() {
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Wallet Balance"
          value="₦0.00"
          icon={Wallet}
        />

        <DashboardCard
          title="Orders"
          value="0"
          icon={ShoppingCart}
        />

        <DashboardCard
          title="Completed"
          value="0"
          icon={CheckCircle}
        />

        <DashboardCard
          title="Pending"
          value="0"
          icon={Clock3}
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">

          <h2 className="mb-5 text-xl font-bold text-white">
            Recent Orders
          </h2>

          <p className="text-zinc-500">
            No orders yet.
          </p>

        </div>

        <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">

          <h2 className="mb-5 text-xl font-bold text-white">
            Recent Transactions
          </h2>

          <p className="text-zinc-500">
            No transactions yet.
          </p>

        </div>

      </div>

    </div>
  );
}