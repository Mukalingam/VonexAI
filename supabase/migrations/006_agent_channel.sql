-- Migration 006: Add agent_channel to support Website vs Calling agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS agent_channel TEXT NOT NULL DEFAULT 'website'
  CHECK (agent_channel IN ('website', 'calling'));

CREATE INDEX IF NOT EXISTS idx_agents_channel ON agents(agent_channel);
