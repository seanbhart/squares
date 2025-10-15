-- Create notification_tokens table
CREATE TABLE IF NOT EXISTS notification_tokens (
  fid INTEGER PRIMARY KEY,
  notification_url TEXT NOT NULL,
  notification_token TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookups of enabled tokens
CREATE INDEX IF NOT EXISTS idx_notification_tokens_enabled ON notification_tokens(enabled);

-- Add RLS policies
ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow webhook endpoint to insert/update/delete
-- Note: In production, you should validate webhook signatures
CREATE POLICY "Allow webhook operations" ON notification_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE notification_tokens IS 'Stores notification tokens for users who have enabled notifications for the Farcaster mini app';
