"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export default function AdminNavItem({
  href,
  label,
  icon: Icon,
  active,
}: Props) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon size={20} />

      <span className="font-medium">
        {label}
      </span>
    </Link>
  );
}