-- Drop old policies that check JWT role
DROP POLICY IF EXISTS "Allow admin write access to figures" ON figures;
DROP POLICY IF EXISTS "Allow admin write access to timeline_entries" ON timeline_entries;
DROP POLICY IF EXISTS "Allow admin write access to spectrum_history" ON spectrum_history;
DROP POLICY IF EXISTS "Allow admin write access to system prompts" ON system_prompts;
DROP POLICY IF EXISTS "System can update requests" ON analysis_requests;

-- Create new policies using current_user_is_admin() function

-- Figures table
CREATE POLICY "Admins can manage figures" ON figures
  FOR ALL USING (current_user_is_admin());

-- Timeline entries table
CREATE POLICY "Admins can manage timeline_entries" ON timeline_entries
  FOR ALL USING (current_user_is_admin());

-- Spectrum history table
CREATE POLICY "Admins can manage spectrum_history" ON spectrum_history
  FOR ALL USING (current_user_is_admin());

-- System prompts table
CREATE POLICY "Admins can manage system_prompts" ON system_prompts
  FOR ALL USING (current_user_is_admin());

-- Analysis requests table
-- Note: This allows both admins and service_role to update
-- Service role is for the Edge Function
CREATE POLICY "Admins and service can update requests" ON analysis_requests
  FOR UPDATE USING (
    current_user_is_admin() OR 
    auth.jwt() ->> 'role' = 'service_role'
  );
