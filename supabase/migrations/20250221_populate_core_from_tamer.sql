-- Populate CORE scores from TAMER scores for existing data
-- This conversion is an estimate until users explicitly set their CORE scores

-- Add a flag to track whether CORE scores are user-set or auto-converted
ALTER TABLE farcaster_spectrums 
ADD COLUMN IF NOT EXISTS core_is_user_set BOOLEAN DEFAULT FALSE;

-- Create function to convert TAMER scores to CORE scores
CREATE OR REPLACE FUNCTION convert_tamer_to_core(
  p_trade_score SMALLINT,
  p_abortion_score SMALLINT,
  p_migration_score SMALLINT,
  p_economics_score SMALLINT,
  p_rights_score SMALLINT
) RETURNS TABLE (
  civil_rights_score SMALLINT,
  openness_score SMALLINT,
  redistribution_score SMALLINT,
  ethics_score SMALLINT
) AS $$
DECLARE
  v_civil_rights_raw NUMERIC;
  v_openness_raw NUMERIC;
  v_redistribution_raw NUMERIC;
  v_ethics_raw NUMERIC;
BEGIN
  -- Civil Rights: average of rights and abortion, scaled from 0-6 to 0-5
  v_civil_rights_raw := (p_rights_score + p_abortion_score) / 2.0;
  civil_rights_score := ROUND((v_civil_rights_raw / 6.0) * 5.0)::SMALLINT;
  
  -- Openness: average of migration and trade, scaled from 0-6 to 0-5
  v_openness_raw := (p_migration_score + p_trade_score) / 2.0;
  openness_score := ROUND((v_openness_raw / 6.0) * 5.0)::SMALLINT;
  
  -- Redistribution: economics directly scaled from 0-6 to 0-5
  redistribution_score := ROUND((p_economics_score / 6.0) * 5.0)::SMALLINT;
  
  -- Ethics: weighted average (abortion 60%, rights 40%), scaled from 0-6 to 0-5
  v_ethics_raw := (p_abortion_score * 0.6 + p_rights_score * 0.4);
  ethics_score := ROUND((v_ethics_raw / 6.0) * 5.0)::SMALLINT;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate CORE scores for all records that don't have them yet
-- This is a safe operation that won't overwrite existing CORE scores
DO $$
DECLARE
  rec RECORD;
  converted RECORD;
BEGIN
  FOR rec IN 
    SELECT id, trade_score, abortion_score, migration_score, economics_score, rights_score
    FROM farcaster_spectrums
    WHERE 
      civil_rights_score IS NULL
      AND trade_score IS NOT NULL
      AND abortion_score IS NOT NULL
      AND migration_score IS NOT NULL
      AND economics_score IS NOT NULL
      AND rights_score IS NOT NULL
  LOOP
    -- Get converted scores
    SELECT * INTO converted 
    FROM convert_tamer_to_core(
      rec.trade_score,
      rec.abortion_score,
      rec.migration_score,
      rec.economics_score,
      rec.rights_score
    );
    
    -- Update the record
    UPDATE farcaster_spectrums
    SET 
      civil_rights_score = converted.civil_rights_score,
      openness_score = converted.openness_score,
      redistribution_score = converted.redistribution_score,
      ethics_score = converted.ethics_score,
      core_is_user_set = FALSE
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Create a view that always shows CORE scores (either user-set or auto-converted)
CREATE OR REPLACE VIEW public_core_spectrums AS
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
COMMENT ON VIEW public_core_spectrums IS 'Public view of CORE scores - shows user-set scores if available, otherwise auto-converted from TAMER scores';

