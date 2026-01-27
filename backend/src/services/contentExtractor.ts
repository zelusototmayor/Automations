import { Client as NotionClient, isFullBlock, isFullPage } from '@notionhq/client';
import { docs_v1 } from 'googleapis';
import { getNotionClient, getGoogleDocsClient, getGoogleDriveClient } from './integration';

// ===========================================
// Types
// ===========================================

export interface ExtractedDocument {
  externalId: string;
  title: string;
  url?: string;
  content: string;
  lastModified?: Date;
}

export interface DocumentListItem {
  externalId: string;
  title: string;
  url?: string;
  type: 'page' | 'database' | 'document' | 'folder';
  lastModified?: Date;
}

// ===========================================
// Notion Content Extraction
// ===========================================

/**
 * Extract text content from a Notion block
 */
function extractNotionBlockText(block: any): string {
  const blockType = block.type;
  const blockData = block[blockType];

  if (!blockData) return '';

  // Handle rich text arrays
  if (blockData.rich_text) {
    return blockData.rich_text.map((rt: any) => rt.plain_text).join('');
  }

  // Handle other block types
  switch (blockType) {
    case 'child_page':
      return `[Page: ${blockData.title}]`;
    case 'child_database':
      return `[Database: ${blockData.title}]`;
    case 'image':
      return blockData.caption?.map((c: any) => c.plain_text).join('') || '[Image]';
    case 'video':
      return '[Video]';
    case 'file':
      return `[File: ${blockData.name || 'Attachment'}]`;
    case 'pdf':
      return '[PDF]';
    case 'bookmark':
      return `[Bookmark: ${blockData.url}]`;
    case 'link_preview':
      return `[Link: ${blockData.url}]`;
    case 'equation':
      return blockData.expression || '';
    case 'divider':
      return '\n---\n';
    case 'table_of_contents':
      return '';
    case 'breadcrumb':
      return '';
    case 'column_list':
      return '';
    case 'column':
      return '';
    default:
      return '';
  }
}

/**
 * Get heading prefix for a block type
 */
function getHeadingPrefix(blockType: string): string {
  switch (blockType) {
    case 'heading_1':
      return '# ';
    case 'heading_2':
      return '## ';
    case 'heading_3':
      return '### ';
    default:
      return '';
  }
}

/**
 * Recursively extract content from Notion blocks
 */
async function extractNotionBlocks(
  notion: NotionClient,
  blockId: string,
  depth: number = 0
): Promise<string> {
  const blocks = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  });

  let content = '';
  const indent = '  '.repeat(depth);

  for (const block of blocks.results) {
    if (!isFullBlock(block)) continue;

    const prefix = getHeadingPrefix(block.type);
    const text = extractNotionBlockText(block);

    if (text) {
      // Add bullet for list items
      if (block.type === 'bulleted_list_item') {
        content += `${indent}• ${text}\n`;
      } else if (block.type === 'numbered_list_item') {
        content += `${indent}1. ${text}\n`;
      } else if (block.type === 'to_do') {
        const checked = (block as any).to_do?.checked ? '✓' : '○';
        content += `${indent}${checked} ${text}\n`;
      } else if (block.type === 'toggle') {
        content += `${indent}▸ ${text}\n`;
      } else if (block.type === 'quote') {
        content += `${indent}> ${text}\n`;
      } else if (block.type === 'callout') {
        const emoji = (block as any).callout?.icon?.emoji || '💡';
        content += `${indent}${emoji} ${text}\n`;
      } else if (block.type === 'code') {
        const language = (block as any).code?.language || '';
        content += `\n\`\`\`${language}\n${text}\n\`\`\`\n`;
      } else {
        content += `${indent}${prefix}${text}\n`;
      }
    }

    // Recursively get children if block has them
    if (block.has_children) {
      const childContent = await extractNotionBlocks(notion, block.id, depth + 1);
      content += childContent;
    }

    // Add spacing after headings
    if (block.type.startsWith('heading_')) {
      content += '\n';
    }
  }

  return content;
}

/**
 * Extract full content from a Notion page
 */
export async function extractNotionPage(
  connectionId: string,
  pageId: string
): Promise<ExtractedDocument> {
  const notion = await getNotionClient(connectionId);

  // Get page metadata
  const page = await notion.pages.retrieve({ page_id: pageId });

  if (!isFullPage(page)) {
    throw new Error('Unable to retrieve full page data');
  }

  // Extract title from page properties
  let title = 'Untitled';
  const titleProp = page.properties.title || page.properties.Name;
  if (titleProp && titleProp.type === 'title') {
    title = titleProp.title.map((t: any) => t.plain_text).join('') || 'Untitled';
  }

  // Extract page content
  const content = await extractNotionBlocks(notion, pageId);

  return {
    externalId: pageId,
    title,
    url: page.url,
    content: content.trim(),
    lastModified: new Date(page.last_edited_time),
  };
}

/**
 * List accessible Notion pages
 */
export async function listNotionPages(connectionId: string): Promise<DocumentListItem[]> {
  const notion = await getNotionClient(connectionId);

  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'page',
    },
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time',
    },
    page_size: 100,
  });

  return response.results
    .filter(isFullPage)
    .map((page) => {
      // Extract title
      let title = 'Untitled';
      const titleProp = page.properties.title || page.properties.Name;
      if (titleProp && titleProp.type === 'title') {
        title = titleProp.title.map((t: any) => t.plain_text).join('') || 'Untitled';
      }

      return {
        externalId: page.id,
        title,
        url: page.url,
        type: 'page' as const,
        lastModified: new Date(page.last_edited_time),
      };
    });
}

// ===========================================
// Google Docs Content Extraction
// ===========================================

/**
 * Extract text from Google Docs document elements
 */
function extractGoogleDocsText(document: docs_v1.Schema$Document): string {
  const content = document.body?.content || [];
  let text = '';
  let currentHeading = '';

  for (const element of content) {
    if (element.paragraph) {
      const paragraph = element.paragraph;

      // Check for heading style
      const style = paragraph.paragraphStyle?.namedStyleType || '';
      let prefix = '';
      if (style === 'HEADING_1') prefix = '# ';
      else if (style === 'HEADING_2') prefix = '## ';
      else if (style === 'HEADING_3') prefix = '### ';
      else if (style === 'HEADING_4') prefix = '#### ';
      else if (style === 'HEADING_5') prefix = '##### ';
      else if (style === 'HEADING_6') prefix = '###### ';

      // Extract paragraph text
      const paragraphText = paragraph.elements
        ?.map((e) => e.textRun?.content || '')
        .join('') || '';

      if (paragraphText.trim()) {
        text += prefix + paragraphText;
        // Track current heading for context
        if (prefix) {
          currentHeading = paragraphText.trim();
        }
      }
    } else if (element.table) {
      // Handle tables - extract cell content
      const table = element.table;
      for (const row of table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          for (const cellContent of cell.content || []) {
            if (cellContent.paragraph) {
              const cellText = cellContent.paragraph.elements
                ?.map((e) => e.textRun?.content || '')
                .join('') || '';
              if (cellText.trim()) {
                text += cellText;
              }
            }
          }
        }
      }
    } else if (element.sectionBreak) {
      text += '\n---\n';
    }
  }

  return text.trim();
}

/**
 * Extract full content from a Google Doc
 */
export async function extractGoogleDoc(
  connectionId: string,
  documentId: string
): Promise<ExtractedDocument> {
  const docs = await getGoogleDocsClient(connectionId);

  const response = await docs.documents.get({
    documentId,
  });

  const document = response.data;
  const content = extractGoogleDocsText(document);

  return {
    externalId: documentId,
    title: document.title || 'Untitled',
    url: `https://docs.google.com/document/d/${documentId}`,
    content,
    lastModified: undefined, // Google Docs API doesn't return this easily
  };
}

/**
 * List accessible Google Docs
 */
export async function listGoogleDocs(connectionId: string): Promise<DocumentListItem[]> {
  const drive = await getGoogleDriveClient(connectionId);

  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document' and trashed=false",
    fields: 'files(id, name, webViewLink, modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: 100,
  });

  return (response.data.files || []).map((file) => ({
    externalId: file.id!,
    title: file.name || 'Untitled',
    url: file.webViewLink || undefined,
    type: 'document' as const,
    lastModified: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
  }));
}

// ===========================================
// Unified Interface
// ===========================================

/**
 * Extract content from any supported document type
 */
export async function extractDocument(
  connectionId: string,
  externalId: string,
  sourceType: 'NOTION_PAGE' | 'GOOGLE_DOC'
): Promise<ExtractedDocument> {
  switch (sourceType) {
    case 'NOTION_PAGE':
      return extractNotionPage(connectionId, externalId);
    case 'GOOGLE_DOC':
      return extractGoogleDoc(connectionId, externalId);
    default:
      throw new Error(`Unsupported source type: ${sourceType}`);
  }
}

/**
 * List available documents from a provider
 */
export async function listDocuments(
  connectionId: string,
  provider: 'NOTION' | 'GOOGLE_DOCS'
): Promise<DocumentListItem[]> {
  switch (provider) {
    case 'NOTION':
      return listNotionPages(connectionId);
    case 'GOOGLE_DOCS':
      return listGoogleDocs(connectionId);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
