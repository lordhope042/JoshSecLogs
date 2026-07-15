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
  | "TELEGRAM_ACCOUNT"
  | "TIKTOK_COUNTRY"
  | "TIKTOK_FOLLOWERS"
  | "MAIL";

// Only meaningful when category = FACEBOOK_PAGE
export type SocialLogPageType =
  | "CREATE_PAGE"
  | "CREATED_PAGE"
  | "MULTI_PAGE"
  | "PAGE_WITH_FOLLOWERS";

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
by the new `category` field (was grouped by `platform`
before this system existed).
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