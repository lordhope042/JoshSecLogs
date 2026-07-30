-- Idempotent migration: guards every statement with IF NOT EXISTS /
-- DROP IF EXISTS so it can be re-run after a partial failure.
-- The first run created the 4 sub-type enums and the SocialLogCategory_old
-- rename before failing. This version handles all possible partial states.

-- ============================================================================
-- 1. Sub-type enums (may already exist from the failed first run)
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE "InstagramSubType" AS ENUM ('MONTHS_OLD', 'EMPTY_AGED', 'AGED_500', 'AGED_1K');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "VpnType" AS ENUM ('PIA_7D', 'EXPRESS_1M', 'HMA_1M', 'NORD_1M');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TutorialType" AS ENUM ('FACEBOOK_ADS', 'INSTAGRAM_ADS', 'TIKTOK_ADS', 'TWITTER_ADS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WebsiteType" AS ENUM ('LOGS_WEBSITE', 'SMS_WEBSITE', 'BOTH_WEBSITE', 'BOOSTING_WEBSITE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. SocialLogCategory enum recreation
--    PostgreSQL cannot remove values from an enum in-place, so we recreate
--    the type. TELEGRAM_ACCOUNT and MAIL are kept (existing rows use them);
--    TUTORIAL and WEBSITE_CREATION are added.
--
--    The first failed run may have already renamed the old type to
--    SocialLogCategory_old. We detect which state we're in:
--      a) "SocialLogCategory" still exists → normal path (rename + recreate)
--      b) "SocialLogCategory_old" exists but "SocialLogCategory" does not
--         → the rename happened but the CREATE failed; just create it.
--      c) "SocialLogCategory" already has the new values → skip entirely.
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'SocialLogCategory' AND n.nspname = 'public'
  ) THEN
    -- Check if it still has the OLD shape (no TUTORIAL value).
    -- If TUTORIAL is already present we've already done this — skip.
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'SocialLogCategory' AND n.nspname = 'public'
        AND e.enumlabel = 'TUTORIAL'
    ) THEN
      ALTER TABLE "SocialLog" ALTER COLUMN "category" DROP DEFAULT;
      ALTER TYPE "SocialLogCategory" RENAME TO "SocialLogCategory_old";
      CREATE TYPE "SocialLogCategory" AS ENUM (
        'FACEBOOK_PAGE', 'FACEBOOK_COUNTRY', 'TWITTER_FOLLOWERS',
        'INSTAGRAM_FOLLOWERS', 'VPN', 'TEXTPLUS_NEXTPLUS',
        'TELEGRAM_ACCOUNT', 'TIKTOK_COUNTRY', 'TIKTOK_FOLLOWERS',
        'TUTORIAL', 'WEBSITE_CREATION', 'MAIL'
      );
      ALTER TABLE "SocialLog" ALTER COLUMN "category" TYPE "SocialLogCategory"
        USING "category"::text::"SocialLogCategory";
      DROP TYPE "SocialLogCategory_old";
    END IF;
  ELSIF EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'SocialLogCategory_old' AND n.nspname = 'public'
  ) THEN
    -- The rename happened but the CREATE TYPE failed on the first run.
    -- Create the new type from the renamed old one's data.
    CREATE TYPE "SocialLogCategory" AS ENUM (
      'FACEBOOK_PAGE', 'FACEBOOK_COUNTRY', 'TWITTER_FOLLOWERS',
      'INSTAGRAM_FOLLOWERS', 'VPN', 'TEXTPLUS_NEXTPLUS',
      'TELEGRAM_ACCOUNT', 'TIKTOK_COUNTRY', 'TIKTOK_FOLLOWERS',
      'TUTORIAL', 'WEBSITE_CREATION', 'MAIL'
    );
    ALTER TABLE "SocialLog" ALTER COLUMN "category" TYPE "SocialLogCategory"
      USING "category"::text::"SocialLogCategory";
    DROP TYPE "SocialLogCategory_old";
  END IF;
END $$;

-- ============================================================================
-- 3. New columns on SocialLog (guard with IF NOT EXISTS via DO block)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SocialLog'
      AND column_name = 'loginUsername'
  ) THEN
    ALTER TABLE "SocialLog" ADD COLUMN "loginUsername" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SocialLog'
      AND column_name = 'instagramSubType'
  ) THEN
    ALTER TABLE "SocialLog" ADD COLUMN "instagramSubType" "InstagramSubType";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SocialLog'
      AND column_name = 'vpnType'
  ) THEN
    ALTER TABLE "SocialLog" ADD COLUMN "vpnType" "VpnType";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SocialLog'
      AND column_name = 'tutorialType'
  ) THEN
    ALTER TABLE "SocialLog" ADD COLUMN "tutorialType" "TutorialType";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'SocialLog'
      AND column_name = 'websiteType'
  ) THEN
    ALTER TABLE "SocialLog" ADD COLUMN "websiteType" "WebsiteType";
  END IF;
END $$;

-- ============================================================================
-- 4. Indexes (guard with IF NOT EXISTS)
-- ============================================================================
CREATE INDEX IF NOT EXISTS "SocialLog_vpnType_idx" ON "SocialLog"("vpnType");
CREATE INDEX IF NOT EXISTS "SocialLog_instagramSubType_idx" ON "SocialLog"("instagramSubType");
CREATE INDEX IF NOT EXISTS "SocialLog_tutorialType_idx" ON "SocialLog"("tutorialType");
CREATE INDEX IF NOT EXISTS "SocialLog_websiteType_idx" ON "SocialLog"("websiteType");
