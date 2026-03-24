-- ============================================
-- Migration 003: Phone Calling Support
-- Adds Twilio integration, phone numbers, and call logs
-- ============================================

-- Twilio Configs: Per-user Twilio credentials
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

-- Phone Numbers: Imported from Twilio via ElevenLabs
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

-- Call Logs: Track all inbound/outbound calls
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

-- Indexes
CREATE INDEX idx_twilio_configs_user_id ON public.twilio_configs(user_id);
CREATE INDEX idx_phone_numbers_user_id ON public.phone_numbers(user_id);
CREATE INDEX idx_phone_numbers_agent_id ON public.phone_numbers(agent_id);
CREATE INDEX idx_phone_numbers_status ON public.phone_numbers(status);
CREATE INDEX idx_call_logs_user_id ON public.call_logs(user_id);
CREATE INDEX idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX idx_call_logs_direction ON public.call_logs(direction);
CREATE INDEX idx_call_logs_status ON public.call_logs(status);
CREATE INDEX idx_call_logs_started_at ON public.call_logs(started_at DESC);
CREATE INDEX idx_call_logs_elevenlabs_id ON public.call_logs(elevenlabs_conversation_id);

-- RLS Policies
ALTER TABLE public.twilio_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own twilio configs"
  ON public.twilio_configs FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own phone numbers"
  ON public.phone_numbers FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own call logs"
  ON public.call_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own call logs"
  ON public.call_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own call logs"
  ON public.call_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Updated_at triggers (reuses function from migration 001)
CREATE TRIGGER update_twilio_configs_updated_at
  BEFORE UPDATE ON public.twilio_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
