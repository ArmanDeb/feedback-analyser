-- AlterTable
ALTER TABLE "IssueCluster" ADD COLUMN "clusterEmbedding" vector(1536);

-- CreateIndex (optional, but recommended for performance)
-- Note: pgvector index creation is handled separately if needed
-- CREATE INDEX "IssueCluster_clusterEmbedding_idx" ON "IssueCluster" USING ivfflat ("clusterEmbedding" vector_cosine_ops);

