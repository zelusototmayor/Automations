const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed', data);
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: { id: string; email: string; name?: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    fetchApi<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: { id: string; email: string; name?: string };
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  refresh: (refreshToken: string) =>
    fetchApi<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  me: (token: string) =>
    fetchApi<{
      id: string;
      email: string;
      name?: string;
      subscriptionTier: string;
    }>('/api/auth/me', { token }),
};

// Agents API
export const agentsApi = {
  getMyAgents: (token: string) =>
    fetchApi<{
      agents: Array<{
        id: string;
        name: string;
        tagline?: string;
        avatarUrl?: string;
        category: string;
        isPublished: boolean;
        usageCount: number;
      }>;
    }>('/api/agents/mine', { token }),

  getAgent: (id: string, token: string) =>
    fetchApi<{
      agent: {
        id: string;
        name: string;
        tagline?: string;
        description?: string;
        avatarUrl?: string;
        category: string;
        tags: string[];
        systemPrompt: string;
        greetingMessage: string;
        personalityConfig?: {
          approach: string;
          tone: number;
          responseStyle: string;
          traits: string[];
        };
        modelConfig?: {
          provider: string;
          model: string;
          temperature?: number;
        };
        conversationStarters?: string[];
        exampleConversations?: Array<{ user: string; assistant: string }>;
        isPublished: boolean;
      };
    }>(`/api/agents/${id}`, { token }),

  createAgent: (
    data: {
      name: string;
      tagline?: string;
      description?: string;
      avatar_url?: string;
      category: string;
      tags?: string[];
      personality_config?: {
        approach: string;
        tone: number;
        responseStyle: string;
        traits: string[];
      };
      model_config: {
        provider: string;
        model: string;
        temperature?: number;
      };
      system_prompt: string;
      greeting_message: string;
      conversation_starters?: string[];
      example_conversations?: Array<{ user: string; assistant: string }>;
    },
    token: string
  ) =>
    fetchApi<{
      agent: {
        id: string;
        name: string;
        isPublished: boolean;
      };
    }>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  updateAgent: (
    id: string,
    data: {
      name?: string;
      tagline?: string;
      description?: string;
      avatar_url?: string;
      category?: string;
      tags?: string[];
      personality_config?: {
        approach: string;
        tone: number;
        responseStyle: string;
        traits: string[];
      };
      model_config?: {
        provider: string;
        model: string;
        temperature?: number;
      };
      system_prompt?: string;
      greeting_message?: string;
      conversation_starters?: string[];
      example_conversations?: Array<{ user: string; assistant: string }>;
    },
    token: string
  ) =>
    fetchApi<{
      agent: {
        id: string;
        name: string;
        isPublished: boolean;
      };
    }>(`/api/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  publishAgent: (id: string, token: string) =>
    fetchApi<{
      agent: {
        id: string;
        isPublished: boolean;
      };
    }>(`/api/agents/${id}/publish`, {
      method: 'POST',
      token,
    }),

  getSupportedModels: (token: string) =>
    fetchApi<{
      models: Record<string, Array<{ id: string; name: string; recommended?: boolean }>>;
    }>('/api/agents/models', { token }),

  getCategories: (token: string) =>
    fetchApi<{
      categories: Array<{ id: string; name: string; emoji?: string }>;
    }>('/api/agents/categories', { token }),
};

// Integrations API
export const integrationsApi = {
  getConnections: (token: string) =>
    fetchApi<{
      connections: Array<{
        id: string;
        provider: string;
        status: string;
        metadata: any;
        sourceCount: number;
        createdAt: string;
      }>;
    }>('/api/integrations/connections', { token }),

  getOAuthUrl: (provider: string, token: string) =>
    fetchApi<{ url: string }>(`/api/integrations/oauth/${provider}`, { token }),

  revokeConnection: (connectionId: string, token: string) =>
    fetchApi<{ success: boolean }>(`/api/integrations/connections/${connectionId}`, {
      method: 'DELETE',
      token,
    }),

  browseDocuments: (connectionId: string, token: string) =>
    fetchApi<{
      connection: { id: string; provider: string };
      documents: Array<{
        externalId: string;
        title: string;
        url?: string;
        type: string;
        lastModified?: string;
      }>;
    }>(`/api/integrations/browse/${connectionId}`, { token }),
};

// Knowledge API
export const knowledgeApi = {
  getSources: (agentId: string, token: string) =>
    fetchApi<{
      sources: Array<{
        id: string;
        name: string;
        externalId: string;
        sourceType: string;
        syncEnabled: boolean;
        lastSyncAt?: string;
        lastSyncStatus?: string;
        documentCount: number;
        chunkCount: number;
        provider: string;
        connectionStatus: string;
        createdAt: string;
      }>;
    }>(`/api/knowledge/agents/${agentId}/sources`, { token }),

  getStats: (agentId: string, token: string) =>
    fetchApi<{
      sourceCount: number;
      documentCount: number;
      chunkCount: number;
      sources: Array<{
        id: string;
        name: string;
        documentCount: number;
        chunkCount: number;
        lastSyncAt?: string;
        status?: string;
      }>;
    }>(`/api/knowledge/agents/${agentId}/stats`, { token }),

  addSource: (
    agentId: string,
    data: {
      connectionId: string;
      externalId: string;
      name: string;
      sourceType: string;
    },
    token: string
  ) =>
    fetchApi<{
      success: boolean;
      sourceId: string;
      message?: string;
    }>(`/api/knowledge/agents/${agentId}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  removeSource: (agentId: string, sourceId: string, token: string) =>
    fetchApi<{ success: boolean }>(`/api/knowledge/agents/${agentId}/sources/${sourceId}`, {
      method: 'DELETE',
      token,
    }),

  syncSource: (sourceId: string, token: string) =>
    fetchApi<{
      success: boolean;
      documentsProcessed: number;
      chunksCreated: number;
      errors: string[];
    }>(`/api/knowledge/sources/${sourceId}/sync`, {
      method: 'POST',
      token,
    }),

  getSourceStatus: (sourceId: string, token: string) =>
    fetchApi<{
      id: string;
      name: string;
      status?: string;
      lastSyncAt?: string;
      error?: string;
      documentCount: number;
      chunkCount: number;
      documents: Array<{
        id: string;
        title: string;
        status: string;
        errorMessage?: string;
      }>;
    }>(`/api/knowledge/sources/${sourceId}/status`, { token }),
};

export { ApiError };
