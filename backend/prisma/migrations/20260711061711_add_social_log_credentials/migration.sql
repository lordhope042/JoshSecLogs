-- AlterTable
ALTER TABLE "SocialLog" ADD COLUMN     "purchasedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SocialLogCredential" (
    "id" TEXT NOT NULL,
    "socialLogId" TEXT NOT NULL,
    "loginEmail" TEXT,
    "loginPhone" TEXT,
    "password" TEXT,
    "twoFactorSecret" TEXT,
    "recoveryEmail" TEXT,
    "backupCodes" JSONB,
    "cookies" JSONB,
    "notes" TEXT,

    CONSTRAINT "SocialLogCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialLogCredential_socialLogId_key" ON "SocialLogCredential"("socialLogId");

-- AddForeignKey
ALTER TABLE "SocialLogCredential" ADD CONSTRAINT "SocialLogCredential_socialLogId_fkey" FOREIGN KEY ("socialLogId") REFERENCES "SocialLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
