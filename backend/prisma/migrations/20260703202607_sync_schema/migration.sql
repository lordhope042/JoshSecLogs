/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsedAt` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `activationType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `activationType` on the `PricingRule` table. All the data in the column will be lost.
  - You are about to drop the column `providerSmsId` on the `SmsMessage` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `SmsMessage` table. All the data in the column will be lost.
  - You are about to drop the column `referredById` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `balanceAfter` on the `WalletTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `balanceBefore` on the `WalletTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `WalletTransaction` table. All the data in the column will be lost.
  - You are about to drop the `PaymentWebhook` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fullText` to the `SmsMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referredById_fkey";

-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- DropIndex
DROP INDEX "Order_providerOrderId_key";

-- DropIndex
DROP INDEX "Payment_createdAt_idx";

-- DropIndex
DROP INDEX "PricingRule_country_service_activationType_key";

-- DropIndex
DROP INDEX "Wallet_userId_idx";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "expiresAt",
DROP COLUMN "lastUsedAt";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "activationType",
DROP COLUMN "cancelledAt",
DROP COLUMN "completedAt",
DROP COLUMN "provider",
ALTER COLUMN "providerOrderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "currency",
DROP COLUMN "paidAt",
DROP COLUMN "provider",
DROP COLUMN "verifiedAt";

-- AlterTable
ALTER TABLE "PricingRule" DROP COLUMN "activationType";

-- AlterTable
ALTER TABLE "SmsMessage" DROP COLUMN "providerSmsId",
DROP COLUMN "text",
ADD COLUMN     "fullText" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referredById",
ADD COLUMN     "referredBy" TEXT,
ALTER COLUMN "referralCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WalletTransaction" DROP COLUMN "balanceAfter",
DROP COLUMN "balanceBefore",
DROP COLUMN "metadata";

-- DropTable
DROP TABLE "PaymentWebhook";

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "Provider";

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "PricingRule_country_idx" ON "PricingRule"("country");

-- CreateIndex
CREATE INDEX "PricingRule_service_idx" ON "PricingRule"("service");
