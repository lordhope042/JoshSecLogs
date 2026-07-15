-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'X', 'SNAPCHAT', 'TELEGRAM', 'DISCORD', 'REDDIT', 'LINKEDIN', 'YOUTUBE', 'GMAIL', 'OUTLOOK');

-- CreateEnum
CREATE TYPE "SocialLogStatus" AS ENUM ('AVAILABLE', 'SOLD');

-- CreateTable
CREATE TABLE "SocialLog" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "country" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "followers" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "emailAttached" BOOLEAN NOT NULL DEFAULT false,
    "phoneAttached" BOOLEAN NOT NULL DEFAULT false,
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,
    "ogEmail" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "image" TEXT,
    "status" "SocialLogStatus" NOT NULL DEFAULT 'AVAILABLE',
    "buyerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialLog" ADD CONSTRAINT "SocialLog_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
