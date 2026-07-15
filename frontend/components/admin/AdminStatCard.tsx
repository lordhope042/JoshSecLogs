"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  color?: "blue" | "green" | "orange" | "purple";
}

const colors = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
  },
};

export default function AdminStatCard({
  title,
  value,
  icon,
  change,
  color = "blue",
}: Props) {
  const style = colors[color];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div
          className={`rounded-xl p-4 ${style.bg} ${style.text}`}
        >
          {icon}
        </div>
      </div>

      {change !== undefined && (
        <div className="mt-5 flex items-center gap-2">
          {change >= 0 ? (
            <TrendingUp
              size={18}
              className="text-green-500"
            />
          ) : (
            <TrendingDown
              size={18}
              className="text-red-500"
            />
          )}

          <span
            className={`text-sm font-semibold ${
              change >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {Math.abs(change)}%
          </span>

          <span className="text-sm text-zinc-500">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}