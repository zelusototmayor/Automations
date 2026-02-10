import { getAccessToken, refreshAccessToken } from './auth';
import type { Agent, Category, Conversation, Message, User, UserContext } from '../types';

// Default port 3000 matches backend default (PORT=3000 in backend/.env.example)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.bettercoachingapp.com/api';

// Normalize backend agent payloads (camelCase) to mobile-friendly snake_case
function normalizeAgent(raw: any): Agent {
  if (!raw) return raw as Agent;

  return {
    ...raw,
    creator_id: raw.creator_id ?? raw.creatorId,
    creator_name: raw.creator_name ?? raw.creatorName,
    avatar_url: raw.avatar_url ?? raw.avatarUrl,
    greeting_message: raw.greeting_message ?? raw.greetingMessage ?? '',
    conversation_starters: raw.conversation_starters ?? raw.conversationStarters ?? [],
    usage_count: raw.usage_count ?? raw.usageCount ?? 0,
    rating_avg: raw.rating_avg ?? raw.ratingAvg,
    rating_count: raw.rating_count ?? raw.ratingCount ?? 0,
    created_at: raw.created_at ?? raw.createdAt,
    system_prompt: raw.system_prompt ?? raw.systemPrompt,
    personality_config: raw.personality_config ?? raw.personalityConfig,
    model_config: raw.model_config ?? raw.modelConfig,
    example_conversations: raw.example_conversations ?? raw.exampleConversations,
    is_published: raw.is_published ?? raw.isPublished,
    voice_id: raw.voice_id ?? raw.voiceId,
    knowledge_context: raw.knowledge_context ?? raw.knowledgeContext,
  } as Agent;
}

function normalizeAgents(rawAgents: any[] = []): Agent[] {
  return rawAgents.map(normalizeAgent);
}

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
  const { agents } = await apiFetch<{ agents: Agent[] }>(`/agents${query ? `?${query}` : ''}`);
  return { agents: normalizeAgents(agents) };
}

export async function getFeaturedAgents(): Promise<{ agents: Agent[] }> {
  const { agents } = await apiFetch<{ agents: Agent[] }>('/agents/featured');
  return { agents: normalizeAgents(agents) };
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  return apiFetch('/agents/categories');
}

export async function getAgent(id: string): Promise<{ agent: Agent }> {
  const { agent } = await apiFetch<{ agent: Agent }>(`/agents/${id}`);
  return { agent: normalizeAgent(agent) };
}

export async function getMyAgents(): Promise<{ agents: Agent[] }> {
  const { agents } = await apiFetch<{ agents: Agent[] }>('/agents/mine');
  return { agents: normalizeAgents(agents) };
}

export async function createAgent(data: Partial<Agent>): Promise<{ agent: Agent }> {
  const { agent } = await apiFetch<{ agent: Agent }>('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { agent: normalizeAgent(agent) };
}

export async function updateAgent(id: string, data: Partial<Agent>): Promise<{ agent: Agent }> {
  const { agent } = await apiFetch<{ agent: Agent }>(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return { agent: normalizeAgent(agent) };
}

export async function publishAgent(id: string): Promise<{ agent: Agent }> {
  const { agent } = await apiFetch<{ agent: Agent }>(`/agents/${id}/publish`, { method: 'POST' });
  return { agent: normalizeAgent(agent) };
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
  onChunk?: (chunk: string) => void,
  voiceMode?: boolean
): Promise<{ conversationId: string; fullResponse: string; freeTrialRemaining?: number; freeTrialLimit?: number }> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/chat/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      agent_id: agentId,
      conversation_id: conversationId,
      message,
      voice_mode: voiceMode,
    }),
  });

  if (!response.ok) {
    // Try to refresh token if unauthorized
    if (response.status === 401) {
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        // Retry with new token
        return sendMessage(agentId, message, conversationId, onChunk, voiceMode);
      }
    }
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    const err: any = new Error(errorData.error || 'Failed to send message');
    err.code = errorData.code; // Preserve error code (e.g., FREE_TRIAL_EXHAUSTED)
    throw err;
  }

  // Get conversation ID from header
  let convId = response.headers.get('X-Conversation-Id') || conversationId || '';

  // React Native doesn't support ReadableStream, so we read the full text
  // and parse the SSE events manually
  const text = await response.text();
  const lines = text.split('\n');

  let fullResponse = '';
  let freeTrialRemaining: number | undefined;
  let freeTrialLimit: number | undefined;

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
        if (data.done && data.freeTrialRemaining !== undefined) {
          freeTrialRemaining = data.freeTrialRemaining;
          freeTrialLimit = data.freeTrialLimit;
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

  return { conversationId: convId, fullResponse, freeTrialRemaining, freeTrialLimit };
}

export async function getFreeTrialUsage(agentId: string): Promise<{
  hasAccess: boolean;
  used?: number;
  remaining?: number;
  limit?: number;
}> {
  return apiFetch(`/chat/trial/${agentId}`);
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
  creator: {
    tier: 'FREE' | 'CREATOR';
    isCreator: boolean;
    expiresAt: string | null;
  };
}> {
  return apiFetch('/users/me');
}

export async function updateUser(
  data: Partial<User> & { avatar_url?: string }
): Promise<{ user: User }> {
  const payload: Record<string, any> = { ...data };

  if (data.avatarUrl !== undefined && data.avatar_url === undefined) {
    payload.avatar_url = data.avatarUrl;
  }

  delete payload.avatarUrl;

  return apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
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

export async function completeOnboarding(): Promise<{ user: User }> {
  return apiFetch('/users/me/complete-onboarding', {
    method: 'POST',
  });
}

export async function dismissContextNudge(): Promise<{ success: boolean }> {
  return apiFetch('/users/me/dismiss-context-nudge', {
    method: 'POST',
  });
}

// ============================================
// ASSESSMENTS API
// ============================================

import type { AssessmentConfig, AssessmentResponse } from '../types';

export async function getAgentAssessments(agentId: string): Promise<{
  assessments: AssessmentConfig[];
}> {
  return apiFetch(`/agents/${agentId}/assessments`);
}

export async function submitAssessmentResponse(
  assessmentId: string,
  agentId: string,
  answers: Record<string, string | number>,
  conversationId?: string
): Promise<{ response: any }> {
  return apiFetch(`/assessments/${assessmentId}/responses`, {
    method: 'POST',
    body: JSON.stringify({
      agentId,
      conversationId,
      answers,
    }),
  });
}

export async function getMyAssessmentResponses(agentId?: string): Promise<{
  responses: AssessmentResponse[];
}> {
  const params = new URLSearchParams();
  if (agentId) params.set('agentId', agentId);
  const query = params.toString();
  return apiFetch(`/users/me/assessment-responses${query ? `?${query}` : ''}`);
}

// ============================================
// TTS API
// ============================================

export async function synthesizeSpeech(text: string, agentId?: string, voiceId?: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  if (!agentId && !voiceId) {
    throw new Error('Missing agentId for voice synthesis');
  }

  const response = await fetch(`${API_URL}/tts/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, agentId, voiceId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'TTS synthesis failed');
  }

  // Convert blob to data URL for expo-av
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function getTTSVoices(): Promise<{
  voices: Array<{ id: string; key?: string; name: string; description?: string }>;
  configured: boolean;
}> {
  return apiFetch('/tts/voices');
}

// ============================================
// PUSH NOTIFICATIONS API
// ============================================

export async function updatePushToken(pushToken: string): Promise<{ success: boolean }> {
  return apiFetch('/users/me/push-token', {
    method: 'PATCH',
    body: JSON.stringify({ push_token: pushToken }),
  });
}

// ============================================
// STT (Speech-to-Text) API
// ============================================

export async function transcribeAudio(audioUri: string, agentId?: string): Promise<{
  text: string;
  language?: string;
  duration?: number;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  if (!agentId) {
    throw new Error('Missing agentId for voice transcription');
  }

  // Determine file extension from URI
  const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeTypes: Record<string, string> = {
    'm4a': 'audio/mp4',
    'mp4': 'audio/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'webm': 'audio/webm',
    'caf': 'audio/x-caf',
    '3gp': 'audio/3gpp',
  };
  const mimeType = mimeTypes[extension] || 'audio/mp4';

  // React Native FormData requires this format for file uploads
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: mimeType,
    name: `audio.${extension}`,
  } as any);
  formData.append('agent_id', agentId);

  const response = await fetch(`${API_URL}/stt/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Transcription failed');
  }

  return response.json();
}

export async function getSTTStatus(): Promise<{
  configured: boolean;
  maxFileSizeMB: number;
  supportedFormats: string[];
}> {
  return apiFetch('/stt/status');
}

// ============================================
// INSIGHTS (Memory) API
// ============================================

export interface UserInsight {
  id: string;
  category: string;
  content: string;
  confidence: number;
  isActive: boolean;
  isArchived: boolean;
  userEdited: boolean;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export async function getInsights(options?: {
  agentId?: string;
  category?: string;
  includeArchived?: boolean;
}): Promise<{ insights: UserInsight[] }> {
  const params = new URLSearchParams();
  if (options?.agentId) params.set('agentId', options.agentId);
  if (options?.category) params.set('category', options.category);
  if (options?.includeArchived) params.set('includeArchived', 'true');
  const query = params.toString();
  return apiFetch(`/insights${query ? `?${query}` : ''}`);
}

export async function getInsightCategories(): Promise<{
  categories: Array<{ id: string; name: string; description: string }>;
}> {
  return apiFetch('/insights/categories');
}

export async function updateInsight(
  insightId: string,
  content: string
): Promise<{ success: boolean }> {
  return apiFetch(`/insights/${insightId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export async function deleteInsight(insightId: string): Promise<{ success: boolean }> {
  return apiFetch(`/insights/${insightId}`, { method: 'DELETE' });
}

export async function extractInsights(
  conversationId: string
): Promise<{ success: boolean; extracted: number; saved: number }> {
  return apiFetch('/insights/extract', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  });
}

// ============================================
// COACH PURCHASES API
// ============================================

/**
 * Get purchased coaches with full agent details
 */
export interface PurchasedCoach {
  id: string;
  name: string;
  tagline?: string;
  avatarUrl?: string;
  category: string;
  tier: string;
  priceTier?: string;
}

export async function getPurchasedCoaches(): Promise<{
  coachIds: string[];
  coaches: PurchasedCoach[];
}> {
  return apiFetch('/users/me/purchased-coaches');
}

/**
 * Get detailed purchase history
 */
export async function getPurchaseHistory(): Promise<{
  purchases: Array<{
    agentId: string;
    agentName: string;
    productId: string;
    priceUsd: number | null;
    purchasedAt: string;
  }>;
}> {
  return apiFetch('/users/me/purchases');
}

/**
 * Reconcile purchases with RevenueCat (remove refunded/invalid)
 */
export async function reconcilePurchases(): Promise<{
  removed: number;
  kept: number;
  purchases: Array<{
    agentId: string;
    agentName: string;
    productId: string;
    priceUsd: number | null;
    purchasedAt: string;
  }>;
}> {
  return apiFetch('/users/me/purchases/reconcile', { method: 'POST' });
}

/**
 * Record a coach purchase after RevenueCat transaction
 */
export async function recordCoachPurchase(
  agentId: string,
  productId: string,
  transactionId?: string
): Promise<{ success: boolean }> {
  return apiFetch('/users/me/purchases', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: agentId,
      product_id: productId,
      transaction_id: transactionId,
    }),
  });
}

/**
 * Check if user has purchased a specific coach
 */
export async function hasUserPurchasedCoach(agentId: string): Promise<{ hasPurchased: boolean }> {
  return apiFetch(`/users/me/purchases/${agentId}`);
}
