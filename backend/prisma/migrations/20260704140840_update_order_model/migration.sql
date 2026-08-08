/*
  Warnings:

  - Added the required column `activationType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "activationType" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'FIVESIM';

-- CreateIndex
CREATE INDEX "Order_country_idx" ON "Order"("country");

-- CreateIndex
CREATE INDEX "Order_service_idx" ON "Order"("service");

-- CreateIndex
CREATE INDEX "Order_activationType_idx" ON "Order"("activationType");
