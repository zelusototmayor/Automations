import { prisma } from './database';
import { extractDocument, ExtractedDocument } from './contentExtractor';
import { chunkDocumentWithContext, DocumentChunk } from './chunking';
import { generateEmbeddings, formatEmbeddingForPgVector } from './embedding';
import { hashContent } from './encryption';
import { SourceType, DocumentStatus, SyncStatus, IntegrationProvider } from '@prisma/client';

// ===========================================
// Knowledge Processing Pipeline
// ===========================================

export interface ProcessingResult {
  success: boolean;
  sourceId: string;
  documentsProcessed: number;
  chunksCreated: number;
  errors: string[];
}

/**
 * Map source type to extraction type
 */
function getExtractionType(sourceType: SourceType): 'NOTION_PAGE' | 'GOOGLE_DOC' {
  switch (sourceType) {
    case 'NOTION_PAGE':
    case 'NOTION_DATABASE':
      return 'NOTION_PAGE';
    case 'GOOGLE_DOC':
    case 'GOOGLE_DRIVE_FOLDER':
      return 'GOOGLE_DOC';
    default:
      throw new Error(`Unsupported source type: ${sourceType}`);
  }
}

/**
 * Process a single document: extract, chunk, embed
 */
async function processDocument(
  documentId: string,
  connectionId: string,
  sourceType: SourceType
): Promise<{ chunksCreated: number; error?: string }> {
  const document = await prisma.knowledgeDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return { chunksCreated: 0, error: 'Document not found' };
  }

  try {
    // Update status to processing
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    // Extract content
    const extractionType = getExtractionType(sourceType);
    const extracted = await extractDocument(connectionId, document.externalId, extractionType);

    // Check if content has changed (skip if unchanged)
    const newHash = hashContent(extracted.content);
    if (document.contentHash === newHash) {
      await prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'COMPLETED' },
      });
      // Return existing chunk count
      const existingChunks = await prisma.knowledgeChunk.count({
        where: { documentId },
      });
      return { chunksCreated: existingChunks };
    }

    // Delete existing chunks for this document
    await prisma.knowledgeChunk.deleteMany({
      where: { documentId },
    });

    // Chunk the content
    const chunks = chunkDocumentWithContext(extracted.content);

    if (chunks.length === 0) {
      await prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          status: 'COMPLETED',
          contentHash: newHash,
          title: extracted.title,
          url: extracted.url,
        },
      });
      return { chunksCreated: 0 };
    }

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Store chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];

      // Insert chunk with embedding using raw SQL for pgvector
      await prisma.$executeRaw`
        INSERT INTO knowledge_chunks (id, document_id, content, chunk_index, heading, token_count, embedding, created_at)
        VALUES (
          gen_random_uuid(),
          ${documentId}::uuid,
          ${chunk.content},
          ${chunk.chunkIndex},
          ${chunk.heading || null},
          ${chunk.tokenCount},
          ${formatEmbeddingForPgVector(embedding.embedding)}::vector,
          NOW()
        )
      `;
    }

    // Update document status
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        contentHash: newHash,
        title: extracted.title,
        url: extracted.url,
      },
    });

    return { chunksCreated: chunks.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });

    return { chunksCreated: 0, error: errorMessage };
  }
}

/**
 * Process all documents in a knowledge source
 */
export async function processKnowledgeSource(sourceId: string): Promise<ProcessingResult> {
  const source = await prisma.knowledgeSource.findUnique({
    where: { id: sourceId },
    include: {
      connection: true,
      documents: true,
    },
  });

  if (!source) {
    return {
      success: false,
      sourceId,
      documentsProcessed: 0,
      chunksCreated: 0,
      errors: ['Knowledge source not found'],
    };
  }

  // Update source status
  await prisma.knowledgeSource.update({
    where: { id: sourceId },
    data: {
      lastSyncStatus: 'PROCESSING',
    },
  });

  const errors: string[] = [];
  let documentsProcessed = 0;
  let totalChunksCreated = 0;

  try {
    // Process each document
    for (const doc of source.documents) {
      const result = await processDocument(doc.id, source.connectionId, source.sourceType);

      if (result.error) {
        errors.push(`${doc.title}: ${result.error}`);
      } else {
        documentsProcessed++;
        totalChunksCreated += result.chunksCreated;
      }
    }

    // Update source statistics
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: errors.length === 0 ? 'COMPLETED' : 'FAILED',
        lastSyncError: errors.length > 0 ? errors.join('; ') : null,
        documentCount: documentsProcessed,
        chunkCount: totalChunksCreated,
      },
    });

    return {
      success: errors.length === 0,
      sourceId,
      documentsProcessed,
      chunksCreated: totalChunksCreated,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        lastSyncStatus: 'FAILED',
        lastSyncError: errorMessage,
      },
    });

    return {
      success: false,
      sourceId,
      documentsProcessed,
      chunksCreated: totalChunksCreated,
      errors: [errorMessage],
    };
  }
}

/**
 * Add a new knowledge source to an agent and process it
 */
export async function addKnowledgeSource(
  agentId: string,
  connectionId: string,
  externalId: string,
  name: string,
  sourceType: SourceType
): Promise<{ sourceId: string; success: boolean; error?: string }> {
  try {
    // Create the knowledge source
    const source = await prisma.knowledgeSource.create({
      data: {
        agentId,
        connectionId,
        name,
        externalId,
        sourceType,
        lastSyncStatus: 'PENDING',
      },
    });

    // Create a document entry for this source
    await prisma.knowledgeDocument.create({
      data: {
        sourceId: source.id,
        externalId,
        title: name,
        status: 'PENDING',
      },
    });

    // Process the source
    const result = await processKnowledgeSource(source.id);

    return {
      sourceId: source.id,
      success: result.success,
      error: result.errors.length > 0 ? result.errors.join('; ') : undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      sourceId: '',
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Remove a knowledge source and all its data
 */
export async function removeKnowledgeSource(sourceId: string, userId: string): Promise<boolean> {
  // Verify ownership through the agent
  const source = await prisma.knowledgeSource.findFirst({
    where: { id: sourceId },
    include: {
      agent: {
        select: { creatorId: true },
      },
    },
  });

  if (!source || source.agent.creatorId !== userId) {
    return false;
  }

  // Delete source (cascades to documents and chunks)
  await prisma.knowledgeSource.delete({
    where: { id: sourceId },
  });

  return true;
}

/**
 * Get all knowledge sources for an agent
 */
export async function getAgentKnowledgeSources(agentId: string) {
  return prisma.knowledgeSource.findMany({
    where: { agentId },
    include: {
      connection: {
        select: {
          provider: true,
          status: true,
        },
      },
      _count: {
        select: {
          documents: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get status of a knowledge source
 */
export async function getKnowledgeSourceStatus(sourceId: string) {
  const source = await prisma.knowledgeSource.findUnique({
    where: { id: sourceId },
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          status: true,
          errorMessage: true,
        },
      },
    },
  });

  if (!source) {
    return null;
  }

  return {
    id: source.id,
    name: source.name,
    status: source.lastSyncStatus,
    lastSyncAt: source.lastSyncAt,
    error: source.lastSyncError,
    documentCount: source.documentCount,
    chunkCount: source.chunkCount,
    documents: source.documents,
  };
}

/**
 * Resync a knowledge source (reprocess all documents)
 */
export async function resyncKnowledgeSource(sourceId: string): Promise<ProcessingResult> {
  // Reset document statuses
  await prisma.knowledgeDocument.updateMany({
    where: { sourceId },
    data: {
      status: 'PENDING',
      contentHash: null, // Force re-extraction
    },
  });

  return processKnowledgeSource(sourceId);
}
