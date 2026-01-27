-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Note: The vector column and index will be created after the Prisma schema migration
-- This migration just enables the extension
