-- AlterTable: add updatedAt column to WalletTransaction.
-- Prisma @updatedAt auto-populates this on every create and update, so the
-- frontend's `updatedAt` field (read in the transaction detail modal) will
-- now resolve to a real timestamp instead of always being undefined/"N/A".
--
-- NOT NULL with a default of CURRENT_TIMESTAMP so the migration is safe to
-- apply on a table that already has rows — every existing row gets backdated
-- to the moment the migration runs (Prisma subsequently overwrites it on the
-- next write, which is the expected behaviour for an @updatedAt column).
ALTER TABLE "WalletTransaction"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
