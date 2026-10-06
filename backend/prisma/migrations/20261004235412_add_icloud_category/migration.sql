-- AlterEnum
ALTER TYPE "SocialLogCategory" ADD VALUE 'ICLOUD';

-- AlterEnum
ALTER TYPE "SocialPlatform" ADD VALUE 'ICLOUD';

-- AlterTable
ALTER TABLE "SocialLog" ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "smsLink" TEXT,
ADD COLUMN     "smsNumber" TEXT;

-- CreateIndex
CREATE INDEX "SocialLog_dateOfBirth_idx" ON "SocialLog"("dateOfBirth");
