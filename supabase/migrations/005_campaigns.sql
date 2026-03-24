-- Migration 005: Campaigns for organized outbound calling
-- Adds campaigns and campaign_calls tables for bulk outbound calling management

-- ============================================
-- Campaigns table
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    phone_number_id UUID NOT NULL REFERENCES phone_numbers(id) ON DELETE RESTRICT,
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
-- Campaign calls table
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_calls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id) ON DELETE SET NULL,
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
-- Indexes
-- ============================================
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_agent_id ON campaigns(agent_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaign_calls_campaign_id ON campaign_calls(campaign_id);
CREATE INDEX idx_campaign_calls_status ON campaign_calls(status);
CREATE INDEX idx_campaign_calls_call_log_id ON campaign_calls(call_log_id);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaign_calls_updated_at
    BEFORE UPDATE ON campaign_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_calls ENABLE ROW LEVEL SECURITY;

-- Campaigns: owner-only access
CREATE POLICY "Users can view own campaigns"
    ON campaigns FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
    ON campaigns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
    ON campaigns FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
    ON campaigns FOR DELETE
    USING (auth.uid() = user_id);

-- Campaign calls: access through campaign ownership
CREATE POLICY "Users can view own campaign calls"
    ON campaign_calls FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_calls.campaign_id
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own campaign calls"
    ON campaign_calls FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_calls.campaign_id
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own campaign calls"
    ON campaign_calls FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_calls.campaign_id
            AND campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own campaign calls"
    ON campaign_calls FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_calls.campaign_id
            AND campaigns.user_id = auth.uid()
        )
    );
