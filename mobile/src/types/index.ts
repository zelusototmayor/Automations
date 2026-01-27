// User types
export interface UserContext {
  name?: string;
  about?: string;
  values?: string[];
  goals?: string;
  challenges?: string;
  additional?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  personal_context?: UserContext;
  is_creator: boolean;
  revenuecat_id?: string;
  created_at: string;
  updated_at: string;
}

// Agent/Coach types
export type AgentTier = 'free' | 'premium';
export type LLMProvider = 'anthropic' | 'openai' | 'google';

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
}

// Category
export interface Category {
  id: string;
  name: string;
  emoji: string;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
  agent?: Pick<Agent, 'id' | 'name' | 'avatar_url' | 'tagline' | 'greeting_message'>;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Subscription types
export type SubscriptionStatus = 'none' | 'active' | 'cancelled' | 'expired' | 'billing_issue';

export interface Subscription {
  status: SubscriptionStatus;
  product_id?: string;
  entitlements: string[];
  expires_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
