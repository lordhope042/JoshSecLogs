/*
  Warnings:

  - You are about to alter the column `providerCostUsd` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,4)`.
  - You are about to alter the column `sellingPriceNgn` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `fixedMarkupNgn` on the `PricingRule` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to drop the column `fullText` on the `SmsMessage` table. All the data in the column will be lost.
  - You are about to drop the column `referredBy` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `amount` on the `WalletTransaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - A unique constraint covering the columns `[providerOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[country,service,activationType]` on the table `PricingRule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activationType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `providerOrderId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `provider` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activationType` to the `PricingRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `SmsMessage` table without a default value. This is not possible if the table is not empty.
  - Made the column `referralCode` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `balanceAfter` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balanceBefore` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('FIVESIM', 'SMS_ACTIVATE', 'SMS_MAN');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'MONNIFY', 'FLUTTERWAVE');

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "SmsMessage" DROP CONSTRAINT "SmsMessage_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_userId_fkey";

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "activationType" TEXT NOT NULL,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "provider" "Provider" NOT NULL,
ALTER COLUMN "providerOrderId" SET NOT NULL,
ALTER COLUMN "providerCostUsd" SET DATA TYPE DECIMAL(18,4),
ALTER COLUMN "sellingPriceNgn" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "gatewayReference" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "provider" "PaymentProvider" NOT NULL,
ADD COLUMN     "providerResponse" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "PricingRule" ADD COLUMN     "activationType" TEXT NOT NULL,
ALTER COLUMN "fixedMarkupNgn" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "SmsMessage" DROP COLUMN "fullText",
ADD COLUMN     "providerSmsId" TEXT,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referredBy",
ADD COLUMN     "referredById" TEXT,
ALTER COLUMN "referralCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "balanceAfter" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "balanceBefore" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- CreateTable
CREATE TABLE "PaymentWebhook" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "event" TEXT NOT NULL,
    "reference" TEXT,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentWebhook_provider_idx" ON "PaymentWebhook"("provider");

-- CreateIndex
CREATE INDEX "PaymentWebhook_reference_idx" ON "PaymentWebhook"("reference");

-- CreateIndex
CREATE INDEX "PaymentWebhook_processed_idx" ON "PaymentWebhook"("processed");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_providerOrderId_key" ON "Order"("providerOrderId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_providerOrderId_idx" ON "Order"("providerOrderId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_reference_idx" ON "Payment"("reference");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PricingRule_country_service_activationType_key" ON "PricingRule"("country", "service", "activationType");

-- CreateIndex
CREATE INDEX "SmsMessage_orderId_idx" ON "SmsMessage"("orderId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_idx" ON "WalletTransaction"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_reference_idx" ON "WalletTransaction"("reference");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "WalletTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
