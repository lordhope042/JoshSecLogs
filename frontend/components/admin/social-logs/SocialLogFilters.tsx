"use client";

import { Search } from "lucide-react";

import {
  SocialLogFilters as Filters,
  SocialPlatform,
  SocialLogCategoryValue,
  SocialLogStatus,
  SocialLogSort,
} from "@/types/social-log";

interface Props {
  filters: Filters;
  onChange: (value: Partial<Filters>) => void;
}

const platforms: SocialPlatform[] = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "X",
  "SNAPCHAT",
  "TELEGRAM",
  "DISCORD",
  "REDDIT",
  "LINKEDIN",
  "YOUTUBE",
  "GMAIL",
  "OUTLOOK",
  "VPN",
  "TEXTPLUS",
  "NEXTPLUS",
  "MAIL",
];

const categories: { value: SocialLogCategoryValue; label: string }[] = [
  { value: "FACEBOOK_PAGE", label: "Facebook — Page" },
  { value: "FACEBOOK_COUNTRY", label: "Facebook — By Country" },
  { value: "TWITTER_FOLLOWERS", label: "Twitter — Followers" },
  { value: "INSTAGRAM_FOLLOWERS", label: "Instagram — Followers" },
  { value: "VPN", label: "VPN" },
  { value: "TEXTPLUS_NEXTPLUS", label: "Textplus & Nextplus" },
  { value: "TELEGRAM_ACCOUNT", label: "Telegram" },
  { value: "TIKTOK_COUNTRY", label: "TikTok — By Country" },
  { value: "TIKTOK_FOLLOWERS", label: "TikTok — Followers" },
  { value: "MAIL", label: "Mail" },
];

const statuses: SocialLogStatus[] = [
  "AVAILABLE",
  "SOLD",
];

const sortOptions: {
  value: SocialLogSort;
  label: string;
}[] = [
  {
    value: "price_desc",
    label: "Highest Price",
  },
  {
    value: "price_asc",
    label: "Lowest Price",
  },
  {
    value: "followers_desc",
    label: "Most Followers",
  },
  {
    value: "followers_asc",
    label: "Least Followers",
  },
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "oldest",
    label: "Oldest",
  },
];

export default function SocialLogFilters({
  filters,
  onChange,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search username..."
            value={filters.search ?? ""}
            onChange={(e) =>
              onChange({
                search: e.target.value,
              })
            }
            className="w-full rounded-xl border py-2 pl-10 pr-3 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filters.category ?? ""}
          onChange={(e) =>
            onChange({
              category: e.target.value
                ? (e.target.value as SocialLogCategoryValue)
                : undefined,
            })
          }
          className="rounded-xl border p-2 outline-none focus:border-orange-500"
        >
          <option value="">
            All Categories
          </option>

          {categories.map((cat) => (
            <option
              key={cat.value}
              value={cat.value}
            >
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={filters.platform ?? ""}
          onChange={(e) =>
            onChange({
              platform: e.target.value
                ? (e.target.value as SocialPlatform)
                : undefined,
            })
          }
          className="rounded-xl border p-2 outline-none focus:border-orange-500"
        >
          <option value="">
            All Platforms
          </option>

          {platforms.map((platform) => (
            <option
              key={platform}
              value={platform}
            >
              {platform}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            onChange({
              status: e.target.value
                ? (e.target.value as SocialLogStatus)
                : undefined,
            })
          }
          className="rounded-xl border p-2 outline-none focus:border-orange-500"
        >
          <option value="">
            All Status
          </option>

          {statuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status === "AVAILABLE"
                ? "Available"
                : "Sold"}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Country"
          value={filters.country ?? ""}
          onChange={(e) =>
            onChange({
              country: e.target.value,
            })
          }
          className="rounded-xl border p-2 outline-none focus:border-orange-500"
        />

        <select
          value={filters.sort ?? ""}
          onChange={(e) =>
            onChange({
              sort: e.target.value
                ? (e.target.value as SocialLogSort)
                : undefined,
            })
          }
          className="rounded-xl border p-2 outline-none focus:border-orange-500"
        >
          <option value="">
            Sort By
          </option>

          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
