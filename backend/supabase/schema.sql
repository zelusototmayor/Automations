-- CoachCraft Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  personal_context JSONB DEFAULT '{}',
  is_creator BOOLEAN DEFAULT false,
  revenuecat_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for RevenueCat lookups
CREATE INDEX IF NOT EXISTS idx_users_revenuecat_id ON users(revenuecat_id);

-- ============================================
-- AGENTS (COACHES) TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  avatar_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  tier TEXT DEFAULT 'premium' CHECK (tier IN ('free', 'premium')),

  -- Configuration
  system_prompt TEXT NOT NULL,
  greeting_message TEXT NOT NULL,
  personality_config JSONB DEFAULT '{"approach": "direct", "tone": 50, "responseStyle": "balanced", "traits": []}',
  model_config JSONB NOT NULL, -- {provider, model, temperature}
  example_conversations JSONB DEFAULT '[]',
  conversation_starters TEXT[] DEFAULT '{}',

  -- Metadata
  is_published BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_creator ON agents(creator_id);
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_published ON agents(is_published);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  revenuecat_id TEXT,
  status TEXT DEFAULT 'none' CHECK (status IN ('none', 'active', 'cancelled', 'expired', 'billing_issue')),
  product_id TEXT,
  entitlements TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- WEBHOOK EVENTS TABLE (for idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  revenuecat_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);

-- ============================================
-- AGENT USAGE TRACKING (for future analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  session_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  UNIQUE(agent_id, date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_usage_agent_date ON agent_usage_daily(agent_id, date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment agent usage count
CREATE OR REPLACE FUNCTION increment_usage_count(agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Agents policies
CREATE POLICY "Anyone can view published agents"
  ON agents FOR SELECT
  USING (is_published = true);

CREATE POLICY "Creators can view own agents"
  ON agents FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own agents"
  ON agents FOR DELETE
  USING (auth.uid() = creator_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: Sample Coaches
-- ============================================

-- Insert a sample free coach for testing
INSERT INTO agents (
  id,
  creator_id,
  name,
  tagline,
  description,
  category,
  tags,
  tier,
  system_prompt,
  greeting_message,
  personality_config,
  model_config,
  conversation_starters,
  is_published
) VALUES (
  uuid_generate_v4(),
  NULL, -- System coach (no creator)
  'Goal Getter',
  'Your accountability partner for achieving goals',
  'A friendly and motivating coach that helps you set, track, and achieve your personal and professional goals. Uses proven goal-setting frameworks to keep you on track.',
  'productivity',
  ARRAY['goals', 'accountability', 'motivation', 'habits'],
  'free',
  'You are Goal Getter, a friendly and motivating accountability coach. Your role is to help users set meaningful goals, break them down into actionable steps, and stay on track.

## Your Approach
- Be encouraging but honest
- Ask clarifying questions to understand the user''s true motivations
- Use the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound)
- Help identify potential obstacles and create contingency plans
- Celebrate progress, no matter how small

## Guidelines
- Keep responses concise but helpful (2-4 paragraphs max)
- Ask one follow-up question at the end of most responses
- If the user seems stuck, offer specific suggestions
- Never be preachy or condescending',
  'Hey there! I''m Goal Getter, your personal accountability partner. Whether you''re chasing a big dream or building better habits, I''m here to help you get there. What goal would you like to work on today?',
  '{"approach": "supportive", "tone": 60, "responseStyle": "balanced", "traits": ["encouraging", "structured", "practical"]}',
  '{"provider": "anthropic", "model": "claude-3-5-haiku-20241022", "temperature": 0.7}',
  ARRAY[
    'I want to set a new goal',
    'Help me break down a big goal into steps',
    'I''m struggling to stay motivated'
  ],
  true
);
