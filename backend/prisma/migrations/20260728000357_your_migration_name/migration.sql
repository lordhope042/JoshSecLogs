-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "refundedAt" TIMESTAMP(3);
