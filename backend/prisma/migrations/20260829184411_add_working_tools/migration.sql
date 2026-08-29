-- CreateEnum
CREATE TYPE "WorkingToolType" AS ENUM ('TOOL_1', 'TOOL_2', 'TOOL_3');

-- AlterEnum
ALTER TYPE "SocialLogCategory" ADD VALUE 'ALL_WORKING_TOOLS';

-- AlterEnum
ALTER TYPE "SocialPlatform" ADD VALUE 'TOOL';

-- AlterTable
ALTER TABLE "SocialLog" ADD COLUMN     "toolLink" TEXT,
ADD COLUMN     "workingToolType" "WorkingToolType";

-- CreateIndex
CREATE INDEX "SocialLog_workingToolType_idx" ON "SocialLog"("workingToolType");
