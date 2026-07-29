/*
========================================================
SOCIAL PLATFORMS
========================================================
*/

export type SocialPlatform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "X"
  | "SNAPCHAT"
  | "TELEGRAM"
  | "DISCORD"
  | "REDDIT"
  | "LINKEDIN"
  | "YOUTUBE"
  | "GMAIL"
  | "OUTLOOK"
  | "VPN"
  | "TEXTPLUS"
  | "NEXTPLUS"
  | "MAIL";

/*
========================================================
CATEGORY — the 10-item sellable listing catalogue.
Each SocialLog belongs to exactly one of these; this is
what CategoryTabs / useSocialLogs filter on now, not
SocialPlatform directly (Facebook alone spans two).
========================================================
*/

export type SocialLogCategoryValue =
  | "FACEBOOK_PAGE"
  | "FACEBOOK_COUNTRY"
  | "TWITTER_FOLLOWERS"
  | "INSTAGRAM_FOLLOWERS"
  | "VPN"
  | "TEXTPLUS_NEXTPLUS"
  | "TUTORIAL"
  | "TIKTOK_COUNTRY"
  | "TIKTOK_FOLLOWERS"
  | "WEBSITE_CREATION";

// Only meaningful when category = FACEBOOK_PAGE
export type SocialLogPageType =
  | "CREATE_PAGE"
  | "CREATED_PAGE"
  | "MULTI_PAGE"
  | "PAGE_WITH_FOLLOWERS";

/*
========================================================
SUB-TYPE ENUMS
Each sells a fixed, enumerated set of variants within a
single heading. These drive the admin form's quick-pick
buttons and the buyer card grid's one-card-per-variant
behaviour (STATIC_LISTING_TYPES in SocialLogCard).
========================================================
*/

// INSTAGRAM_FOLLOWERS — the 4 Instagram sub-categories.
export type InstagramSubType =
  | "MONTHS_OLD"
  | "EMPTY_AGED"
  | "AGED_500"
  | "AGED_1K";

// VPN — the 4 VPN provider / duration variants.
export type VpnType =
  | "PIA_7D"
  | "EXPRESS_1M"
  | "HMA_1M"
  | "NORD_1M";

// TUTORIAL — the 4 ad-platform tutorial variants.
export type TutorialType =
  | "FACEBOOK_ADS"
  | "INSTAGRAM_ADS"
  | "TIKTOK_ADS"
  | "TWITTER_ADS";

// WEBSITE_CREATION — the 4 website-build service variants.
export type WebsiteType =
  | "LOGS_WEBSITE"
  | "SMS_WEBSITE"
  | "BOTH_WEBSITE"
  | "BOOSTING_WEBSITE";

// FACEBOOK_COUNTRY — the 6 fixed countries, each tied to a
// follower range. Used by the admin form's country picker
// and the card grid so every country always renders.
export type FacebookCountry =
  | "USA"
  | "CANADA"
  | "SPAIN"
  | "AUSTRALIA"
  | "NETHERLANDS"
  | "BELGIUM";

// TIKTOK_COUNTRY — the 5 fixed countries for aged TikTok.
export type TiktokCountry =
  | "USA"
  | "UK"
  | "CANADA"
  | "GERMANY"
  | "RANDOM";

/*
========================================================
STATUS
========================================================
*/

export type SocialLogStatus =
  | "AVAILABLE"
  | "SOLD";

/*
========================================================
SORT
========================================================
*/

export type SocialLogSort =
  | "price_desc"
  | "price_asc"
  | "followers_desc"
  | "followers_asc"
  | "newest"
  | "oldest";

/*
========================================================
COOKIES
========================================================
*/

export type SocialLogCookies = Record<
  string,
  any
>;

/*
========================================================
PUBLIC SOCIAL ACCOUNT
========================================================
*/

export interface SocialLog {
  id: string;

  platform: SocialPlatform;

  category: SocialLogCategoryValue;

  // Only populated for FACEBOOK_COUNTRY / TIKTOK_COUNTRY
  country: string | null;

  // Only populated for FACEBOOK_PAGE
  pageType: SocialLogPageType | null;

  // INSTAGRAM_FOLLOWERS sub-category (Months Old / Empty Aged / Aged 500+ / Aged 1K+)
  instagramSubType: InstagramSubType | null;

  // VPN provider / duration variant
  vpnType: VpnType | null;

  // TUTORIAL variant (which platform's ads tutorial)
  tutorialType: TutorialType | null;

  // WEBSITE_CREATION variant (which website build service)
  websiteType: WebsiteType | null;

  username: string;

  age: number;

  // Tier threshold — only populated for TWITTER_FOLLOWERS /
  // INSTAGRAM_FOLLOWERS / TIKTOK_FOLLOWERS
  followers: number | null;

  price: number;

  emailAttached: boolean;

  phoneAttached: boolean;

  twoFactor: boolean;

  ogEmail: boolean;

  verified: boolean;

  description: string | null;

  image: string | null;

  status: SocialLogStatus;

  buyerId: string | null;

  purchasedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

/*
========================================================
PURCHASED ACCOUNT
Returned ONLY after purchase or from
GET /social-logs/my-purchases/:id

NOTE: field is `password`, not `accountPassword` —
the repository's select returns the raw Prisma column
name on read. `accountPassword` is only used as the
*input* field name in CreateSocialLogDto/UpdateSocialLogDto
when submitting a new password, never on read.
========================================================
*/

export interface PurchasedSocialLog {
  id: string;

  platform: SocialPlatform;

  category: SocialLogCategoryValue;

  pageType: SocialLogPageType | null;

  instagramSubType: InstagramSubType | null;

  vpnType: VpnType | null;

  tutorialType: TutorialType | null;

  websiteType: WebsiteType | null;

  followers: number | null;

  username: string;

  country: string | null;

  price: number;

  status: SocialLogStatus;

  purchasedAt: string | null;

  loginEmail: string | null;

  loginPhone: string | null;

  password: string | null;

  twoFactorSecret: string | null;

  recoveryEmail: string | null;

  backupCodes: string[] | null;

  cookies: SocialLogCookies | null;

  notes: string | null;
}

/*
========================================================
CREATE
========================================================
*/

export interface CreateSocialLogDto {
  platform: SocialPlatform;

  category: SocialLogCategoryValue;

  // Only required for FACEBOOK_COUNTRY / TIKTOK_COUNTRY
  country?: string;

  // Only meaningful for FACEBOOK_PAGE
  pageType?: SocialLogPageType;

  // INSTAGRAM_FOLLOWERS sub-category
  instagramSubType?: InstagramSubType;

  // VPN provider / duration variant
  vpnType?: VpnType;

  // TUTORIAL variant
  tutorialType?: TutorialType;

  // WEBSITE_CREATION variant
  websiteType?: WebsiteType;

  username: string;

  age: number;

  followers?: number;

  price: number;

  emailAttached?: boolean;

  phoneAttached?: boolean;

  twoFactor?: boolean;

  ogEmail?: boolean;

  verified?: boolean;

  description?: string;

  image?: string;

  /*
  PRIVATE DETAILS
  */

  loginEmail?: string;

  loginPhone?: string;

  accountPassword?: string;

  twoFactorSecret?: string;

  recoveryEmail?: string;

  backupCodes?: string[];

  cookies?: SocialLogCookies;

  notes?: string;
}

/*
========================================================
UPDATE
========================================================
*/

export interface UpdateSocialLogDto
  extends Partial<CreateSocialLogDto> {}

/*
========================================================
CATEGORY TAB SUMMARY
GET /social-logs/categories — one entry per tab, grouped
by the `category` field.
========================================================
*/

export interface SocialLogCategory {
  count: number;
  category: SocialLogCategoryValue;

  total: number;
}

/*
========================================================
FILTERS
========================================================
*/

export interface SocialLogFilters {
  platform?: SocialPlatform;

  category?: SocialLogCategoryValue;

  country?: string;

  status?: SocialLogStatus;

  search?: string;

  sort?: SocialLogSort;

  page?: number;

  limit?: number;
}

/*
========================================================
STATS
========================================================
*/

export interface SocialLogStats {
  total: number;

  available: number;

  sold: number;

  revenue: number;
}

/*
========================================================
PURCHASE RESPONSE
========================================================
*/

export interface PurchaseSocialLogResponse {
  success: boolean;

  message: string;

  account: PurchasedSocialLog;
}

/*
========================================================
PAGINATION
========================================================
*/

export interface PaginationMeta {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

export interface PaginatedSocialLogs {
  data: SocialLog[];

  meta: PaginationMeta;
}

/*
========================================================
GENERIC API RESPONSE
========================================================
*/

export interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}