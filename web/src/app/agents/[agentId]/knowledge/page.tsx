'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuthStore } from '@/lib/store';
import { agentsApi, integrationsApi, knowledgeApi, ApiError } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  tagline?: string;
  avatarUrl?: string;
}

interface KnowledgeSource {
  id: string;
  name: string;
  externalId: string;
  sourceType: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  documentCount: number;
  chunkCount: number;
  provider: string;
  connectionStatus: string;
}

interface Connection {
  id: string;
  provider: string;
  status: string;
}

interface Document {
  externalId: string;
  title: string;
  url?: string;
  type: string;
  lastModified?: string;
}

export default function KnowledgeManagerPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const { accessToken } = useAuthStore();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Document browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [addingDoc, setAddingDoc] = useState<string | null>(null);

  // Sync state
  const [syncingSource, setSyncingSource] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [agentId, accessToken]);

  async function loadData() {
    if (!accessToken || !agentId) return;

    try {
      const [agentResponse, sourcesData, connectionsData] = await Promise.all([
        agentsApi.getAgent(agentId, accessToken),
        knowledgeApi.getSources(agentId, accessToken),
        integrationsApi.getConnections(accessToken),
      ]);

      setAgent(agentResponse.agent);
      setSources(sourcesData.sources);
      setConnections(
        connectionsData.connections.filter((c) => c.status === 'ACTIVE')
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBrowseDocuments(connection: Connection) {
    if (!accessToken) return;

    setSelectedConnection(connection);
    setShowBrowser(true);
    setLoadingDocs(true);
    setDocuments([]);

    try {
      const { documents } = await integrationsApi.browseDocuments(
        connection.id,
        accessToken
      );
      setDocuments(documents);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load documents');
      }
    } finally {
      setLoadingDocs(false);
    }
  }

  async function handleAddDocument(doc: Document) {
    if (!accessToken || !selectedConnection) return;

    setAddingDoc(doc.externalId);
    setError('');

    try {
      const sourceType =
        selectedConnection.provider === 'NOTION' ? 'NOTION_PAGE' : 'GOOGLE_DOC';

      await knowledgeApi.addSource(
        agentId,
        {
          connectionId: selectedConnection.id,
          externalId: doc.externalId,
          name: doc.title,
          sourceType,
        },
        accessToken
      );

      setSuccess(`Added "${doc.title}" as a knowledge source`);
      setShowBrowser(false);
      loadData(); // Refresh sources
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to add document');
      }
    } finally {
      setAddingDoc(null);
    }
  }

  async function handleSync(sourceId: string) {
    if (!accessToken) return;

    setSyncingSource(sourceId);
    setError('');

    try {
      const result = await knowledgeApi.syncSource(sourceId, accessToken);

      if (result.success) {
        setSuccess(
          `Synced successfully: ${result.documentsProcessed} documents, ${result.chunksCreated} chunks`
        );
      } else {
        setError(`Sync completed with errors: ${result.errors.join(', ')}`);
      }

      loadData(); // Refresh sources
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to sync');
      }
    } finally {
      setSyncingSource(null);
    }
  }

  async function handleRemoveSource(sourceId: string, name: string) {
    if (!accessToken) return;

    if (
      !confirm(
        `Are you sure you want to remove "${name}"? This will delete all associated knowledge.`
      )
    ) {
      return;
    }

    try {
      await knowledgeApi.removeSource(agentId, sourceId, accessToken);
      setSources(sources.filter((s) => s.id !== sourceId));
      setSuccess(`Removed "${name}"`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to remove source');
      }
    }
  }

  function getStatusColor(status?: string) {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'FAILED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  }

  function getProviderIcon(provider: string) {
    if (provider === 'NOTION') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 100 100" fill="currentColor">
          <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      </svg>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center mb-4"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to agents
        </Link>

        <div className="flex items-center space-x-4">
          {agent?.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 text-lg font-medium">
                {agent?.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {agent?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Knowledge Sources
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Add Knowledge Source */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Knowledge Source
        </h2>

        {connections.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect an integration to add knowledge sources
            </p>
            <Link href="/integrations" className="btn btn-primary">
              Go to Integrations
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {connections.map((conn) => (
              <button
                key={conn.id}
                onClick={() => handleBrowseDocuments(conn)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <span className="text-gray-500">
                  {getProviderIcon(conn.provider)}
                </span>
                <span>
                  Add from {conn.provider.replace('_', ' ').toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge Sources List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Sources ({sources.length})
        </h2>

        {sources.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No knowledge sources added yet
          </div>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-gray-500 mt-1">
                      {getProviderIcon(source.provider)}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {source.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{source.documentCount} documents</span>
                        <span>{source.chunkCount} chunks</span>
                        {source.lastSyncAt && (
                          <span>
                            Synced{' '}
                            {new Date(source.lastSyncAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        source.lastSyncStatus
                      )}`}
                    >
                      {source.lastSyncStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() => handleSync(source.id)}
                    disabled={syncingSource === source.id}
                    className="btn btn-secondary text-sm"
                  >
                    {syncingSource === source.id ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Syncing...
                      </span>
                    ) : (
                      'Sync'
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveSource(source.id, source.name)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Browser Modal */}
      {showBrowser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select a document from{' '}
                {selectedConnection?.provider.replace('_', ' ').toLowerCase()}
              </h3>
              <button
                onClick={() => setShowBrowser(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No documents found
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const isAdded = sources.some(
                      (s) => s.externalId === doc.externalId
                    );
                    const isAdding = addingDoc === doc.externalId;

                    return (
                      <div
                        key={doc.externalId}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {doc.title}
                          </h4>
                          {doc.lastModified && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Modified{' '}
                              {new Date(doc.lastModified).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          {isAdded ? (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Already added
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddDocument(doc)}
                              disabled={isAdding}
                              className="btn btn-primary text-sm"
                            >
                              {isAdding ? 'Adding...' : 'Add'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
