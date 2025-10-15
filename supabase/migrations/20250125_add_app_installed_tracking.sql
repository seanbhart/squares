-- Add app_installed column to track frame/miniapp installation separately from notification state
ALTER TABLE notification_tokens ADD COLUMN IF NOT EXISTS app_installed BOOLEAN DEFAULT true;

-- Backfill existing records (if they have a token, assume app was installed)
UPDATE notification_tokens SET app_installed = true WHERE app_installed IS NULL;

-- Add index for querying by installation status
CREATE INDEX IF NOT EXISTS idx_notification_tokens_app_installed ON notification_tokens(app_installed);

-- Add combined index for common queries
CREATE INDEX IF NOT EXISTS idx_notification_tokens_status ON notification_tokens(app_installed, enabled);

COMMENT ON COLUMN notification_tokens.app_installed IS 'Whether the user currently has the frame/miniapp installed (separate from notification enabled state)';
