/**
 * Markdown utilities for text processing
 */

/**
 * Strip pause markers from text for display
 * Removes: [pause 2s], [pause 500ms], [pause: 1s], etc.
 * These markers are only for TTS processing, not for showing to users
 */
export function stripPauseMarkers(text: string): string {
  return text
    .replace(/\[pause[\s:]*\d+(?:\.\d+)?(?:s|ms)?\]/gi, '')
    // Clean up any double spaces left behind
    .replace(/  +/g, ' ')
    // Clean up spaces before punctuation
    .replace(/\s+([.,!?])/g, '$1')
    .trim();
}

/**
 * Strip markdown formatting from text for TTS
 * Removes: **bold**, *italic*, __underline__, ~~strikethrough~~, `code`, # headers, - lists, etc.
 * NOTE: Does NOT strip pause markers - those are processed by TTS
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic: **text** or __text__ or *text* or _text_
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove inline code: `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers: # ## ### etc
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points: - * + at start of line
    .replace(/^[\-\*\+]\s+/gm, '')
    // Remove numbered lists: 1. 2. etc
    .replace(/^\d+\.\s+/gm, '')
    // Remove links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes: > text
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules: --- or ***
    .replace(/^[\-\*]{3,}$/gm, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse markdown text into segments for rendering
 * Returns an array of { type, content } objects
 */
export interface MarkdownSegment {
  type: 'text' | 'bold' | 'italic' | 'bolditalic' | 'code' | 'listItem' | 'numberedItem';
  content: string;
}

export function parseMarkdownLine(line: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];

  // Match bold, italic, code patterns
  const pattern = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: line.slice(lastIndex, match.index) });
    }

    const matched = match[0];

    if (matched.startsWith('***') && matched.endsWith('***')) {
      segments.push({ type: 'bolditalic', content: matched.slice(3, -3) });
    } else if (matched.startsWith('**') && matched.endsWith('**')) {
      segments.push({ type: 'bold', content: matched.slice(2, -2) });
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      segments.push({ type: 'italic', content: matched.slice(1, -1) });
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      segments.push({ type: 'code', content: matched.slice(1, -1) });
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    segments.push({ type: 'text', content: line.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: line }];
}

export interface ParsedLine {
  type: 'paragraph' | 'listItem' | 'numberedItem' | 'header';
  segments: MarkdownSegment[];
  level?: number; // For headers
  number?: number; // For numbered lists
}

export function parseMarkdown(text: string): ParsedLine[] {
  const lines = text.split('\n');
  const result: ParsedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue; // Skip empty lines
    }

    // Check for bullet list
    const bulletMatch = trimmed.match(/^[\-\*\+]\s+(.+)$/);
    if (bulletMatch) {
      result.push({
        type: 'listItem',
        segments: parseMarkdownLine(bulletMatch[1]),
      });
      continue;
    }

    // Check for numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      result.push({
        type: 'numberedItem',
        segments: parseMarkdownLine(numberedMatch[2]),
        number: parseInt(numberedMatch[1], 10),
      });
      continue;
    }

    // Check for header
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      result.push({
        type: 'header',
        segments: parseMarkdownLine(headerMatch[2]),
        level: headerMatch[1].length,
      });
      continue;
    }

    // Regular paragraph
    result.push({
      type: 'paragraph',
      segments: parseMarkdownLine(trimmed),
    });
  }

  return result;
}
