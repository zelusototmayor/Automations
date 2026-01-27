import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import mammoth from 'mammoth';

// Use require for pdf-parse due to ESM/CJS issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

const router = Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain', // .txt
      'application/pdf', // .pdf
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: .docx, .doc, .txt, .pdf'));
    }
  },
});

// Helper to format Notion page ID with dashes
function formatNotionId(id: string): string {
  const clean = id.replace(/-/g, '');
  if (clean.length !== 32) return id;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

// Extract text from Notion rich text array
function extractRichText(richText: any[]): string {
  if (!Array.isArray(richText)) return '';
  return richText.map((item: any) => {
    if (typeof item === 'string') return item;
    if (Array.isArray(item)) return item[0] || '';
    return item?.plain_text || item?.text?.content || '';
  }).join('');
}

// Helper to fetch public Notion page content using Notion's internal API
async function fetchNotionPublicPage(url: string): Promise<{ title: string; content: string }> {
  // Extract page ID from URL
  const pageIdMatch = url.match(/([a-f0-9]{32})|([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (!pageIdMatch) {
    throw new Error('Invalid Notion URL - could not extract page ID');
  }

  const rawPageId = pageIdMatch[0].replace(/-/g, '');
  const formattedPageId = formatNotionId(rawPageId);

  try {
    // Use Notion's internal API to load the page
    const response = await fetch('https://www.notion.so/api/v3/loadPageChunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        page: { id: formattedPageId },
        limit: 100,
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Notion API error:', response.status, errorText);
      throw new Error(`Notion returned ${response.status}`);
    }

    const data = await response.json() as { recordMap?: { block?: Record<string, any> } };

    if (!data.recordMap?.block) {
      throw new Error('No content found - page may not be publicly shared');
    }

    const blocks = data.recordMap.block;
    let title = 'Notion Page';
    let content = '';

    // Process blocks to extract text
    for (const blockId of Object.keys(blocks)) {
      const block = blocks[blockId]?.value;
      if (!block) continue;

      // Get page title
      if (block.type === 'page') {
        const titleProp = block.properties?.title;
        if (titleProp) {
          title = extractRichText(titleProp);
        }
        continue;
      }

      // Extract text from block properties
      const textProp = block.properties?.title;
      if (!textProp) continue;

      const text = extractRichText(textProp);
      if (!text) continue;

      // Format based on block type
      switch (block.type) {
        case 'header':
          content += `\n# ${text}\n`;
          break;
        case 'sub_header':
          content += `\n## ${text}\n`;
          break;
        case 'sub_sub_header':
          content += `\n### ${text}\n`;
          break;
        case 'bulleted_list':
          content += `- ${text}\n`;
          break;
        case 'numbered_list':
          content += `- ${text}\n`;
          break;
        case 'to_do':
          const checked = block.properties?.checked?.[0]?.[0] === 'Yes';
          content += `- [${checked ? 'x' : ' '}] ${text}\n`;
          break;
        case 'quote':
          content += `> ${text}\n`;
          break;
        case 'code':
          const language = block.properties?.language?.[0]?.[0] || '';
          content += `\`\`\`${language}\n${text}\n\`\`\`\n`;
          break;
        case 'callout':
          content += `> ${text}\n`;
          break;
        case 'toggle':
          content += `**${text}**\n`;
          break;
        case 'divider':
          content += `\n---\n`;
          break;
        default:
          // text, paragraph, etc.
          content += `${text}\n`;
      }
    }

    if (!content.trim()) {
      throw new Error('Could not extract content from Notion page. Make sure the page is publicly shared (Share → Share to web).');
    }

    return { title, content: content.trim() };
  } catch (error: any) {
    console.error('Error fetching Notion page:', error);
    if (error.message.includes('Could not extract') || error.message.includes('not be publicly')) {
      throw error;
    }
    throw new Error('Failed to fetch Notion page. Make sure it\'s publicly shared (Share → Share to web)');
  }
}

// Fetch content from a public Notion URL
router.post('/notion/fetch', authenticate, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate it's a Notion URL
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('notion.so') && !parsed.hostname.includes('notion.site')) {
        return res.status(400).json({ error: 'URL must be a Notion page URL' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const { title, content } = await fetchNotionPublicPage(url);

    res.json({
      success: true,
      document: {
        type: 'notion',
        title,
        url,
        content,
        characterCount: content.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Notion page:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch Notion page' });
  }
});

// Upload and extract content from a document file
router.post('/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype } = req.file;
    let content = '';
    let title = originalname.replace(/\.[^/.]+$/, ''); // Remove extension

    // Extract text based on file type
    if (mimetype === 'text/plain') {
      content = buffer.toString('utf-8');
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      // Extract from Word document
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else if (mimetype === 'application/pdf') {
      // Extract from PDF
      const result = await pdfParse(buffer);
      content = result.text;
    }

    if (!content.trim()) {
      return res.status(400).json({ error: 'Could not extract text from document' });
    }

    res.json({
      success: true,
      document: {
        type: 'file',
        title,
        fileName: originalname,
        content,
        characterCount: content.length,
      },
    });
  } catch (error: any) {
    console.error('Error processing file:', error);
    res.status(400).json({ error: error.message || 'Failed to process file' });
  }
});

export default router;
