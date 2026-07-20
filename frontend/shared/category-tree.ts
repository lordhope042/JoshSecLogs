import type { SocialPlatform, SocialLogCategoryValue, SocialLogPageType } from "@/types/social-log";

/**
 * Drives the admin wizard only. The buyer page doesn't need this —
 * it already renders whatever getSocialLogCategories() returns.
 */

export type WizardGroup =
  | "FACEBOOK"
  | "TWITTER"
  | "INSTAGRAM"
  | "TIKTOK"
  | "VPN"
  | "TEXTING_APP"
  | "TELEGRAM"
  | "MAIL";

export interface GroupConfig {
  value: WizardGroup;
  label: string;
  /** Fixed platform, or a short list the admin picks between in step 2 */
  platforms: SocialPlatform[];
  category: SocialLogCategoryValue | ((platform: SocialPlatform) => SocialLogCategoryValue);
  /** True if this group offers a By Type / By Country choice (Facebook, TikTok) */
  hasTypeCountrySplit?: boolean;
  pageTypes?: { value: SocialLogPageType; label: string }[];
  /** True if this category ever populates `followers` */
  hasFollowers?: boolean;
}

export const WIZARD_GROUPS: GroupConfig[] = [
  {
    value: "FACEBOOK",
    label: "Facebook",
    platforms: ["FACEBOOK"],
    category: "FACEBOOK_PAGE", // overridden to FACEBOOK_COUNTRY when country axis picked
    hasTypeCountrySplit: true,
    pageTypes: [
      { value: "CREATE_PAGE", label: "Create Page" },
      { value: "CREATED_PAGE", label: "Created Page" },
      { value: "MULTI_PAGE", label: "Multi Page (2x Created)" },
      { value: "PAGE_WITH_FOLLOWERS", label: "Page with Followers" },
    ],
    hasFollowers: true, // only true when pageType === PAGE_WITH_FOLLOWERS
  },
  {
    value: "TWITTER",
    label: "Twitter / X",
    platforms: ["X"],
    category: "TWITTER_FOLLOWERS",
    hasFollowers: true,
  },
  {
    value: "INSTAGRAM",
    label: "Instagram",
    platforms: ["INSTAGRAM"],
    category: "INSTAGRAM_FOLLOWERS",
    hasFollowers: true,
  },
  {
    value: "TIKTOK",
    label: "TikTok",
    platforms: ["TIKTOK"],
    category: "TIKTOK_FOLLOWERS", // overridden to TIKTOK_COUNTRY when country axis picked
    hasTypeCountrySplit: true,
    hasFollowers: true,
  },
  {
    value: "VPN",
    label: "VPN",
    platforms: ["VPN"],
    category: "VPN",
  },
  {
    value: "TEXTING_APP",
    label: "Texting App",
    platforms: ["TEXTPLUS", "NEXTPLUS"],
    category: "TEXTPLUS_NEXTPLUS",
  },
  {
    value: "TELEGRAM",
    label: "Telegram",
    platforms: ["TELEGRAM"],
    category: "TELEGRAM_ACCOUNT",
  },
  {
    value: "MAIL",
    label: "Mail",
    platforms: ["GMAIL", "OUTLOOK", "MAIL"],
    category: "MAIL",
  },
];

export function getGroup(value: WizardGroup) {
  return WIZARD_GROUPS.find((g) => g.value === value);
}