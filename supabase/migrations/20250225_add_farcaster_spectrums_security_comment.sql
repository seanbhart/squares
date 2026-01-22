-- Add security documentation comment to farcaster_spectrums table
--
-- The current RLS policies allow anyone to insert/update spectrums:
--   - "Anyone can insert spectrum" FOR INSERT WITH CHECK (true)
--   - "Users can update own spectrum" FOR UPDATE USING (true)
--
-- This is a known limitation due to the Farcaster mini app architecture:
-- - Users interact through a Farcaster Frame, not through Supabase Auth
-- - Farcaster signature validation happens at the API layer, not the database layer
-- - The fid (Farcaster ID) is validated server-side before database operations
--
-- When proper Farcaster auth integration is available at the database level,
-- these policies should be updated to:
--   1. Verify the authenticated user's fid matches the row being inserted/updated
--   2. Use auth.jwt() claims to extract and validate the Farcaster identity
--   3. Restrict updates to only the user's own record based on verified fid

COMMENT ON TABLE farcaster_spectrums IS 'Stores political spectrum positions for Farcaster users. SECURITY NOTE: Current RLS policies are permissive (allow any insert/update) because Farcaster auth validation happens at the API layer via signature verification, not at the database layer. When database-level Farcaster auth integration becomes available, policies should be updated to verify fid ownership.';

-- Add comments to the specific policies for clarity
COMMENT ON POLICY "Anyone can insert spectrum" ON farcaster_spectrums IS 'Permissive policy - Farcaster signature validation happens at API layer. TODO: Add fid verification when database-level Farcaster auth is available.';
COMMENT ON POLICY "Users can update own spectrum" ON farcaster_spectrums IS 'Permissive policy - Farcaster signature validation happens at API layer. TODO: Add fid ownership check when database-level Farcaster auth is available.';
