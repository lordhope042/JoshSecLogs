-- CreateEnum
CREATE TYPE "InstagramSubType" AS ENUM ('MONTHS_OLD', 'EMPTY_AGED', 'AGED_500', 'AGED_1K');

-- CreateEnum
CREATE TYPE "VpnType" AS ENUM ('PIA_7D', 'EXPRESS_1M', 'HMA_1M', 'NORD_1M');

-- CreateEnum
CREATE TYPE "TutorialType" AS ENUM ('FACEBOOK_ADS', 'INSTAGRAM_ADS', 'TIKTOK_ADS', 'TWITTER_ADS');

-- CreateEnum
CREATE TYPE "WebsiteType" AS ENUM ('LOGS_WEBSITE', 'SMS_WEBSITE', 'BOTH_WEBSITE', 'BOOSTING_WEBSITE');

-- AlterEnum: SocialLogCategory
-- PostgreSQL cannot remove values from an enum in-place, so we
-- recreate the type. TELEGRAM_ACCOUNT and MAIL are removed;
-- TUTORIAL and WEBSITE_CREATION are added.
ALTER TABLE "SocialLog" ALTER COLUMN "category" DROP DEFAULT;
ALTER TYPE "SocialLogCategory" RENAME TO "SocialLogCategory_old";
CREATE TYPE "SocialLogCategory" AS ENUM ('FACEBOOK_PAGE', 'FACEBOOK_COUNTRY', 'TWITTER_FOLLOWERS', 'INSTAGRAM_FOLLOWERS', 'VPN', 'TEXTPLUS_NEXTPLUS', 'TIKTOK_COUNTRY', 'TIKTOK_FOLLOWERS', 'TUTORIAL', 'WEBSITE_CREATION');
ALTER TABLE "SocialLog" ALTER COLUMN "category" TYPE "SocialLogCategory" USING "category"::text::"SocialLogCategory";
DROP TYPE "SocialLogCategory_old";

-- AlterTable: add new columns
ALTER TABLE "SocialLog"
  ADD COLUMN "loginUsername" TEXT,
  ADD COLUMN "instagramSubType" "InstagramSubType",
  ADD COLUMN "vpnType" "VpnType",
  ADD COLUMN "tutorialType" "TutorialType",
  ADD COLUMN "websiteType" "WebsiteType";

-- CreateIndex
CREATE INDEX "SocialLog_vpnType_idx" ON "SocialLog"("vpnType");
CREATE INDEX "SocialLog_instagramSubType_idx" ON "SocialLog"("instagramSubType");
CREATE INDEX "SocialLog_tutorialType_idx" ON "SocialLog"("tutorialType");
CREATE INDEX "SocialLog_websiteType_idx" ON "SocialLog"("websiteType");
