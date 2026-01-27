import { getAccessToken, refreshAccessToken } from './auth';
import type { Agent, Category, Conversation, Message, User, UserContext, Subscription } from '../types';

// Default port 3000 matches backend default (PORT=3000 in backend/.env.example)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Generic fetch wrapper with token refresh
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  // If unauthorized and we haven't retried yet, try to refresh token
  if (response.status === 401 && retry) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      // Retry with new token
      return apiFetch<T>(endpoint, options, false);
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============================================
// AGENTS API
// ============================================

export async function getAgents(params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ agents: Agent[] }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  return apiFetch(`/agents${query ? `?${query}` : ''}`);
}

export async function getFeaturedAgents(): Promise<{ agents: Agent[] }> {
  return apiFetch('/agents/featured');
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  return apiFetch('/agents/categories');
}

export async function getAgent(id: string): Promise<{ agent: Agent }> {
  return apiFetch(`/agents/${id}`);
}

export async function getMyAgents(): Promise<{ agents: Agent[] }> {
  return apiFetch('/agents/mine');
}

export async function createAgent(data: Partial<Agent>): Promise<{ agent: Agent }> {
  return apiFetch('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAgent(id: string, data: Partial<Agent>): Promise<{ agent: Agent }> {
  return apiFetch(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function publishAgent(id: string): Promise<{ agent: Agent }> {
  return apiFetch(`/agents/${id}/publish`, { method: 'POST' });
}

export async function deleteAgent(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/agents/${id}`, { method: 'DELETE' });
}

export async function getSupportedModels(): Promise<{
  models: Record<string, Array<{ id: string; name: string; recommended?: boolean }>>;
}> {
  return apiFetch('/agents/models');
}

// ============================================
// CHAT API
// ============================================

export async function sendMessage(
  agentId: string,
  message: string,
  conversationId?: string,
  onChunk?: (chunk: string) => void
): Promise<{ conversationId: string; fullResponse: string }> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      agent_id: agentId,
      conversation_id: conversationId,
      message,
    }),
  });

  if (!response.ok) {
    // Try to refresh token if unauthorized
    if (response.status === 401) {
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        // Retry with new token
        return sendMessage(agentId, message, conversationId, onChunk);
      }
    }
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.code || 'Failed to send message');
  }

  // Get conversation ID from header
  let convId = response.headers.get('X-Conversation-Id') || conversationId || '';

  // React Native doesn't support ReadableStream, so we read the full text
  // and parse the SSE events manually
  const text = await response.text();
  const lines = text.split('\n');

  let fullResponse = '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.chunk) {
          fullResponse += data.chunk;
          onChunk?.(data.chunk);
        }
        if (data.conversation_id) {
          convId = data.conversation_id;
        }
        if (data.error) {
          throw new Error(data.error);
        }
      } catch (e) {
        // Only ignore JSON parse errors, not other errors
        if (e instanceof SyntaxError) {
          // Ignore JSON parse errors for incomplete chunks
          continue;
        }
        // Re-throw other errors (like backend error messages)
        throw e;
      }
    }
  }

  // If we got no response at all, something went wrong
  if (!fullResponse && text.trim()) {
    console.error('Empty response from chat API. Raw response:', text.substring(0, 500));
    throw new Error('No response received from the coach. Please try again.');
  }

  return { conversationId: convId, fullResponse };
}

export async function getConversations(): Promise<{ conversations: Conversation[] }> {
  return apiFetch('/chat/conversations');
}

export async function getConversation(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  return apiFetch(`/chat/conversations/${id}`);
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/chat/conversations/${id}`, { method: 'DELETE' });
}

export async function getSuggestions(agentId: string): Promise<{
  greeting: string;
  suggestions: string[];
}> {
  return apiFetch(`/chat/suggestions/${agentId}`);
}

// ============================================
// USER API
// ============================================

export async function getCurrentUser(): Promise<{
  user: User;
  subscription: Subscription;
}> {
  return apiFetch('/users/me');
}

export async function updateUser(data: Partial<User>): Promise<{ user: User }> {
  return apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getUserContext(): Promise<{ context: UserContext }> {
  return apiFetch('/users/me/context');
}

export async function updateUserContext(context: UserContext): Promise<{ context: UserContext }> {
  return apiFetch('/users/me/context', {
    method: 'PATCH',
    body: JSON.stringify(context),
  });
}

export async function linkRevenueCat(revenueCatId: string): Promise<{ user: User }> {
  return apiFetch('/users/me/revenuecat', {
    method: 'POST',
    body: JSON.stringify({ revenuecat_id: revenueCatId }),
  });
}
