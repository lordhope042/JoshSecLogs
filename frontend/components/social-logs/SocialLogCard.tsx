"use client";

import {
  Eye,
  Lock,
  Users,
  Calendar,
  BadgeCheck,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";

import { SocialLog } from "@/types/social-log";

interface Props {
  log: SocialLog;
  onView: (id: string) => void;
}

const money = (price?: number) =>
  `₦${Number(price ?? 0).toLocaleString()}`;

export default function SocialLogCard({
  log,
  onView,
}: Props) {
  const isSold = log.status === "SOLD";

  return (
    <div
      className={`
        group overflow-hidden rounded-3xl
        border border-zinc-200
        bg-white
        shadow-sm
        transition-all duration-300

        ${
          isSold
            ? "opacity-70"
            : "hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl"
        }

        dark:border-zinc-800
        dark:bg-zinc-900
      `}
    >
      {/* Cover */}

      <div className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {log.image ? (
          <img
            src={log.image}
            alt={log.username}
            className={`
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              ${isSold ? "grayscale" : "group-hover:scale-105"}
            `}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500">
            <span className="text-5xl font-black text-white">
              {log.platform.charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {log.platform}
        </div>

        <div
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            log.status === "AVAILABLE"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {log.status}
        </div>
      </div>

      {/* Body */}

      <div className="space-y-5 p-5">
        <div>
          <h3 className="truncate text-xl font-bold text-zinc-900 dark:text-white">
            @{log.username}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {log.country}
          </p>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <div className="mb-2 flex items-center gap-2 text-zinc-500">
              <Users size={15} />
              <span className="text-xs">
                Followers
              </span>
            </div>

            <p className="font-semibold">
              {log.followers
                ? log.followers.toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <div className="mb-2 flex items-center gap-2 text-zinc-500">
              <Calendar size={15} />
              <span className="text-xs">
                Age
              </span>
            </div>

            <p className="font-semibold">
              {log.age} yrs
            </p>
          </div>
        </div>

        {/* Security */}

        <div className="flex flex-wrap gap-2">
          {log.verified && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
              <BadgeCheck size={13} />
              Verified
            </span>
          )}

          {log.ogEmail && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              OG Email
            </span>
          )}

          {log.twoFactor && (
            <span className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
              <ShieldCheck size={13} />
              2FA
            </span>
          )}

          {log.emailAttached && (
            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
              <Mail size={13} />
              Email
            </span>
          )}

          {log.phoneAttached && (
            <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400">
              <Phone size={13} />
              Phone
            </span>
          )}
        </div>

        {log.description && (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {log.description}
          </p>
        )}
      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500">
            Price
          </p>

          <p
            className={`text-2xl font-bold ${
              isSold
                ? "text-zinc-400 line-through dark:text-zinc-600"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {money(log.price)}
          </p>
        </div>

        <button
          onClick={() => !isSold && onView(log.id)}
          disabled={isSold}
          className={`
            flex items-center gap-2
            rounded-xl
            px-5 py-3
            font-medium
            transition-all

            ${
              isSold
                ? "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg"
            }
          `}
        >
          {isSold ? (
            <>
              <Lock size={18} />
              Sold Out
            </>
          ) : (
            <>
              <Eye size={18} />
              View Details
            </>
          )}
        </button>
      </div>
    </div>
  );
}