-- Add is_public column to agents table for public sharing
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add session_id column to conversations for anonymous sessions
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Make user_id nullable in conversations for anonymous/public sessions
ALTER TABLE conversations ALTER COLUMN user_id DROP NOT NULL;

-- Index for fast public agent lookups
CREATE INDEX IF NOT EXISTS idx_agents_is_public ON agents (is_public, status) WHERE is_public = true;

-- Index for session-based conversation lookup
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations (session_id) WHERE session_id IS NOT NULL;
