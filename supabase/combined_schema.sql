-- ============================================
-- Vonex AI - Complete Database Schema
-- Run this in your Supabase SQL Editor (all-in-one)
-- Combines migrations 001 through 006
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  company VARCHAR(255),
  timezone VARCHAR(100) DEFAULT 'UTC',
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
  api_calls_used INTEGER NOT NULL DEFAULT 0,
  api_calls_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. AGENTS TABLE
-- ============================================
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(100) NOT NULL,
  agent_type VARCHAR(100) NOT NULL DEFAULT 'custom',
  agent_channel TEXT NOT NULL DEFAULT 'website' CHECK (agent_channel IN ('website', 'calling')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  personality_traits JSONB DEFAULT '{"traits": [], "response_style": "conversational"}',
  system_prompt TEXT NOT NULL DEFAULT '',
  first_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
  voice_id VARCHAR(255),
  voice_gender VARCHAR(20),
  language VARCHAR(50) DEFAULT 'en',
  voice_settings JSONB DEFAULT '{"stability": 0.5, "similarity_boost": 0.75, "style": 0, "speed": 1}',
  llm_model VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
  temperature DECIMAL(3,2) DEFAULT 0.70,
  max_turns INTEGER DEFAULT 50,
  webhook_url TEXT,
  advanced_settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  elevenlabs_agent_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. KNOWLEDGE BASES TABLE
-- ============================================
CREATE TABLE public.knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('file', 'url', 'faq', 'text')),
  file_path TEXT,
  source_url TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  indexing_status TEXT NOT NULL DEFAULT 'pending' CHECK (indexing_status IN ('pending', 'processing', 'indexed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'error')),
  total_turns INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3,2),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ============================================
-- 5. MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 6. TWILIO CONFIGS TABLE
-- ============================================
CREATE TABLE public.twilio_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_sid TEXT NOT NULL,
  auth_token TEXT NOT NULL,
  friendly_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, account_sid)
);

-- ============================================
-- 7. PHONE NUMBERS TABLE
-- ============================================
CREATE TABLE public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  twilio_config_id UUID NOT NULL REFERENCES public.twilio_configs(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  friendly_name VARCHAR(255),
  elevenlabs_phone_number_id VARCHAR(255),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'error', 'importing')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. CALL LOGS TABLE
-- ============================================
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  phone_number_id UUID REFERENCES public.phone_numbers(id) ON DELETE SET NULL,
  elevenlabs_conversation_id VARCHAR(255),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in_progress', 'completed', 'failed', 'no_answer', 'busy')),
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript JSONB,
  sentiment_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. CAMPAIGNS TABLE
-- ============================================
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  phone_number_id UUID NOT NULL REFERENCES public.phone_numbers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed')),
  contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_contacts INTEGER NOT NULL DEFAULT 0,
  completed_calls INTEGER NOT NULL DEFAULT 0,
  successful_calls INTEGER NOT NULL DEFAULT 0,
  failed_calls INTEGER NOT NULL DEFAULT 0,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. CAMPAIGN CALLS TABLE
-- ============================================
CREATE TABLE public.campaign_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  call_log_id UUID REFERENCES public.call_logs(id) ON DELETE SET NULL,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  contact_variables JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'completed', 'failed', 'no_answer', 'voicemail', 'skipped')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Agents
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_domain ON public.agents(domain);
CREATE INDEX idx_agents_is_public ON public.agents(is_public, status) WHERE is_public = true;
CREATE INDEX idx_agents_channel ON public.agents(agent_channel);

-- Knowledge bases
CREATE INDEX idx_knowledge_bases_agent_id ON public.knowledge_bases(agent_id);

-- Conversations
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_session_id ON public.conversations(session_id) WHERE session_id IS NOT NULL;

-- Messages
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Twilio configs
CREATE INDEX idx_twilio_configs_user_id ON public.twilio_configs(user_id);

-- Phone numbers
CREATE INDEX idx_phone_numbers_user_id ON public.phone_numbers(user_id);
CREATE INDEX idx_phone_numbers_agent_id ON public.phone_numbers(agent_id);
CREATE INDEX idx_phone_numbers_status ON public.phone_numbers(status);

-- Call logs
CREATE INDEX idx_call_logs_user_id ON public.call_logs(user_id);
CREATE INDEX idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX idx_call_logs_direction ON public.call_logs(direction);
CREATE INDEX idx_call_logs_status ON public.call_logs(status);
CREATE INDEX idx_call_logs_started_at ON public.call_logs(started_at DESC);
CREATE INDEX idx_call_logs_elevenlabs_id ON public.call_logs(elevenlabs_conversation_id);

-- Campaigns
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_agent_id ON public.campaigns(agent_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_at ON public.campaigns(created_at DESC);

-- Campaign calls
CREATE INDEX idx_campaign_calls_campaign_id ON public.campaign_calls(campaign_id);
CREATE INDEX idx_campaign_calls_status ON public.campaign_calls(status);
CREATE INDEX idx_campaign_calls_call_log_id ON public.campaign_calls(call_log_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own agents" ON public.agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents" ON public.agents FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public active agents" ON public.agents FOR SELECT USING (is_public = true AND status = 'active');

-- Knowledge bases
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view knowledge bases for own agents" ON public.knowledge_bases FOR SELECT USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert knowledge bases for own agents" ON public.knowledge_bases FOR INSERT WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Users can update knowledge bases for own agents" ON public.knowledge_bases FOR UPDATE USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete knowledge bases for own agents" ON public.knowledge_bases FOR DELETE USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view knowledge bases for public agents" ON public.knowledge_bases FOR SELECT USING (agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active'));

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anonymous can create conversations for public agents" ON public.conversations FOR INSERT WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active'));
CREATE POLICY "Anonymous can view public agent conversations" ON public.conversations FOR SELECT USING (session_id IS NOT NULL AND agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active'));
CREATE POLICY "Anonymous can update public agent conversations" ON public.conversations FOR UPDATE USING (session_id IS NOT NULL AND agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active'));

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert messages in own conversations" ON public.messages FOR INSERT WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can update messages in own conversations" ON public.messages FOR UPDATE USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));
CREATE POLICY "Anonymous can insert messages in public conversations" ON public.messages FOR INSERT WITH CHECK (conversation_id IN (SELECT c.id FROM public.conversations c JOIN public.agents a ON c.agent_id = a.id WHERE a.is_public = true AND a.status = 'active'));
CREATE POLICY "Anonymous can view messages in public conversations" ON public.messages FOR SELECT USING (conversation_id IN (SELECT c.id FROM public.conversations c JOIN public.agents a ON c.agent_id = a.id WHERE a.is_public = true AND a.status = 'active'));

-- Twilio configs
ALTER TABLE public.twilio_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own twilio configs" ON public.twilio_configs FOR ALL USING (auth.uid() = user_id);

-- Phone numbers
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own phone numbers" ON public.phone_numbers FOR ALL USING (auth.uid() = user_id);

-- Call logs
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own call logs" ON public.call_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own call logs" ON public.call_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own call logs" ON public.call_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own call logs" ON public.call_logs FOR DELETE USING (auth.uid() = user_id);

-- Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Campaign calls
ALTER TABLE public.campaign_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own campaign calls" ON public.campaign_calls FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can create own campaign calls" ON public.campaign_calls FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can update own campaign calls" ON public.campaign_calls FOR UPDATE USING (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));
CREATE POLICY "Users can delete own campaign calls" ON public.campaign_calls FOR DELETE USING (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_calls.campaign_id AND campaigns.user_id = auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create user profile on sign up (with search_path hardening)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamps (with search_path hardening)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_twilio_configs_updated_at BEFORE UPDATE ON public.twilio_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON public.phone_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_campaign_calls_updated_at BEFORE UPDATE ON public.campaign_calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Protect plan tier fields from user self-escalation
CREATE OR REPLACE FUNCTION public.protect_user_plan_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    NEW.plan_tier := OLD.plan_tier;
    NEW.api_calls_used := OLD.api_calls_used;
    NEW.api_calls_limit := OLD.api_calls_limit;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER protect_user_plan_fields_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_plan_fields();
