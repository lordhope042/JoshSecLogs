import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  loading = false,
  subtitle,
}: DashboardCardProps) {
  return (
    <div className="group rounded-3xl border border-zinc-800 bg-[#111827] p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {loading ? (
              <span className="inline-block h-9 w-24 animate-pulse rounded bg-zinc-700" />
            ) : (
              value
            )}
          </h2>

          {subtitle && (
            <p className="mt-2 text-xs text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-orange-500/10 p-4 transition-colors duration-300 group-hover:bg-orange-500/20">
          <Icon
            size={28}
            className="text-orange-500"
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
}