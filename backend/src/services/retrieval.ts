import { prisma } from './database';
import { generateQueryEmbedding, formatEmbeddingForPgVector, EMBEDDING_DIMENSIONS } from './embedding';
import { Prisma } from '@prisma/client';

// ===========================================
// Vector Retrieval Service
// ===========================================

export interface RetrievedChunk {
  id: string;
  content: string;
  heading: string | null;
  similarity: number;
  documentId: string;
  documentTitle: string;
  sourceId: string;
  sourceName: string;
}

export interface RetrievalOptions {
  limit?: number;
  minSimilarity?: number;
  sourceIds?: string[]; // Filter to specific sources
}

/**
 * Retrieve relevant knowledge chunks for a query using vector similarity search
 */
export async function retrieveRelevantChunks(
  agentId: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const { limit = 5, minSimilarity = 0.7, sourceIds } = options;

  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query);
  const embeddingStr = formatEmbeddingForPgVector(queryEmbedding);

  // Build the query with optional source filtering
  // Using raw query for pgvector similarity search
  let sourceFilter = '';
  const params: any[] = [agentId, embeddingStr, limit];

  if (sourceIds && sourceIds.length > 0) {
    sourceFilter = `AND ks.id = ANY($4::uuid[])`;
    params.push(sourceIds);
  }

  const results = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      content: string;
      heading: string | null;
      similarity: number;
      document_id: string;
      document_title: string;
      source_id: string;
      source_name: string;
    }>
  >(
    `
    SELECT
      kc.id,
      kc.content,
      kc.heading,
      1 - (kc.embedding <=> $2::vector) as similarity,
      kd.id as document_id,
      kd.title as document_title,
      ks.id as source_id,
      ks.name as source_name
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kc.document_id = kd.id
    JOIN knowledge_sources ks ON kd.source_id = ks.id
    WHERE ks.agent_id = $1
      AND kc.embedding IS NOT NULL
      ${sourceFilter}
    ORDER BY kc.embedding <=> $2::vector
    LIMIT $3
    `,
    ...params
  );

  // Filter by minimum similarity and map to return type
  return results
    .filter((r) => r.similarity >= minSimilarity)
    .map((r) => ({
      id: r.id,
      content: r.content,
      heading: r.heading,
      similarity: r.similarity,
      documentId: r.document_id,
      documentTitle: r.document_title,
      sourceId: r.source_id,
      sourceName: r.source_name,
    }));
}

/**
 * Search chunks with both semantic and keyword matching
 * Useful for cases where exact matches are important
 */
export async function hybridSearch(
  agentId: string,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const { limit = 5, minSimilarity = 0.5 } = options;

  // Get semantic results
  const semanticResults = await retrieveRelevantChunks(agentId, query, {
    limit: limit * 2, // Get more to allow for deduplication
    minSimilarity,
    sourceIds: options.sourceIds,
  });

  // Get keyword results using PostgreSQL full-text search
  const keywordResults = await prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      heading: string | null;
      document_id: string;
      document_title: string;
      source_id: string;
      source_name: string;
      rank: number;
    }>
  >`
    SELECT
      kc.id,
      kc.content,
      kc.heading,
      kd.id as document_id,
      kd.title as document_title,
      ks.id as source_id,
      ks.name as source_name,
      ts_rank(to_tsvector('english', kc.content), plainto_tsquery('english', ${query})) as rank
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kc.document_id = kd.id
    JOIN knowledge_sources ks ON kd.source_id = ks.id
    WHERE ks.agent_id = ${agentId}::uuid
      AND to_tsvector('english', kc.content) @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  // Merge and deduplicate results
  const seenIds = new Set<string>();
  const mergedResults: RetrievedChunk[] = [];

  // Add semantic results first (higher priority)
  for (const result of semanticResults) {
    if (!seenIds.has(result.id)) {
      seenIds.add(result.id);
      mergedResults.push(result);
    }
  }

  // Add keyword results
  for (const result of keywordResults) {
    if (!seenIds.has(result.id)) {
      seenIds.add(result.id);
      mergedResults.push({
        id: result.id,
        content: result.content,
        heading: result.heading,
        similarity: result.rank, // Use rank as similarity proxy
        documentId: result.document_id,
        documentTitle: result.document_title,
        sourceId: result.source_id,
        sourceName: result.source_name,
      });
    }
  }

  return mergedResults.slice(0, limit);
}

/**
 * Get knowledge statistics for an agent
 */
export async function getAgentKnowledgeStats(agentId: string) {
  const sources = await prisma.knowledgeSource.findMany({
    where: { agentId },
    select: {
      id: true,
      name: true,
      documentCount: true,
      chunkCount: true,
      lastSyncAt: true,
      lastSyncStatus: true,
    },
  });

  const totalDocuments = sources.reduce((sum, s) => sum + s.documentCount, 0);
  const totalChunks = sources.reduce((sum, s) => sum + s.chunkCount, 0);

  return {
    sourceCount: sources.length,
    documentCount: totalDocuments,
    chunkCount: totalChunks,
    sources: sources.map((s) => ({
      id: s.id,
      name: s.name,
      documentCount: s.documentCount,
      chunkCount: s.chunkCount,
      lastSyncAt: s.lastSyncAt,
      status: s.lastSyncStatus,
    })),
  };
}

/**
 * Check if agent has any knowledge sources configured
 */
export async function hasKnowledgeSources(agentId: string): Promise<boolean> {
  const count = await prisma.knowledgeSource.count({
    where: {
      agentId,
      chunkCount: { gt: 0 },
    },
  });
  return count > 0;
}
