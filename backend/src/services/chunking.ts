// ===========================================
// Document Chunking Service
// ===========================================

// Configuration
const DEFAULT_CHUNK_SIZE = 600; // Target tokens per chunk (roughly 500-800)
const MAX_CHUNK_SIZE = 800; // Maximum tokens per chunk
const OVERLAP_SIZE = 75; // Token overlap between chunks
const AVG_CHARS_PER_TOKEN = 4; // Rough estimate for English text

export interface DocumentChunk {
  content: string;
  chunkIndex: number;
  heading?: string;
  tokenCount: number;
}

export interface ChunkingOptions {
  chunkSize?: number;
  maxChunkSize?: number;
  overlap?: number;
}

/**
 * Estimate token count for text
 * This is a rough approximation - actual token count depends on the tokenizer
 */
export function estimateTokenCount(text: string): number {
  // A more accurate approach would use tiktoken, but this approximation works well enough
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries while keeping the delimiter
  const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)/g;
  const matches = text.match(sentenceRegex);
  const sentences: string[] = matches ? [...matches] : [];

  // Handle any remaining text without sentence ending
  const matched = sentences.join('');
  if (matched.length < text.length) {
    const remaining = text.slice(matched.length).trim();
    if (remaining) {
      sentences.push(remaining);
    }
  }

  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Extract heading context from text
 * Returns the last heading found before the content
 */
function extractHeadingContext(text: string): string | undefined {
  const lines = text.split('\n');
  let lastHeading: string | undefined;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      lastHeading = headingMatch[1].trim();
    }
  }

  return lastHeading;
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Chunk a document into smaller pieces respecting semantic boundaries
 */
export function chunkDocument(
  content: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const maxChunkSize = options.maxChunkSize || MAX_CHUNK_SIZE;
  const overlap = options.overlap || OVERLAP_SIZE;

  const chunks: DocumentChunk[] = [];
  const paragraphs = splitIntoParagraphs(content);

  let currentChunk = '';
  let currentTokens = 0;
  let currentHeading: string | undefined;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    // Check if this is a heading
    const headingMatch = paragraph.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
    }

    const paragraphTokens = estimateTokenCount(paragraph);

    // If single paragraph exceeds max size, split by sentences
    if (paragraphTokens > maxChunkSize) {
      // Flush current chunk if not empty
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          chunkIndex: chunkIndex++,
          heading: currentHeading,
          tokenCount: currentTokens,
        });
        currentChunk = '';
        currentTokens = 0;
      }

      // Split large paragraph by sentences
      const sentences = splitIntoSentences(paragraph);
      let sentenceChunk = '';
      let sentenceTokens = 0;

      for (const sentence of sentences) {
        const sTokens = estimateTokenCount(sentence);

        if (sentenceTokens + sTokens > chunkSize && sentenceChunk) {
          chunks.push({
            content: sentenceChunk.trim(),
            chunkIndex: chunkIndex++,
            heading: currentHeading,
            tokenCount: sentenceTokens,
          });

          // Start new chunk with overlap
          const overlapText = getOverlapText(sentenceChunk, overlap);
          sentenceChunk = overlapText + ' ' + sentence;
          sentenceTokens = estimateTokenCount(sentenceChunk);
        } else {
          sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
          sentenceTokens += sTokens;
        }
      }

      // Don't forget remaining sentences
      if (sentenceChunk.trim()) {
        currentChunk = sentenceChunk;
        currentTokens = sentenceTokens;
      }
    } else {
      // Normal paragraph - check if it fits in current chunk
      if (currentTokens + paragraphTokens > chunkSize && currentChunk) {
        // Flush current chunk
        chunks.push({
          content: currentChunk.trim(),
          chunkIndex: chunkIndex++,
          heading: currentHeading,
          tokenCount: currentTokens,
        });

        // Start new chunk with overlap
        const overlapText = getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + '\n\n' + paragraph;
        currentTokens = estimateTokenCount(currentChunk);
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentTokens += paragraphTokens;
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunkIndex: chunkIndex,
      heading: currentHeading,
      tokenCount: currentTokens,
    });
  }

  return chunks;
}

/**
 * Get overlap text from the end of a chunk
 */
function getOverlapText(text: string, overlapTokens: number): string {
  const targetChars = overlapTokens * AVG_CHARS_PER_TOKEN;

  if (text.length <= targetChars) {
    return text;
  }

  // Try to find a sentence boundary near the target
  const endPortion = text.slice(-targetChars * 2);
  const sentences = splitIntoSentences(endPortion);

  if (sentences.length === 0) {
    return text.slice(-targetChars);
  }

  // Build overlap from end, sentence by sentence
  let overlap = '';
  for (let i = sentences.length - 1; i >= 0; i--) {
    const withSentence = sentences[i] + (overlap ? ' ' + overlap : '');
    if (estimateTokenCount(withSentence) > overlapTokens) {
      break;
    }
    overlap = withSentence;
  }

  return overlap || sentences[sentences.length - 1];
}

/**
 * Smart chunking that preserves heading context
 * Each chunk will include its heading context for better retrieval
 */
export function chunkDocumentWithContext(
  content: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const chunks = chunkDocument(content, options);

  // Enhance each chunk with full heading path if available
  return chunks.map(chunk => {
    // If chunk doesn't start with content related to a heading, prepend heading
    if (chunk.heading && !chunk.content.toLowerCase().includes(chunk.heading.toLowerCase())) {
      return {
        ...chunk,
        content: `[Context: ${chunk.heading}]\n\n${chunk.content}`,
        tokenCount: chunk.tokenCount + estimateTokenCount(`[Context: ${chunk.heading}]\n\n`),
      };
    }
    return chunk;
  });
}
