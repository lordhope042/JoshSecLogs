"use client";

import {
  Eye,
  Lock,
  Users,
  BadgeCheck,
  ShieldCheck,
  Mail,
  Phone,
  Layers,
} from "lucide-react";

import { SocialLog, SocialLogCategoryValue, SocialLogPageType } from "@/types/social-log";

export interface SocialLogStockGroup {
  key: string;
  platform: string;
  category: string;
  pageType: string | null;
  country: string | null;
  vpnType: string | null;
  /** Instagram sub-type label, VPN variant label, tutorial label, or
      website-service label — surfaces as the card's sub-line. */
  subType: string | null;
  logs: SocialLog[];
}

export function groupLogsIntoStock(logs: SocialLog[]): SocialLogStockGroup[] {
  const groups = new Map<string, SocialLog[]>();

  for (const log of logs) {
    const key = `${log.platform}|${log.category}|${log.pageType ?? ""}|${log.country ?? ""}|${log.instagramSubType ?? ""}|${log.vpnType ?? ""}|${log.tutorialType ?? ""}|${log.websiteType ?? ""}|${log.followers ?? ""}`;
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
      vpnType: first.vpnType,
      subType: subTypeLabel(first),
      logs: sorted,
    };
  });
}

/*
=====================================
STATIC LISTING TYPES
The fixed set of "sellable types" that should always render a card,
whether or not an admin has actually added stock for it yet.

This encodes the full JoshSecLogs.com catalogue — 10 headings,
40+ enumerated sub-categories — so every product the platform sells
shows up in the grid even at zero stock.

  - FACEBOOK_PAGE splits into its 4 known page types
  - FACEBOOK_COUNTRY renders one card per fixed country (6)
  - TWITTER_FOLLOWERS renders one card per follower tier (5, incl. Empty Aged)
  - INSTAGRAM_FOLLOWERS renders one card per Instagram sub-type (4)
  - VPN renders one card per provider/duration variant (4)
  - TEXTPLUS_NEXTPLUS renders one card per app (2)
  - TIKTOK_FOLLOWERS renders one card per follower tier (4)
  - TIKTOK_COUNTRY renders one card per fixed country (5)
  - TUTORIAL renders one card per ad-platform tutorial (4)
  - WEBSITE_CREATION renders one card per website service (4)

This is purely for what the CARD GRID displays. Actual purchase logic
still runs against groupLogsIntoStock() per exact log, so a buyer
grabbing units from a card only ever receives units matching the
exact variant they opened in Details — never a mix.
=====================================
*/

interface StaticListingType {
  category: SocialLogCategoryValue;
  pageType?: SocialLogPageType;
  country?: string;
  /** Follower tier for *_FOLLOWERS categories (0 = Empty Aged) */
  followers?: number;
  platform?: string;
  instagramSubType?: string;
  vpnType?: string;
  tutorialType?: string;
  websiteType?: string;
}

const STATIC_LISTING_TYPES: StaticListingType[] = [
  // 1. FACEBOOK_PAGE — 4 page types
  { category: "FACEBOOK_PAGE", pageType: "CREATE_PAGE" },
  { category: "FACEBOOK_PAGE", pageType: "CREATED_PAGE" },
  { category: "FACEBOOK_PAGE", pageType: "MULTI_PAGE" },
  { category: "FACEBOOK_PAGE", pageType: "PAGE_WITH_FOLLOWERS" },

  // 2. FACEBOOK_COUNTRY — REMOVED
  // { category: "FACEBOOK_COUNTRY", country: "USA" },
  // { category: "FACEBOOK_COUNTRY", country: "CANADA" },
  // { category: "FACEBOOK_COUNTRY", country: "SPAIN" },
  // { category: "FACEBOOK_COUNTRY", country: "AUSTRALIA" },
  // { category: "FACEBOOK_COUNTRY", country: "NETHERLANDS" },
  // { category: "FACEBOOK_COUNTRY", country: "BELGIUM" },

  // 3. TWITTER_FOLLOWERS — 5 tiers (Empty Aged = 0)
  { category: "TWITTER_FOLLOWERS", followers: 0 },
  { category: "TWITTER_FOLLOWERS", followers: 100 },
  { category: "TWITTER_FOLLOWERS", followers: 200 },
  { category: "TWITTER_FOLLOWERS", followers: 500 },
  

  // 4. INSTAGRAM_FOLLOWERS — 4 sub-types
  { category: "INSTAGRAM_FOLLOWERS", instagramSubType: "MONTHS_OLD" },
  { category: "INSTAGRAM_FOLLOWERS", instagramSubType: "EMPTY_AGED" },
  { category: "INSTAGRAM_FOLLOWERS", instagramSubType: "AGED_500" },
  { category: "INSTAGRAM_FOLLOWERS", instagramSubType: "AGED_1K" },

  // 5. VPN — 4 provider/duration variants
  { category: "VPN", vpnType: "PIA_7D" },
  { category: "VPN", vpnType: "EXPRESS_1M" },
  { category: "VPN", vpnType: "HMA_1M" },
  { category: "VPN", vpnType: "NORD_1M" },

  // 6. TEXTPLUS_NEXTPLUS — 2 apps (distinguished by platform)
  { category: "TEXTPLUS_NEXTPLUS", platform: "TEXTPLUS" },
  { category: "TEXTPLUS_NEXTPLUS", platform: "NEXTPLUS" },

  // 7. TIKTOK_FOLLOWERS — 4 tiers
 
  { category: "TIKTOK_FOLLOWERS", followers: 200 },
  { category: "TIKTOK_FOLLOWERS", followers: 500 },
  { category: "TIKTOK_FOLLOWERS", followers: 1000 },

  // 8. TIKTOK_COUNTRY — 5 fixed countries (aged TikTok)
  { category: "TIKTOK_COUNTRY", country: "USA" },
  { category: "TIKTOK_COUNTRY", country: "UK" },
  { category: "TIKTOK_COUNTRY", country: "CANADA" },
  { category: "TIKTOK_COUNTRY", country: "GERMANY" },
  { category: "TIKTOK_COUNTRY", country: "RANDOM" },

  // 9. TUTORIAL — 4 ad-platform tutorials
  { category: "TUTORIAL", tutorialType: "FACEBOOK_ADS" },
  { category: "TUTORIAL", tutorialType: "INSTAGRAM_ADS" },
  { category: "TUTORIAL", tutorialType: "TIKTOK_ADS" },
  { category: "TUTORIAL", tutorialType: "TWITTER_ADS" },

  // 10. WEBSITE_CREATION — 4 website services
  { category: "WEBSITE_CREATION", websiteType: "LOGS_WEBSITE" },
  { category: "WEBSITE_CREATION", websiteType: "SMS_WEBSITE" },
  { category: "WEBSITE_CREATION", websiteType: "BOTH_WEBSITE" },
  { category: "WEBSITE_CREATION", websiteType: "BOOSTING_WEBSITE" },
    // 11. mails
    { category: "MAIL", platform: "GMAIL" },
  { category: "MAIL", platform: "OUTLOOK" },
  { category: "MAIL", platform: "MAIL" },
];
/*
=====================================
FOLLOWER-TIER BUCKETING HELPERS

The *_FOLLOWERS categories use a fixed set of tier "floors"
(0, 100, 200, 500, 1000 for Twitter; 100, 200, 500, 1000 for
TikTok). A real log may carry a `followers` value that doesn't
exactly equal one of these floors (e.g. the admin typed 350, or
the column is null because an older entry never set it). To make
sure every follower-tier log still renders on a card, we bucket
each log into the nearest tier floor >= its follower count, and
null/undefined into the lowest tier.
=====================================
*/
const FOLLOWER_TIER_FLOORS: Partial<Record<SocialLogCategoryValue, number>> = {
  TWITTER_FOLLOWERS: 0,
  TIKTOK_FOLLOWERS: 100,
};

const FOLLOWER_TIER_FLOORS_ARRAY: Partial<Record<SocialLogCategoryValue, number[]>> = {
  TWITTER_FOLLOWERS: [0, 100, 200, 500, 1000],
  TIKTOK_FOLLOWERS: [100, 200, 500, 1000],
};

export function buildStaticStockGroups(logs: SocialLog[]): SocialLogStockGroup[] {
  return STATIC_LISTING_TYPES.map((type) => {
    const matching = logs.filter((l) => {
      if (l.category !== type.category) return false;
      if (type.pageType && l.pageType !== type.pageType) return false;
      if (type.country && l.country !== type.country) return false;
      if (type.platform && l.platform !== type.platform) return false;
      if (type.instagramSubType && l.instagramSubType !== type.instagramSubType) return false;
      if (type.vpnType && l.vpnType !== type.vpnType) return false;
      if (type.tutorialType && l.tutorialType !== type.tutorialType) return false;
      if (type.websiteType && l.websiteType !== type.websiteType) return false;
      // For *_FOLLOWERS tiers we need resilient bucketing: a log whose
      // `followers` is null OR doesn't exactly equal the tier value would
      // otherwise be invisible. Bucket it into the nearest tier so every
      // Twitter / TikTok / follower-tier log always renders on a card.
      if (type.followers !== undefined) {
        const lf = l.followers;
        if (lf === null || lf === undefined) {
          // null/undefined followers only match the lowest tier (0 / 100)
          return type.followers === FOLLOWER_TIER_FLOORS[type.category];
        }
        if (lf === type.followers) return true;
        // Bucket into the nearest tier: a log with 350 followers should
        // show on the 200 tier (the next-lower tier floor).
        const floors = FOLLOWER_TIER_FLOORS_ARRAY[type.category];
        if (floors) {
          const nearest = floors.filter((f) => lf >= f).pop() ?? floors[0];
          return nearest === type.followers;
        }
        return false;
      }
      return true;
    });

    const sorted = [...matching].sort(
      (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
    );

    const first = sorted[0];

    return {
      key: `${type.category}|${type.pageType ?? ""}|${type.country ?? ""}|${type.platform ?? ""}|${type.instagramSubType ?? ""}|${type.vpnType ?? ""}|${type.tutorialType ?? ""}|${type.websiteType ?? ""}|${type.followers ?? ""}`,
      platform: first?.platform ?? type.platform ?? type.category,
      category: type.category,
      pageType: type.pageType ?? null,
      country: type.country ?? first?.country ?? null,
      vpnType: type.vpnType ?? first?.vpnType ?? null,
      subType: staticSubTypeLabel(type),
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
  TUTORIAL: "Tutorial",
  TIKTOK_COUNTRY: "TikTok",
  TIKTOK_FOLLOWERS: "TikTok",
  WEBSITE_CREATION: "Website Creation",
  MAIL: "Mail",
};

export const PAGE_TYPE_LABELS: Record<string, string> = {
  CREATE_PAGE: "Create Page",
  CREATED_PAGE: "Created Page",
  MULTI_PAGE: "2 Created Page",
  PAGE_WITH_FOLLOWERS: "Created Page with 1K+ Followers",
};

export const INSTAGRAM_SUBTYPE_LABELS: Record<string, string> = {
  MONTHS_OLD: "Months Old Instagram",
  EMPTY_AGED: "Empty Aged Instagram",
  AGED_500: "Aged Instagram with 500+",
  AGED_1K: "Aged Instagram with 1K+",
};

export const VPN_TYPE_LABELS: Record<string, string> = {
  PIA_7D: "7 Days PIA VPN",
  EXPRESS_1M: "Express VPN One Month",
  HMA_1M: "HMA VPN One Month",
  NORD_1M: "Nord VPN One Month",
};

/** VPN brand name used as the card heading (e.g. "Express VPN"). */
export const VPN_HEADING_LABELS: Record<string, string> = {
  PIA_7D: "PIA VPN",
  EXPRESS_1M: "Express VPN",
  HMA_1M: "HMA VPN",
  NORD_1M: "Nord VPN",
};

export const TUTORIAL_TYPE_LABELS: Record<string, string> = {
  FACEBOOK_ADS: "Facebook Ads Tutorial",
  INSTAGRAM_ADS: "Instagram Ads Tutorial",
  TIKTOK_ADS: "TikTok Ads Tutorial",
  TWITTER_ADS: "Twitter Ads Tutorial",
};

export const WEBSITE_TYPE_LABELS: Record<string, string> = {
  LOGS_WEBSITE: "Logs Website",
  SMS_WEBSITE: "SMS Website",
  BOTH_WEBSITE: "Both Logs and SMS Website",
  BOOSTING_WEBSITE: "Boosting Website",
};

export const COUNTRY_LABELS: Record<string, string> = {
  USA: "USA",
  CANADA: "Canada",
  SPAIN: "Spain",
  AUSTRALIA: "Australia",
  NETHERLANDS: "Netherlands",
  BELGIUM: "Belgium",
  UK: "UK",
  GERMANY: "Germany",
  RANDOM: "Random Country",
};

/** Renders a follower tier the way it's picked in the form — "100+",
 *  "1k+", "Empty" for the 0 tier. */
export function formatFollowersTier(value: number): string {
  if (value === 0) return "Empty Aged";
  if (value >= 1000) return `${(value / 1000).toString().replace(/\.0$/, "")}K+`;
  return `${value}+`;
}

/** Sub-line label for a live (non-static) stock group, derived from
 *  whichever sub-type axis its first log populates. */
function subTypeLabel(log: SocialLog): string | null {
  if (log.pageType) return PAGE_TYPE_LABELS[log.pageType] ?? log.pageType;
  if (log.instagramSubType) return INSTAGRAM_SUBTYPE_LABELS[log.instagramSubType] ?? log.instagramSubType;
  if (log.vpnType) return VPN_TYPE_LABELS[log.vpnType] ?? log.vpnType;
  if (log.tutorialType) return TUTORIAL_TYPE_LABELS[log.tutorialType] ?? log.tutorialType;
  if (log.websiteType) return WEBSITE_TYPE_LABELS[log.websiteType] ?? log.websiteType;
  if (log.country) return COUNTRY_LABELS[log.country] ?? log.country;
  if (typeof log.followers === "number" && log.followers >= 0) return formatFollowersTier(log.followers);
  if (log.platform === "TEXTPLUS") return "TextPlus";
  if (log.platform === "NEXTPLUS") return "NextPlus";
  return null;
}

/** Sub-line label for a static (zero-stock) listing type. */
function staticSubTypeLabel(type: StaticListingType): string | null {
  if (type.pageType) return PAGE_TYPE_LABELS[type.pageType] ?? type.pageType;
  if (type.instagramSubType) return INSTAGRAM_SUBTYPE_LABELS[type.instagramSubType] ?? type.instagramSubType;
  if (type.vpnType) return VPN_TYPE_LABELS[type.vpnType] ?? type.vpnType;
  if (type.tutorialType) return TUTORIAL_TYPE_LABELS[type.tutorialType] ?? type.tutorialType;
  if (type.websiteType) return WEBSITE_TYPE_LABELS[type.websiteType] ?? type.websiteType;
  if (type.country) return COUNTRY_LABELS[type.country] ?? type.country;
  if (type.followers !== undefined) return formatFollowersTier(type.followers);
  if (type.platform === "TEXTPLUS") return "TextPlus";
  if (type.platform === "NEXTPLUS") return "NextPlus";
  return null;
}

export default function SocialLogCard({ group, onView, searchQuery }: Props) {
  const representative = group.logs[0];
  const count = group.logs.length;
  const isSold = count === 0;

  const hasFollowers = typeof representative?.followers === "number" && (representative.followers ?? 0) > 0;

  const categoryLabel = CATEGORY_LABELS[group.category] ?? group.platform;
  const subLabel = group.subType ?? (group.pageType ? PAGE_TYPE_LABELS[group.pageType] ?? group.pageType : group.country ?? undefined);

  /*
  Card heading — the specific, distinguishable name for the listing.
  For most categories this is the same as the category label, but for
  three categories we override it so cards under the same tab aren't
  all titled identically:
    • VPN            → brand name (Express VPN, HMA VPN, …)
    • TIKTOK_COUNTRY → "Country TikTok" (USA TikTok, UK TikTok, …)
    • TEXTPLUS_NEXTPLUS → app name (TextPlus / NextPlus)
  The badge on the cover always keeps the generic category label.
  */
    const heading = (() => {
    if (group.category === "VPN" && group.vpnType) {
      return VPN_HEADING_LABELS[group.vpnType] ?? categoryLabel;
    }
    if (group.category === "TIKTOK_COUNTRY" && group.country) {
      const countryName = COUNTRY_LABELS[group.country] ?? group.country;
      return `${countryName} TikTok`;
    }
    if (group.category === "TEXTPLUS_NEXTPLUS") {
      if (group.platform === "TEXTPLUS") return "TextPlus";
      if (group.platform === "NEXTPLUS") return "NextPlus";
    }
    if (group.category === "MAIL") {
      if (group.platform === "GMAIL") return "Gmail Account";
      if (group.platform === "OUTLOOK") return "Outlook Account";
      return "Mail Account";
    }
    return categoryLabel;
  })();

  const prices = group.logs.map((l) => Number(l.price) || 0);
  const hasPrices = prices.length > 0;
  const minPrice = hasPrices ? Math.min(...prices) : 0;
  const maxPrice = hasPrices ? Math.max(...prices) : 0;
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
            <HighlightedText text={heading} query={searchQuery} />
          </h3>
          {subLabel && (
            <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
              <HighlightedText text={subLabel} query={searchQuery} />
            </p>
          )}
        </div>

        {/* Description leads the body — shown first, before anything else */}
        {representative?.description && (
          <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{representative.description}</p>
        )}

        {/* Age removed from the default card view — still visible in the
            details modal's "View full details" section. Followers stays
            here since it's a stronger at-a-glance signal for buyers. */}
        {representative && hasFollowers && (
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
              <div className="mb-2 flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                <Users size={15} />
                <span className="text-xs">Followers</span>
              </div>
              <p className="font-semibold">{representative.followers!.toLocaleString()}</p>
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
            {!hasPrices ? "—" : uniformPrice ? money(minPrice) : `From ${money(minPrice)}`}
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