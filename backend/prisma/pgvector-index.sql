-- Run this script after Prisma migrations to create the vector index
-- This enables fast similarity search on knowledge chunks

-- Create IVFFlat index for fast approximate nearest neighbor search
-- Uses cosine similarity which is standard for text embeddings
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- For smaller datasets (<1000 rows), you might use HNSW instead:
-- CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_hnsw_idx
-- ON knowledge_chunks
-- USING hnsw (embedding vector_cosine_ops);
