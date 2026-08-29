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
  | "MAIL"
  | "TOOL"; // ADD THIS for All Working Tools

/*
========================================================
CATEGORY — the sellable listing catalogue.
========================================================
*/

export type SocialLogCategoryValue =
  | "FACEBOOK_PAGE"
  | "TWITTER_FOLLOWERS"
  | "INSTAGRAM_FOLLOWERS"
  | "VPN"
  | "TEXTPLUS_NEXTPLUS"
  | "TELEGRAM_ACCOUNT"
  | "TUTORIAL"
  | "TIKTOK_COUNTRY"
  | "TIKTOK_FOLLOWERS"
  | "WEBSITE_CREATION"
  | "MAIL"
  | "ALL_WORKING_TOOLS"; // ADD THIS

// Only meaningful when category = FACEBOOK_PAGE
export type SocialLogPageType =
  | "CREATE_PAGE"
  | "CREATED_PAGE"
  | "MULTI_PAGE"
  | "PAGE_WITH_FOLLOWERS";

/*
========================================================
SUB-TYPE ENUMS
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

// ADD THIS — Working Tool Type for the 3 boxes
export type WorkingToolType =
  | "TOOL_1"
  | "TOOL_2"
  | "TOOL_3";

// FACEBOOK_COUNTRY — the 6 fixed countries.
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

  // INSTAGRAM_FOLLOWERS sub-category
  instagramSubType: InstagramSubType | null;

  // VPN provider / duration variant
  vpnType: VpnType | null;

  // TUTORIAL variant
  tutorialType: TutorialType | null;

  // WEBSITE_CREATION variant
  websiteType: WebsiteType | null;

  // ADD THIS — Working Tool Type
  workingToolType: WorkingToolType | null;

  // ADD THIS — Tool Link
  toolLink: string | null;

  username: string;

  age: number;

  // Tier threshold
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

  // ADD THIS
  workingToolType: WorkingToolType | null;

  // ADD THIS
  toolLink: string | null;

  followers: number | null;

  username: string;

  country: string | null;

  price: number;

  status: SocialLogStatus;

  purchasedAt: string | null;

  loginUsername: string | null;

  loginEmail: string | null;

  emailPassword: string | null;

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

  // ADD THIS
  workingToolType?: WorkingToolType;

  // ADD THIS
  toolLink?: string;

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

  loginUsername?: string;

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