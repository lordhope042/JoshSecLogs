-- AlterTable
ALTER TABLE "SocialLog" ADD COLUMN     "purchasedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SocialLog_buyerId_idx" ON "SocialLog"("buyerId");

-- CreateIndex
CREATE INDEX "SocialLog_status_idx" ON "SocialLog"("status");

-- CreateIndex
CREATE INDEX "SocialLog_platform_idx" ON "SocialLog"("platform");
