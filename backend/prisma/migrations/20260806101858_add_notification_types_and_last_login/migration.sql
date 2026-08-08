-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL', 'WELCOME_NEW', 'WELCOME_BACK');

-- CreateEnum
CREATE TYPE "NotificationStyle" AS ENUM ('MINIMAL', 'BANNER', 'ICON_BADGE', 'SPLIT');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "style" "NotificationStyle" NOT NULL DEFAULT 'ICON_BADGE',
ADD COLUMN     "telegramUrl" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "whatsappUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
