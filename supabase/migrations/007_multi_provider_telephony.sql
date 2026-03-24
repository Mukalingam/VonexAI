-- ============================================
-- Migration 007: Multi-Provider Telephony Support
-- Adds support for Exotel, Plivo, Telnyx, Vonage alongside Twilio
-- ============================================

-- Create telephony_configs table (multi-provider)
CREATE TABLE IF NOT EXISTS public.telephony_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'twilio' CHECK (provider IN ('twilio', 'exotel', 'plivo', 'telnyx', 'vonage')),
  credentials JSONB NOT NULL DEFAULT '{}',
  friendly_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, friendly_name)
);

-- Add provider column to phone_numbers
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'twilio';
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS telephony_config_id UUID REFERENCES public.telephony_configs(id) ON DELETE SET NULL;

-- Migrate existing twilio_configs to telephony_configs
INSERT INTO public.telephony_configs (id, user_id, provider, credentials, friendly_name, is_active, created_at, updated_at)
SELECT
  id,
  user_id,
  'twilio',
  jsonb_build_object('account_sid', account_sid, 'auth_token', auth_token),
  friendly_name,
  is_active,
  created_at,
  updated_at
FROM public.twilio_configs
ON CONFLICT DO NOTHING;

-- Update phone_numbers to reference telephony_configs
UPDATE public.phone_numbers SET telephony_config_id = twilio_config_id WHERE telephony_config_id IS NULL AND twilio_config_id IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_telephony_configs_user_id ON public.telephony_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_telephony_configs_provider ON public.telephony_configs(provider);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_provider ON public.phone_numbers(provider);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_telephony_config_id ON public.phone_numbers(telephony_config_id);

-- RLS Policies
ALTER TABLE public.telephony_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own telephony configs"
  ON public.telephony_configs FOR ALL
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_telephony_configs_updated_at
  BEFORE UPDATE ON public.telephony_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add WhatsApp messaging log table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  call_log_id UUID REFERENCES public.call_logs(id) ON DELETE SET NULL,
  to_number VARCHAR(20) NOT NULL,
  from_number VARCHAR(20),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'media')),
  template_name VARCHAR(255),
  content TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  twilio_message_sid VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_call_log_id ON public.whatsapp_messages(call_log_id);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own whatsapp messages"
  ON public.whatsapp_messages FOR ALL
  USING (auth.uid() = user_id);
