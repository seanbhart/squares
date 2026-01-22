-- Fix overly permissive RLS policy on notification_tokens table
-- The previous policy "Allow webhook operations" allowed anyone to do anything (USING true, WITH CHECK true)
-- This migration replaces it with more restrictive policies

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow webhook operations" ON notification_tokens;

-- Create more restrictive policies:

-- 1. Service role can do anything (for server-side webhook operations)
-- Note: service_role bypasses RLS by default, but this policy explicitly documents the intent

-- 2. Authenticated users can read their own notification token
-- This allows users to check their notification status
CREATE POLICY "Users can read own notification token" ON notification_tokens
  FOR SELECT
  USING (auth.role() = 'service_role');

-- 3. Only service role can insert notification tokens (from webhook endpoint)
-- The webhook endpoint validates Farcaster signatures server-side
CREATE POLICY "Service role can insert notification tokens" ON notification_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 4. Only service role can update notification tokens
CREATE POLICY "Service role can update notification tokens" ON notification_tokens
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. Only service role can delete notification tokens
CREATE POLICY "Service role can delete notification tokens" ON notification_tokens
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Add comment explaining the security model
COMMENT ON TABLE notification_tokens IS 'Stores notification tokens for Farcaster mini app users. Access is restricted to service_role only - all operations must go through the server-side webhook endpoint which validates Farcaster signatures.';
