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
  tone: number; // 0 = formal, 100 = casual
  responseStyle: 'concise' | 'balanced' | 'detailed';
  traits: string[];
}

export interface ExampleConversation {
  user: string;
  assistant: string;
}

export interface KnowledgeContextDoc {
  type: 'notion' | 'google_doc' | 'file';
  title: string;
  content: string;
  url?: string;
  fileName?: string;
}

export interface Agent {
  id: string;
  creator_id: string;
  name: string;
  tagline?: string;
  description?: string;
  avatar_url?: string;
  category: string;
  tags: string[];
  tier: AgentTier;

  // Configuration
  system_prompt: string;
  greeting_message: string;
  personality_config: PersonalityConfig;
  model_config: LLMConfig;
  example_conversations?: ExampleConversation[];
  conversation_starters?: string[];
  knowledge_context?: KnowledgeContextDoc[];

  // Metadata
  is_published: boolean;
  usage_count: number;
  rating_avg?: number;
  rating_count: number;

  created_at: string;
  updated_at: string;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
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
  id: string;
  user_id: string;
  revenuecat_id: string;
  status: SubscriptionStatus;
  product_id?: string;
  entitlements: string[];
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// API types
export interface ChatRequest {
  agent_id: string;
  conversation_id?: string;
  message: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: Message;
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
  options?: string[];    // For multiple_choice
  category?: string;     // For grouping (e.g., "Career", "Health")
  required?: boolean;
}

export interface AssessmentConfig {
  id: string;
  name: string;
  description?: string;
  triggerType: AssessmentTriggerType;
  questions: AssessmentQuestion[];
}

export interface AssessmentResponseAnswer {
  questionId: string;
  value: string | number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  userId: string;
  agentId: string;
  conversationId?: string;
  answers: Record<string, string | number>;  // questionId -> answer
  completedAt: string;
}

// RevenueCat webhook types
export interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    type: string;
    id: string;
    app_user_id: string;
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    expiration_at_ms: number;
    purchased_at_ms: number;
    environment: 'PRODUCTION' | 'SANDBOX';
    store: string;
    price: number;
    currency: string;
    period_type: string;
  };
}
