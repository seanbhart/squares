-- Fix security definer warning on public_core_spectrums view
-- Recreate the view with explicit SECURITY INVOKER

DROP VIEW IF EXISTS public_core_spectrums;

-- Recreate the view with SECURITY INVOKER (uses permissions of querying user)
CREATE VIEW public_core_spectrums 
WITH (security_invoker = true)
AS
SELECT 
  fs.id,
  fs.fid,
  fs.username,
  fs.display_name,
  fs.pfp_url,
  -- CORE scores (either user-set or auto-converted)
  COALESCE(fs.civil_rights_score, converted.civil_rights_score) as civil_rights_score,
  COALESCE(fs.openness_score, converted.openness_score) as openness_score,
  COALESCE(fs.redistribution_score, converted.redistribution_score) as redistribution_score,
  COALESCE(fs.ethics_score, converted.ethics_score) as ethics_score,
  fs.core_is_user_set,
  -- Original TAMER scores for reference
  fs.trade_score,
  fs.abortion_score,
  fs.migration_score,
  fs.economics_score,
  fs.rights_score,
  -- Metadata
  fs.is_public,
  fs.times_updated,
  fs.created_at,
  fs.updated_at
FROM farcaster_spectrums fs
LEFT JOIN LATERAL convert_tamer_to_core(
  fs.trade_score,
  fs.abortion_score,
  fs.migration_score,
  fs.economics_score,
  fs.rights_score
) AS converted ON true
WHERE fs.is_public = true;

-- Grant access to view
GRANT SELECT ON public_core_spectrums TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW public_core_spectrums IS 'Public view of CORE scores - shows user-set scores if available, otherwise auto-converted from TAMER scores. Uses SECURITY INVOKER for proper RLS enforcement.';

