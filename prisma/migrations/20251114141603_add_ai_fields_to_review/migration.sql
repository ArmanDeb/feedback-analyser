-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "aiCategory" TEXT,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiTopic" TEXT,
ADD COLUMN     "aiUrgency" TEXT;

-- CreateIndex
CREATE INDEX "Review_aiCategory_idx" ON "Review"("aiCategory");

-- CreateIndex
CREATE INDEX "Review_aiUrgency_idx" ON "Review"("aiUrgency");
