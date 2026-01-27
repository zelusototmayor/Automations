'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuthStore } from '@/lib/store';
import { integrationsApi, ApiError } from '@/lib/api';

interface Connection {
  id: string;
  provider: string;
  status: string;
  metadata: any;
  sourceCount: number;
  createdAt: string;
}

const PROVIDERS = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect your Notion workspace to import pages as knowledge sources',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
        <path
          d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
          fill="#000"
        />
      </svg>
    ),
  },
  {
    id: 'google_docs',
    name: 'Google Docs',
    description: 'Connect your Google account to import documents as knowledge sources',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
        />
        <path fill="#F1F1F1" d="M14.5 2v5.5H20L14.5 2z" />
        <path
          fill="#A1C2FA"
          d="M8 12h8v1.5H8V12zm0 3h8v1.5H8V15zm0 3h5v1.5H8V18z"
        />
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  const { accessToken } = useAuthStore();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Check for OAuth callback status
  useEffect(() => {
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const provider = searchParams.get('provider');

    if (successParam === 'true' && provider) {
      setSuccess(`Successfully connected to ${provider.replace('_', ' ')}`);
    } else if (errorParam) {
      setError(`Failed to connect: ${errorParam.replace('_', ' ')}`);
    }
  }, [searchParams]);

  useEffect(() => {
    loadConnections();
  }, [accessToken]);

  async function loadConnections() {
    if (!accessToken) return;

    try {
      const { connections } = await integrationsApi.getConnections(accessToken);
      setConnections(connections);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(providerId: string) {
    if (!accessToken) return;

    setConnectingProvider(providerId);
    setError('');

    try {
      const { url } = await integrationsApi.getOAuthUrl(providerId, accessToken);
      window.location.href = url;
    } catch (err) {
      setConnectingProvider(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to start connection');
      }
    }
  }

  async function handleDisconnect(connectionId: string) {
    if (!accessToken) return;

    if (!confirm('Are you sure you want to disconnect this integration? All associated knowledge sources will be removed.')) {
      return;
    }

    try {
      await integrationsApi.revokeConnection(connectionId, accessToken);
      setConnections(connections.filter((c) => c.id !== connectionId));
      setSuccess('Integration disconnected successfully');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to disconnect integration');
      }
    }
  }

  function getConnectionForProvider(providerId: string) {
    return connections.find(
      (c) => c.provider.toLowerCase() === providerId.replace('_', '_')
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="heading-section">
          Integrations
        </h1>
        <p className="body-text mt-2">
          Connect external services to import knowledge for your coaching agents
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 spinner"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const connection = getConnectionForProvider(provider.id);
            const isConnected = !!connection && connection.status === 'ACTIVE';
            const isConnecting = connectingProvider === provider.id;

            return (
              <div key={provider.id} className="card p-5">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{provider.icon}</div>
                  <div className="flex-1">
                    <h3 className="heading-card">
                      {provider.name}
                    </h3>
                    <p className="body-sm mt-1">
                      {provider.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  {isConnected ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="status-dot status-dot-success"></span>
                        <span className="body-sm">
                          Connected
                          {connection.sourceCount > 0 &&
                            ` (${connection.sourceCount} sources)`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDisconnect(connection.id)}
                        className="text-[13px] font-medium transition-colors"
                        style={{ color: 'var(--error)' }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={isConnecting}
                      className="btn btn-primary w-full"
                    >
                      {isConnecting ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 spinner mr-2"></div>
                          Connecting...
                        </span>
                      ) : (
                        `Connect ${provider.name}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
