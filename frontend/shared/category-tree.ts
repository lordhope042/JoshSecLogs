import type {
  SocialPlatform,
  SocialLogCategoryValue,
  SocialLogPageType,
  InstagramSubType,
  VpnType,
  TutorialType,
  WebsiteType,
  WorkingToolType,
} from "@/types/social-log";

/**
 * Drives the admin wizard only. The buyer page doesn't need this —
 * it already renders whatever getSocialLogCategories() returns.
 *
 * The headings map 1:1 to the user's JoshSecLogs.com spec:
 *   1. FACEBOOK        → FACEBOOK_PAGE (4 page types) + FACEBOOK_COUNTRY (6 countries)
 *   2. TWITTER         → TWITTER_FOLLOWERS (5 tiers)
 *   3. INSTAGRAM       → INSTAGRAM_FOLLOWERS (4 sub-types)
 *   4. TIKTOK          → TIKTOK_FOLLOWERS (4 tiers) + TIKTOK_COUNTRY (5 countries)
 *   5. VPN             → VPN (4 provider/duration variants)
 *   6. TEXTING_APP     → TEXTPLUS_NEXTPLUS (2 apps)
 *   7. TUTORIAL        → TUTORIAL (4 ad-platform tutorials)
 *   8. WEBSITE         → WEBSITE_CREATION (4 website services)
 *   9. MAIL            → MAIL (Gmail / Outlook / Generic Mail)
 *  10. WORKING_TOOLS   → ALL_WORKING_TOOLS (3 tool boxes)
 */

export type WizardGroup =
  | "FACEBOOK"
  | "TWITTER"
  | "INSTAGRAM"
  | "TIKTOK"
  | "VPN"
  | "TEXTING_APP"
  | "TELEGRAM"
  | "TUTORIAL"
  | "WEBSITE"
  | "MAIL"
  | "WORKING_TOOLS";

export interface PageTypeOption {
  value: SocialLogPageType;
  label: string;
}

export interface GroupConfig {
  value: WizardGroup;
  label: string;
  /** Fixed platform, or a short list the admin picks between in step 2 */
  platforms: SocialPlatform[];
  category: SocialLogCategoryValue | ((platform: SocialPlatform) => SocialLogCategoryValue);
  /** True if this group offers a By Type / By Country choice (Facebook, TikTok) */
  hasTypeCountrySplit?: boolean;
  pageTypes?: PageTypeOption[];
  /** True if this category ever populates `followers` */
  hasFollowers?: boolean;
  /** Instagram sub-types (Months Old / Empty Aged / Aged 500+ / Aged 1K+) */
  instagramSubTypes?: { value: InstagramSubType; label: string; followers?: number }[];
  /** VPN provider / duration variants */
  vpnTypes?: { value: VpnType; label: string }[];
  /** Tutorial platform variants */
  tutorialTypes?: { value: TutorialType; label: string }[];
  /** Website creation service variants */
  websiteTypes?: { value: WebsiteType; label: string }[];
  /** Working tool box variants */
  workingToolTypes?: { value: WorkingToolType; label: string }[];
  /** Fixed country list for *_COUNTRY categories */
  countries?: { value: string; label: string; followerRange?: string }[];
}

export const WIZARD_GROUPS: GroupConfig[] = [
  {
    value: "FACEBOOK",
    label: "Facebook",
    platforms: ["FACEBOOK"],
    category: "FACEBOOK_PAGE",
    hasTypeCountrySplit: true,
    pageTypes: [
      { value: "CREATE_PAGE", label: "Create Page Facebook" },
      { value: "CREATED_PAGE", label: "Created Page Facebook" },
      { value: "MULTI_PAGE", label: "2 Created Page Facebook" },
      { value: "PAGE_WITH_FOLLOWERS", label: "Created Page with 1K+ Followers" },
    ],
    countries: [
      { value: "USA", label: "USA", followerRange: "200-300+" },
      { value: "CANADA", label: "Canada", followerRange: "100-200+" },
      { value: "SPAIN", label: "Spain", followerRange: "100-200+" },
      { value: "AUSTRALIA", label: "Australia", followerRange: "100-200+" },
      { value: "NETHERLANDS", label: "Netherlands", followerRange: "100-200+" },
      { value: "BELGIUM", label: "Belgium", followerRange: "100-200+" },
    ],
    hasFollowers: true,
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
    instagramSubTypes: [
      { value: "MONTHS_OLD", label: "Months Old Instagram" },
      { value: "EMPTY_AGED", label: "Empty Aged Instagram", followers: 0 },
      { value: "AGED_500", label: "Aged Instagram with 500+", followers: 500 },
      // { value: "AGED_1K", label: "Aged Instagram with 1K+", followers: 1000 }, // REMOVED
    ],
  },
  {
    value: "TIKTOK",
    label: "TikTok",
    platforms: ["TIKTOK"],
    category: "TIKTOK_FOLLOWERS",
    hasTypeCountrySplit: true,
    hasFollowers: true,
    countries: [
      { value: "USA", label: "USA" },
      { value: "UK", label: "UK" },
      { value: "CANADA", label: "Canada" },
      { value: "GERMANY", label: "Germany" },
      { value: "RANDOM", label: "Random Country" },
    ],
  },
  {
    value: "VPN",
    label: "VPN",
    platforms: ["VPN"],
    category: "VPN",
    vpnTypes: [
      { value: "PIA_7D", label: "7 Days PIA VPN" },
      { value: "EXPRESS_1M", label: "Express VPN One Month" },
      { value: "HMA_1M", label: "HMA VPN One Month" },
      { value: "NORD_1M", label: "Nord VPN One Month" },
    ],
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
    value: "TUTORIAL",
    label: "Tutorial",
    platforms: ["INSTAGRAM", "FACEBOOK", "TIKTOK", "X"],
    category: "TUTORIAL",
    tutorialTypes: [
      { value: "FACEBOOK_ADS", label: "Facebook Ads Tutorial" },
      { value: "INSTAGRAM_ADS", label: "Instagram Ads Tutorial" },
      { value: "TIKTOK_ADS", label: "TikTok Ads Tutorial" },
      { value: "TWITTER_ADS", label: "Twitter Ads Tutorial" },
    ],
  },
  {
    value: "WEBSITE",
    label: "Website Creation",
    platforms: ["VPN"],
    category: "WEBSITE_CREATION",
    websiteTypes: [
      { value: "LOGS_WEBSITE", label: "Logs Website" },
      { value: "SMS_WEBSITE", label: "SMS Website" },
      { value: "BOTH_WEBSITE", label: "Both Logs and SMS Website" },
      { value: "BOOSTING_WEBSITE", label: "Boosting Website" },
    ],
  },
  {
    value: "MAIL",
    label: "Mail",
    platforms: ["GMAIL", "OUTLOOK", "MAIL"],
    category: "MAIL",
  },
  {
    value: "WORKING_TOOLS",
    label: "All Working Tools",
    platforms: ["TOOL"],
    category: "ALL_WORKING_TOOLS",
    workingToolTypes: [
      { value: "TOOL_1", label: "Tool Box 1" },
      { value: "TOOL_2", label: "Tool Box 2" },
      { value: "TOOL_3", label: "Tool Box 3" },
    ],
  },
];

export function getGroup(value: WizardGroup) {
  return WIZARD_GROUPS.find((g) => g.value === value);
}