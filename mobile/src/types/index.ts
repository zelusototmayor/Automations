// User types
export interface UserContext {
  name?: string;
  about?: string;
  values?: string[];
  goals?: string;
  challenges?: string;
  additional?: string;
}

// ============================================
// ASSESSMENT TYPES
// ============================================

export type AssessmentQuestionType = 'scale_1_10' | 'multiple_choice' | 'open_text';
export type AssessmentTriggerType = 'first_message' | 'on_demand' | 'scheduled';

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: AssessmentQuestionType;
  options?: string[];
  category?: string;
  required?: boolean;
}

export interface AssessmentConfig {
  id: string;
  name: string;
  description?: string;
  triggerType: AssessmentTriggerType;
  questions: AssessmentQuestion[];
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  assessmentName: string;
  agentId: string;
  agentName: string;
  agentAvatarUrl?: string;
  conversationId?: string;
  answers: Record<string, string | number>;
  completedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  context?: UserContext;
  hasCompletedOnboarding?: boolean;
  contextLastUpdatedAt?: string;
  contextNudgeDismissedAt?: string;
  subscriptionTier?: 'FREE' | 'CREATOR';
  subscriptionExpiry?: string;
  revenuecatId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Agent/Coach types
export type AgentTier = 'free' | 'premium';
export type PriceTier = 'TIER_1' | 'TIER_2' | 'TIER_3';
export type LLMProvider = 'anthropic' | 'openai' | 'google';

// Price tier info
export const PRICE_TIER_INFO: Record<PriceTier, { price: number; label: string }> = {
  TIER_1: { price: 19.99, label: '$19.99' },
  TIER_2: { price: 49.99, label: '$49.99' },
  TIER_3: { price: 99.99, label: '$99.99' },
};

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
}

export interface PersonalityConfig {
  approach: 'socratic' | 'direct' | 'supportive' | 'custom';
  tone: number;
  responseStyle: 'concise' | 'balanced' | 'detailed';
  traits: string[];
}

export interface ExampleConversation {
  user: string;
  assistant: string;
}

export interface Agent {
  id: string;
  creator_id?: string;
  creator_name?: string;  // From join with users table
  name: string;
  tagline?: string;
  description?: string;
  avatar_url?: string;
  category: string;
  tags: string[];
  tier: AgentTier;
  priceTier?: PriceTier;  // Price tier for purchases (TIER_1, TIER_2, TIER_3)
  greeting_message: string;
  conversation_starters?: string[];
  usage_count: number;
  rating_avg?: number;
  rating_count: number;
  created_at: string;

  // Trust signals (optional)
  is_verified?: boolean;
  session_count?: number;
  response_time_minutes?: number;

  // Only available to creator
  system_prompt?: string;
  personality_config?: PersonalityConfig;
  model_config?: LLMConfig;
  example_conversations?: ExampleConversation[];
  is_published?: boolean;

  // Voice and knowledge
  voice_id?: string;
  knowledge_context?: Array<{ type: string; title: string; content: string }>;
}

// Category
export interface Category {
  id: string;
  name: string;
  emoji: string;
}

// Conversation types
export interface ConversationAgent {
  id: string;
  name: string;
  avatarUrl?: string;
  tagline?: string;
  greetingMessage?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  agent?: ConversationAgent;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
