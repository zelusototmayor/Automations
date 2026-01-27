import OpenAI from 'openai';

// ===========================================
// Embedding Service using OpenAI
// ===========================================

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100; // OpenAI's limit for batch requests
const MAX_TOKENS_PER_REQUEST = 8191; // Max input tokens for ada-002

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  tokenCount: number;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than generating one at a time
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (texts.length === 0) {
    return [];
  }

  const client = getOpenAIClient();
  const results: EmbeddingResult[] = [];

  // Process in batches
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE);

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Match embeddings to their texts
    for (let j = 0; j < response.data.length; j++) {
      results.push({
        text: batch[j],
        embedding: response.data[j].embedding,
        tokenCount: response.usage?.total_tokens
          ? Math.floor(response.usage.total_tokens / batch.length)
          : 0,
      });
    }
  }

  return results;
}

/**
 * Generate embedding for a query (identical to text embedding but named for clarity)
 * In some embedding models, query and document embeddings use different prefixes
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

/**
 * Calculate cosine similarity between two vectors
 * Returns value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Format embedding vector for PostgreSQL pgvector
 * Converts array to string format: [0.1, 0.2, ...]
 */
export function formatEmbeddingForPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Parse embedding from pgvector string format back to array
 */
export function parseEmbeddingFromPgVector(pgVectorString: string): number[] {
  // Remove brackets and split by comma
  const cleaned = pgVectorString.replace(/[\[\]]/g, '');
  return cleaned.split(',').map(Number);
}

export { EMBEDDING_DIMENSIONS };
