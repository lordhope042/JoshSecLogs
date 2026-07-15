import {
  SocialLog,
} from "./social-log";

/*
=====================================
PURCHASED SOCIAL ACCOUNT
=====================================
Returned ONLY after purchase or from
GET /social-logs/my-purchases
=====================================
*/

export interface PurchasedSocialLog
  extends SocialLog {
  /*
  Login Credentials
  */

  loginEmail: string | null;

  loginPhone: string | null;

  password: string | null;

  /*
  Recovery
  */

  recoveryEmail: string | null;

  backupCodes: string[] | null;

  /*
  2FA
  */

  twoFactorSecret: string | null;

  /*
  Browser Session
  */

  cookies: Record<
    string,
    unknown
  > | null;

  /*
  Extra Information
  */

  notes: string | null;
}