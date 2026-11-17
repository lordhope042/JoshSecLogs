-- Security hardening migration. Existing raw API keys are irrecoverably hashed;
-- users must create a new key if they need to copy it again.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "ApiKey"
  ADD COLUMN "keyHash" TEXT,
  ADD COLUMN "keyPrefix" TEXT;

UPDATE "ApiKey"
SET "keyPrefix" = LEFT("key", 12),
    "keyHash" = 'sha256:' || encode(digest("key", 'sha256'), 'hex')
WHERE "key" IS NOT NULL;

ALTER TABLE "ApiKey"
  ALTER COLUMN "key" DROP NOT NULL,
  ALTER COLUMN "keyPrefix" SET NOT NULL;

UPDATE "ApiKey" SET "key" = NULL WHERE "key" IS NOT NULL;

CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

CREATE TABLE "PurchaseRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "requestFingerprint" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "response" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PurchaseRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PurchaseRequest_userId_idempotencyKey_key"
  ON "PurchaseRequest"("userId", "idempotencyKey");
CREATE INDEX "PurchaseRequest_status_createdAt_idx"
  ON "PurchaseRequest"("status", "createdAt");

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Wallet" WHERE "balance" < 0) THEN
    RAISE EXCEPTION 'Wallet contains negative balances; reconcile them before applying the nonnegative-balance constraint.';
  END IF;
  ALTER TABLE "Wallet"
    ADD CONSTRAINT "Wallet_balance_nonnegative_check" CHECK ("balance" >= 0);
END $$;
