'use client';

import { useState, useRef } from 'react';
import { useCreatorStore } from '@/lib/creatorStore';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

interface KnowledgeDocument {
  id: string;
  type: 'notion' | 'file';
  name: string;
  url?: string;
  fileName?: string;
  content?: string;
  characterCount?: number;
  status: 'pending' | 'loading' | 'ready' | 'error';
  error?: string;
}

export function Step4Knowledge() {
  const { draft, setDraft } = useCreatorStore();
  const { accessToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notionUrl, setNotionUrl] = useState('');
  const [isAddingNotion, setIsAddingNotion] = useState(false);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(
    draft.knowledgeDocuments || []
  );

  // Update draft when documents change
  const updateDocuments = (docs: KnowledgeDocument[]) => {
    setDocuments(docs);
    setDraft({ knowledgeDocuments: docs });
  };

  // Validate Notion URL
  const isValidNotionUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('notion.so') || parsed.hostname.includes('notion.site');
    } catch {
      return false;
    }
  };

  // Extract page name from Notion URL
  const extractNotionPageName = (url: string) => {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        // Get the last part and clean it up
        const lastPart = pathParts[pathParts.length - 1];
        // Remove the page ID suffix (32 hex chars at the end)
        const nameWithoutId = lastPart.replace(/-[a-f0-9]{32}$/i, '');
        // Convert dashes to spaces and capitalize
        return nameWithoutId
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } catch {
      // Fall through
    }
    return 'Notion Page';
  };

  // Add Notion page
  const handleAddNotion = async () => {
    if (!notionUrl.trim() || !isValidNotionUrl(notionUrl)) {
      return;
    }

    const pageName = extractNotionPageName(notionUrl);
    const docId = `notion-${Date.now()}`;
    const newDoc: KnowledgeDocument = {
      id: docId,
      type: 'notion',
      name: pageName,
      url: notionUrl.trim(),
      status: 'loading',
    };

    const updatedDocs = [...documents, newDoc];
    updateDocuments(updatedDocs);
    setNotionUrl('');
    setIsAddingNotion(false);

    // Fetch content from backend
    try {
      const response = await fetch(`${API_URL}/api/knowledge-simple/notion/fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ url: notionUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Notion page');
      }

      // Update document with fetched content
      updateDocuments(
        updatedDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                name: data.document.title || pageName,
                content: data.document.content,
                characterCount: data.document.characterCount,
                status: 'ready' as const,
              }
            : doc
        )
      );
    } catch (error: any) {
      // Update document with error
      updateDocuments(
        updatedDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: 'error' as const,
                error: error.message || 'Failed to fetch content',
              }
            : doc
        )
      );
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain', // .txt
      'application/pdf', // .pdf
    ];

    if (!validTypes.includes(file.type)) {
      alert('Please upload a .docx, .doc, .txt, or .pdf file');
      return;
    }

    const docId = `file-${Date.now()}`;
    const newDoc: KnowledgeDocument = {
      id: docId,
      type: 'file',
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      fileName: file.name,
      status: 'loading',
    };

    const updatedDocs = [...documents, newDoc];
    updateDocuments(updatedDocs);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Upload to backend for text extraction
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/knowledge-simple/upload`, {
        method: 'POST',
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      // Update document with extracted content
      updateDocuments(
        updatedDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                name: data.document.title,
                content: data.document.content,
                characterCount: data.document.characterCount,
                status: 'ready' as const,
              }
            : doc
        )
      );
    } catch (error: any) {
      // Update document with error
      updateDocuments(
        updatedDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                status: 'error' as const,
                error: error.message || 'Failed to extract content',
              }
            : doc
        )
      );
    }
  };

  // Remove document
  const handleRemove = (id: string) => {
    updateDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
        <h3 className="font-medium text-sky-700 dark:text-sky-400 mb-2">
          Give Your Coach More Context
        </h3>
        <p className="text-sm text-sky-600 dark:text-sky-500">
          Add documents to help your coach understand your specific methodologies,
          frameworks, or content. This makes responses more personalized and accurate.
        </p>
      </div>

      {/* Added Documents */}
      {documents.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Added Documents ({documents.length})
          </h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  {doc.type === 'notion' ? (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.type === 'notion' ? 'Notion Page' : doc.fileName}
                      {doc.characterCount && doc.status === 'ready' && (
                        <span className="ml-2">({doc.characterCount.toLocaleString()} chars)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.status === 'loading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-600"></div>
                  )}
                  {doc.status === 'ready' && (
                    <span className="text-xs text-green-600 dark:text-green-400">Ready</span>
                  )}
                  {doc.status === 'error' && (
                    <span className="text-xs text-red-600 dark:text-red-400">{doc.error || 'Error'}</span>
                  )}
                  <button
                    onClick={() => handleRemove(doc.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Notion Page */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Add from Notion
        </h4>
        {isAddingNotion ? (
          <div className="space-y-3">
            <input
              type="url"
              className="input"
              placeholder="Paste public Notion page URL..."
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNotion();
                }
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Make sure your Notion page is shared publicly (Share → Share to web)
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAddNotion}
                disabled={!notionUrl.trim() || !isValidNotionUrl(notionUrl)}
                className={`btn btn-primary text-sm ${
                  !notionUrl.trim() || !isValidNotionUrl(notionUrl)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Add Page
              </button>
              <button
                onClick={() => {
                  setIsAddingNotion(false);
                  setNotionUrl('');
                }}
                className="btn btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNotion(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors group"
          >
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="currentColor">
                <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" />
              </svg>
              <span>Add Notion Page URL</span>
            </div>
          </button>
        )}
      </div>

      {/* Upload Document */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Upload Document
        </h4>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.txt,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors group"
        >
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Google Doc, Word, or PDF</span>
            <span className="text-xs mt-1">.docx, .doc, .txt, .pdf</span>
          </div>
        </button>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tips for Better Context
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Add your coaching methodology or framework</li>
          <li>• Include specific terminology your audience uses</li>
          <li>• Share example scenarios or case studies</li>
          <li>• Upload course materials or guides</li>
        </ul>
      </div>

      {/* Skip option */}
      {documents.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          This step is optional. You can add knowledge sources later.
        </p>
      )}
    </div>
  );
}
