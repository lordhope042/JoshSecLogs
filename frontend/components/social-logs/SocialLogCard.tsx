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
  Layers,
} from "lucide-react";

import { SocialLog } from "@/types/social-log";

export interface SocialLogStockGroup {
  key: string;
  platform: string;
  category: string;
  pageType: string | null;
  country: string | null;
  logs: SocialLog[];
}

export function groupLogsIntoStock(logs: SocialLog[]): SocialLogStockGroup[] {
  const groups = new Map<string, SocialLog[]>();

  for (const log of logs) {
    const key = `${log.platform}|${log.category}|${log.pageType ?? ""}|${log.country ?? ""}`;
    const existing = groups.get(key);
    if (existing) existing.push(log);
    else groups.set(key, [log]);
  }

  return Array.from(groups.entries()).map(([key, groupLogs]) => {
    const sorted = [...groupLogs].sort(
      (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
    );
    const first = sorted[0];
    return {
      key,
      platform: first.platform,
      category: first.category,
      pageType: first.pageType,
      country: first.country,
      logs: sorted,
    };
  });
}

interface Props {
  group: SocialLogStockGroup;
  onView: (id: string) => void;
  searchQuery?: string;
}

const money = (price?: number) => `₦${Number(price ?? 0).toLocaleString()}`;

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-orange-200 px-0.5 text-inherit dark:bg-orange-500/40">
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  FACEBOOK_PAGE: "Facebook Page",
  FACEBOOK_COUNTRY: "Facebook",
  TWITTER_FOLLOWERS: "Twitter / X",
  INSTAGRAM_FOLLOWERS: "Instagram",
  VPN: "VPN",
  TEXTPLUS_NEXTPLUS: "Texting App",
  TELEGRAM_ACCOUNT: "Telegram",
  TIKTOK_COUNTRY: "TikTok",
  TIKTOK_FOLLOWERS: "TikTok",
  MAIL: "Mail",
};

export const PAGE_TYPE_LABELS: Record<string, string> = {
  CREATE_PAGE: "Create Page",
  CREATED_PAGE: "Created Page",
  MULTI_PAGE: "2x Created",
  PAGE_WITH_FOLLOWERS: "Page with Followers",
};

export default function SocialLogCard({ group, onView, searchQuery }: Props) {
  const representative = group.logs[0];
  const count = group.logs.length;
  const isSold = count === 0;

  const hasFollowers = typeof representative?.followers === "number" && (representative.followers ?? 0) > 0;

  const categoryLabel = CATEGORY_LABELS[group.category] ?? group.platform;
  const subLabel = group.pageType ? PAGE_TYPE_LABELS[group.pageType] ?? group.pageType : group.country ?? undefined;

  const prices = group.logs.map((l) => Number(l.price) || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const uniformPrice = minPrice === maxPrice;

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
        {representative?.image ? (
          <img
            src={representative.image}
            alt={categoryLabel}
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
            <span className="text-5xl font-black text-gray-900 dark:text-white">{group.platform.charAt(0)}</span>
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-gray-900 dark:text-white backdrop-blur">
          {categoryLabel}
        </div>

        <div
          className={`flex items-center gap-1 absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            isSold ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          <Layers size={12} />
          {isSold ? "Out of Stock" : `${count} stocks available`}
        </div>
      </div>

      {/* Body */}

      <div className="space-y-5 p-5">
        <div>
          <h3 className="truncate text-xl font-bold text-zinc-900 dark:text-white">
            <HighlightedText text={categoryLabel} query={searchQuery} />
          </h3>
          {subLabel && (
            <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
              <HighlightedText text={subLabel} query={searchQuery} />
            </p>
          )}
        </div>

        {/* Description now leads the body — shown first, before stats/badges */}
        {representative?.description && (
          <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{representative.description}</p>
        )}

        {representative && (
          <div className={`grid gap-3 ${hasFollowers ? "grid-cols-2" : "grid-cols-1"}`}>
            {hasFollowers && (
              <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                <div className="mb-2 flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                  <Users size={15} />
                  <span className="text-xs">Followers</span>
                </div>
                <p className="font-semibold">{representative.followers!.toLocaleString()}</p>
              </div>
            )}

            <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
              <div className="mb-2 flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                <Calendar size={15} />
                <span className="text-xs">Age</span>
              </div>
              <p className="font-semibold">{representative.age} mo</p>
            </div>
          </div>
        )}

        {representative && (
          <div className="flex flex-wrap gap-2">
            {representative.verified && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
                <BadgeCheck size={13} />
                Verified
              </span>
            )}
            {representative.ogEmail && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                OG Email
              </span>
            )}
            {representative.twoFactor && (
              <span className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
                <ShieldCheck size={13} />
                2FA
              </span>
            )}
            {representative.emailAttached && (
              <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
                <Mail size={13} />
                Email
              </span>
            )}
            {representative.phoneAttached && (
              <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400">
                <Phone size={13} />
                Phone
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}

      <div className="flex items-center justify-between border-t border-zinc-200 p-5 dark:border-zinc-800">
        <div>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Price</p>
          <p
            className={`text-2xl font-bold ${
              isSold ? "text-gray-500 dark:text-zinc-400 line-through dark:text-zinc-600" : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {uniformPrice ? money(minPrice) : `From ${money(minPrice)}`}
          </p>
        </div>

        <button
          onClick={() => !isSold && representative && onView(representative.id)}
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