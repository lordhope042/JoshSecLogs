-- Add missing values to SocialLogCategory enum.
-- Uses ALTER TYPE ADD VALUE IF NOT EXISTS (idempotent, safe to re-run).
-- NOTE: ALTER TYPE ADD VALUE cannot run inside a transaction block,
-- so each statement is standalone. Prisma migrate runs each statement
-- separately, which is fine.
ALTER TYPE "SocialLogCategory" ADD VALUE IF NOT EXISTS 'TELEGRAM_ACCOUNT';
ALTER TYPE "SocialLogCategory" ADD VALUE IF NOT EXISTS 'TUTORIAL';
ALTER TYPE "SocialLogCategory" ADD VALUE IF NOT EXISTS 'WEBSITE_CREATION';
ALTER TYPE "SocialLogCategory" ADD VALUE IF NOT EXISTS 'MAIL';

-- CreateEnum: sub-type enums (guarded for idempotency)
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

-- AlterTable: add the 5 new columns (guarded for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='SocialLog' AND column_name='loginUsername') THEN
    ALTER TABLE "SocialLog" ADD COLUMN "loginUsername" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='SocialLog' AND column_name='instagramSubType') THEN
    ALTER TABLE "SocialLog" ADD COLUMN "instagramSubType" "InstagramSubType";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='SocialLog' AND column_name='vpnType') THEN
    ALTER TABLE "SocialLog" ADD COLUMN "vpnType" "VpnType";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='SocialLog' AND column_name='tutorialType') THEN
    ALTER TABLE "SocialLog" ADD COLUMN "tutorialType" "TutorialType";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='SocialLog' AND column_name='websiteType') THEN
    ALTER TABLE "SocialLog" ADD COLUMN "websiteType" "WebsiteType";
  END IF;
END $$;

-- CreateIndex (guarded for idempotency)
CREATE INDEX IF NOT EXISTS "SocialLog_vpnType_idx" ON "SocialLog"("vpnType");
CREATE INDEX IF NOT EXISTS "SocialLog_instagramSubType_idx" ON "SocialLog"("instagramSubType");
CREATE INDEX IF NOT EXISTS "SocialLog_tutorialType_idx" ON "SocialLog"("tutorialType");
CREATE INDEX IF NOT EXISTS "SocialLog_websiteType_idx" ON "SocialLog"("websiteType");
