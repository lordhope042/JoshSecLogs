import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
}: Props) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 transition hover:border-orange-500">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-zinc-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {value}
          </h2>

        </div>

        <div className="rounded-2xl bg-orange-500/15 p-4">

          <Icon
            size={26}
            className="text-orange-500"
          />

        </div>

      </div>

    </div>
  );
}