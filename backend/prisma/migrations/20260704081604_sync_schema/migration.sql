-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'PAYSTACK',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "balanceAfter" DECIMAL(18,2),
ADD COLUMN     "balanceBefore" DECIMAL(18,2),
ADD COLUMN     "metadata" JSONB;
