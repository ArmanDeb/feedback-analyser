-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "clusterId" TEXT,
ADD COLUMN     "embedding" vector(1536);

-- CreateTable
CREATE TABLE "IssueCluster" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueCluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IssueCluster_appId_idx" ON "IssueCluster"("appId");

-- CreateIndex
CREATE INDEX "IssueCluster_category_idx" ON "IssueCluster"("category");

-- CreateIndex
CREATE INDEX "IssueCluster_status_idx" ON "IssueCluster"("status");

-- CreateIndex
CREATE INDEX "IssueCluster_createdAt_idx" ON "IssueCluster"("createdAt");

-- CreateIndex
CREATE INDEX "Review_clusterId_idx" ON "Review"("clusterId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "IssueCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueCluster" ADD CONSTRAINT "IssueCluster_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
