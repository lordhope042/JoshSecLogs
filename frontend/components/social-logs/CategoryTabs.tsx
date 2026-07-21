"use client";

import { useState } from "react";

import {
  FaFacebook,
  FaTelegramPlane,
  FaTiktok,
  FaShieldAlt,
} from "react-icons/fa";

import { FaCommentSms, FaXTwitter } from "react-icons/fa6";

import { FaInstagram } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

import { IconType } from "react-icons";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { SocialLogCategoryValue } from "@/types/social-log";

interface Props {
  categories: SocialLogCategoryValue[];
  selected: SocialLogCategoryValue | null;
  onSelect: (category: SocialLogCategoryValue) => void;
  /** Controlled search value — lives in the parent so the page's card
      grid and these tabs always filter off the exact same query. */
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const labels: Record<SocialLogCategoryValue, string> = {
  FACEBOOK_PAGE: "Facebook — Page",
  FACEBOOK_COUNTRY: "Facebook — By Country",
  TWITTER_FOLLOWERS: "Twitter — Followers",
  INSTAGRAM_FOLLOWERS: "Instagram — Followers",
  VPN: "VPN",
  TEXTPLUS_NEXTPLUS: "Textplus & Nextplus",
  TELEGRAM_ACCOUNT: "Telegram",
  TIKTOK_COUNTRY: "TikTok — By Country",
  TIKTOK_FOLLOWERS: "TikTok — Followers",
  MAIL: "Mail",
};

const icons: Record<SocialLogCategoryValue, IconType> = {
  FACEBOOK_PAGE: FaFacebook,
  FACEBOOK_COUNTRY: FaFacebook,
  TWITTER_FOLLOWERS: FaXTwitter,
  INSTAGRAM_FOLLOWERS: FaInstagram,
  VPN: FaShieldAlt,
  TEXTPLUS_NEXTPLUS: FaCommentSms,
  TELEGRAM_ACCOUNT: FaTelegramPlane,
  TIKTOK_COUNTRY: FaTiktok,
  TIKTOK_FOLLOWERS: FaTiktok,
  MAIL: MdOutlineMail,
};

const ALL_CATEGORIES = Object.keys(labels) as SocialLogCategoryValue[];

export default function CategoryTabs({ categories, selected, onSelect, searchQuery, onSearchChange }: Props) {
  const [showAll, setShowAll] = useState(false);

  function handleSelect(category: SocialLogCategoryValue) {
    onSelect(category);
  }

  // Off: only categories the parent passed in (presumably ones with stock).
  // On: every category that exists at all, per the fixed enum above —
  // lets you click into a category with zero current stock.
  const sourceCategories = showAll ? ALL_CATEGORIES : categories;

  // Always sorted with the selected category first, then best text-match
  // first among the rest — this applies whether or not there's a search
  // query, so the active tab pins to the front just from being selected.
  const visibleCategories = sourceCategories
    .filter((c) => labels[c].toLowerCase().includes(searchQuery.toLowerCase()))
    .map((c, index) => ({ c, index }))
    .sort((a, b) => {
      if (a.c === selected) return -1;
      if (b.c === selected) return 1;
      const q = searchQuery.toLowerCase();
      const aStarts = labels[a.c].toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = labels[b.c].toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.index - b.index;
    })
    .map(({ c }) => c);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-3">
        {/* Search box + show-all toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search categories…"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-10 text-sm text-zinc-900 outline-none transition focus:border-orange-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            title={showAll ? "Showing every category, including empty stock" : "Showing only categories with stock"}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-medium transition",
              showAll
                ? "border-orange-400 bg-orange-50 text-orange-600 dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-orange-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            {showAll ? "Showing all" : "Show all"}
          </button>
        </div>

        {/* Live result count — only shown while actively searching */}
        {searchQuery.trim() && (
          <p className="px-1 text-xs text-gray-400 dark:text-zinc-500">
            {visibleCategories.length} categor{visibleCategories.length === 1 ? "y" : "ies"} match "{searchQuery.trim()}"
          </p>
        )}

        {/* Tabs — selected one always first, filtered by search when present */}
        <div className="flex gap-3 overflow-x-auto">
          {visibleCategories.length === 0 ? (
            <p className="px-2 py-3 text-sm text-gray-400 dark:text-zinc-500">
              No {showAll ? "" : "available "}categories match "{searchQuery}".
              {!showAll && (
                <button onClick={() => setShowAll(true)} className="ml-1 font-medium text-orange-500 hover:underline">
                  Show all categories?
                </button>
              )}
            </p>
          ) : (
            visibleCategories.map((category) => {
              const active = selected === category;
              const Icon = icons[category];

              return (
                <button
                  key={category}
                  onClick={() => handleSelect(category)}
                  className={cn(
                    "group flex shrink-0 items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-500 dark:hover:bg-zinc-700",
                  )}
                >
                  <Icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
                  <span>{labels[category]}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}