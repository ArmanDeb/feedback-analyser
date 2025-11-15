-- Add vector index for better embedding search performance
-- This uses pgvector's ivfflat index for faster similarity searches

-- Create index on embedding column for faster similarity searches
-- Using ivfflat index type (good for up to 1M vectors)
CREATE INDEX IF NOT EXISTS "Review_embedding_idx" ON "Review" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Note: For production with > 1M vectors, consider using HNSW index instead:
-- CREATE INDEX "Review_embedding_idx" ON "Review" 
-- USING hnsw (embedding vector_cosine_ops);

