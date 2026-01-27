'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuthStore } from '@/lib/store';
import { agentsApi, knowledgeApi, ApiError } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  tagline?: string;
  avatarUrl?: string;
  category: string;
  isPublished: boolean;
  usageCount: number;
}

interface KnowledgeStats {
  sourceCount: number;
  documentCount: number;
  chunkCount: number;
}

export default function DashboardPage() {
  const { accessToken } = useAuthStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, KnowledgeStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!accessToken) return;

      try {
        const { agents } = await agentsApi.getMyAgents(accessToken);
        setAgents(agents);

        // Load knowledge stats for each agent
        const stats: Record<string, KnowledgeStats> = {};
        await Promise.all(
          agents.map(async (agent) => {
            try {
              const agentStats = await knowledgeApi.getStats(agent.id, accessToken);
              stats[agent.id] = agentStats;
            } catch {
              // Ignore errors for individual stats
            }
          })
        );
        setKnowledgeStats(stats);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load agents');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken]);

  return (
    <AppLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="heading-section">
            My Agents
          </h1>
          <p className="body-text mt-2">
            Manage your AI coaching agents and their knowledge sources
          </p>
        </div>
        <Link href="/agents/new" className="btn btn-primary">
          + Create Agent
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 spinner"></div>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="card text-center py-12">
          <div
            className="mx-auto w-16 h-16 rounded-[18px] flex items-center justify-center mb-4"
            style={{ background: 'var(--sage)' }}
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: 'var(--cta-end)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="heading-card text-lg">
            No agents yet
          </h3>
          <p className="body-text mt-2 mb-6">
            Create your first AI coaching agent to get started.
          </p>
          <Link href="/agents/new" className="btn btn-primary">
            Create Your First Agent
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const stats = knowledgeStats[agent.id];
            return (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}/knowledge`}
                className="card transition-all"
              >
                <div className="flex items-start space-x-4">
                  {agent.avatarUrl ? (
                    <img
                      src={agent.avatarUrl}
                      alt={agent.name}
                      className="w-12 h-12 rounded-[14px]"
                    />
                  ) : (
                    <div className="w-12 h-12 avatar text-lg">
                      {agent.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-card truncate">
                      {agent.name}
                    </h3>
                    {agent.tagline && (
                      <p className="body-sm truncate mt-0.5">
                        {agent.tagline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`badge ${agent.isPublished ? 'badge-success' : 'badge-draft'}`}>
                    {agent.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="meta-text">
                    {agent.usageCount} chats
                  </span>
                </div>

                {/* Knowledge status */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="body-sm">
                      Knowledge Sources
                    </span>
                    {stats ? (
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {stats.sourceCount} sources, {stats.chunkCount} chunks
                      </span>
                    ) : (
                      <span className="meta-text">No knowledge</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
