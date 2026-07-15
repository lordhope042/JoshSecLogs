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
  | "OUTLOOK";

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
  category: any;
  id: string;

  platform: SocialPlatform;

  country: string;

  username: string;

  age: number;

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

  username: string;

  country: string;

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

  country: string;

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
CATEGORY
========================================================
*/

export interface SocialLogCategory {
  count: number;
  platform: SocialPlatform;

  total: number;
}

/*
========================================================
FILTERS
========================================================
*/

export interface SocialLogFilters {
  platform?: SocialPlatform;

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