/*
  Warnings:

  - Added the required column `category` to the `SocialLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialLogCategory" AS ENUM ('FACEBOOK_PAGE', 'FACEBOOK_COUNTRY', 'TWITTER_FOLLOWERS', 'INSTAGRAM_FOLLOWERS', 'VPN', 'TEXTPLUS_NEXTPLUS', 'TELEGRAM_ACCOUNT', 'TIKTOK_COUNTRY', 'TIKTOK_FOLLOWERS', 'MAIL');

-- CreateEnum
CREATE TYPE "SocialLogPageType" AS ENUM ('CREATE_PAGE', 'CREATED_PAGE', 'MULTI_PAGE', 'PAGE_WITH_FOLLOWERS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SocialPlatform" ADD VALUE 'VPN';
ALTER TYPE "SocialPlatform" ADD VALUE 'TEXTPLUS';
ALTER TYPE "SocialPlatform" ADD VALUE 'NEXTPLUS';
ALTER TYPE "SocialPlatform" ADD VALUE 'MAIL';

-- AlterTable
ALTER TABLE "SocialLog" ADD COLUMN     "category" "SocialLogCategory",
ADD COLUMN     "pageType" "SocialLogPageType",
ALTER COLUMN "country" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "SocialLog_category_idx" ON "SocialLog"("category");