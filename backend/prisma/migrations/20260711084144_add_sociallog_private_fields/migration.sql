/*
  Warnings:

  - You are about to drop the column `purchasedAt` on the `SocialLog` table. All the data in the column will be lost.
  - You are about to drop the `SocialLogCredential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialLogCredential" DROP CONSTRAINT "SocialLogCredential_socialLogId_fkey";

-- AlterTable
ALTER TABLE "SocialLog" DROP COLUMN "purchasedAt",
ADD COLUMN     "backupCodes" JSONB,
ADD COLUMN     "cookies" JSONB,
ADD COLUMN     "loginEmail" TEXT,
ADD COLUMN     "loginPhone" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "recoveryEmail" TEXT,
ADD COLUMN     "twoFactorSecret" TEXT;

-- DropTable
DROP TABLE "SocialLogCredential";
