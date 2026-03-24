-- ============================================
-- Migration 004: Security Hardening
-- Fixes from Supabase Security Audit
-- ============================================

-- 1. Fix handle_new_user() — add SET search_path to prevent privilege escalation
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

-- 2. Fix update_updated_at() — add SET search_path (defense in depth)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. Protect plan_tier, api_calls_used, api_calls_limit from user self-escalation
--    Only service_role can modify these fields
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

-- 4. Missing RLS policies

-- knowledge_bases: missing UPDATE policy
CREATE POLICY "Users can update knowledge bases for own agents"
  ON public.knowledge_bases FOR UPDATE
  USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

-- call_logs: missing DELETE policy
CREATE POLICY "Users can delete own call logs"
  ON public.call_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Anonymous access policies for public agents
--    These allow the anon key (no JWT) to access public, active agents
--    so we can stop using service_role in public API routes

-- Anyone can view public active agents (no auth required)
CREATE POLICY "Anyone can view public active agents"
  ON public.agents FOR SELECT
  USING (is_public = true AND status = 'active');

-- Anonymous can create conversations for public agents
CREATE POLICY "Anonymous can create conversations for public agents"
  ON public.conversations FOR INSERT
  WITH CHECK (
    agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active')
  );

-- Anonymous can read conversations for public agents (session-based)
CREATE POLICY "Anonymous can view public agent conversations"
  ON public.conversations FOR SELECT
  USING (
    session_id IS NOT NULL
    AND agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active')
  );

-- Anonymous can update conversations for public agents (end conversation, update stats)
CREATE POLICY "Anonymous can update public agent conversations"
  ON public.conversations FOR UPDATE
  USING (
    session_id IS NOT NULL
    AND agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active')
  );

-- Anonymous can insert messages in public agent conversations
CREATE POLICY "Anonymous can insert messages in public conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      JOIN public.agents a ON c.agent_id = a.id
      WHERE a.is_public = true AND a.status = 'active'
    )
  );

-- Anonymous can read messages in public agent conversations
CREATE POLICY "Anonymous can view messages in public conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      JOIN public.agents a ON c.agent_id = a.id
      WHERE a.is_public = true AND a.status = 'active'
    )
  );

-- Anonymous can read knowledge bases for public agents (needed for chat context)
CREATE POLICY "Anyone can view knowledge bases for public agents"
  ON public.knowledge_bases FOR SELECT
  USING (agent_id IN (SELECT id FROM public.agents WHERE is_public = true AND status = 'active'));
