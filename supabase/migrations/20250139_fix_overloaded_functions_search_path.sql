-- Fix search_path for overloaded function versions
-- The linter was complaining about different function signatures than we thought

-- Fix: insert_figure_with_timeline with full parameters
CREATE OR REPLACE FUNCTION insert_figure_with_timeline(
  p_name text,
  p_lifespan text,
  p_spectrum integer[],
  p_is_featured boolean,
  p_featured_order integer,
  p_timeline jsonb,
  p_created_by uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_figure_id UUID;
  v_entry JSONB;
  v_index INTEGER := 0;
BEGIN
  -- Insert figure
  INSERT INTO figures (name, lifespan, spectrum, is_featured, featured_order, created_by)
  VALUES (p_name, p_lifespan, p_spectrum, p_is_featured, p_featured_order, p_created_by)
  RETURNING id INTO v_figure_id;

  -- Insert timeline entries
  FOR v_entry IN SELECT * FROM jsonb_array_elements(p_timeline)
  LOOP
    INSERT INTO timeline_entries (figure_id, label, spectrum, note, entry_order)
    VALUES (
      v_figure_id,
      v_entry->>'label',
      ARRAY(SELECT jsonb_array_elements_text(v_entry->'spectrum'))::INTEGER[],
      v_entry->>'note',
      v_index
    );
    v_index := v_index + 1;
  END LOOP;

  RETURN v_figure_id;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Fix: update_figure_spectrum with full parameters
CREATE OR REPLACE FUNCTION update_figure_spectrum(
  p_figure_id uuid,
  p_new_spectrum integer[],
  p_reason text,
  p_changed_by uuid
)
RETURNS void AS $$
BEGIN
  UPDATE figures
  SET spectrum = p_new_spectrum,
      updated_at = NOW()
  WHERE id = p_figure_id;
  
  -- Optionally log the change (if you have a change log table)
  -- INSERT INTO figure_changes (figure_id, reason, changed_by) 
  -- VALUES (p_figure_id, p_reason, p_changed_by);
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Fix: is_admin with user_id parameter
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.id = user_id 
    AND 'admin' = ANY(users.roles)
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION insert_figure_with_timeline(text, text, integer[], boolean, integer, jsonb, uuid) IS 'Insert figure with timeline - secured with search_path';
COMMENT ON FUNCTION update_figure_spectrum(uuid, integer[], text, uuid) IS 'Update figure spectrum with audit trail - secured with search_path';
COMMENT ON FUNCTION is_admin(uuid) IS 'Check if specific user is admin - secured with search_path';
