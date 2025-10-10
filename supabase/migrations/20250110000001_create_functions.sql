-- Function to get featured figures with their timelines
CREATE OR REPLACE FUNCTION get_featured_figures()
RETURNS TABLE (
  id UUID,
  name TEXT,
  lifespan TEXT,
  spectrum INTEGER[],
  timeline JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.lifespan,
    f.spectrum,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'label', t.label,
          'spectrum', t.spectrum,
          'note', t.note
        ) ORDER BY t.entry_order
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as timeline
  FROM figures f
  LEFT JOIN timeline_entries t ON f.id = t.figure_id
  WHERE f.is_featured = true
  GROUP BY f.id, f.name, f.lifespan, f.spectrum, f.featured_order
  ORDER BY f.featured_order NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to get all figures with their timelines
CREATE OR REPLACE FUNCTION get_all_figures()
RETURNS TABLE (
  id UUID,
  name TEXT,
  lifespan TEXT,
  spectrum INTEGER[],
  timeline JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.lifespan,
    f.spectrum,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'label', t.label,
          'spectrum', t.spectrum,
          'note', t.note
        ) ORDER BY t.entry_order
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as timeline
  FROM figures f
  LEFT JOIN timeline_entries t ON f.id = t.figure_id
  GROUP BY f.id, f.name, f.lifespan, f.spectrum
  ORDER BY f.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get a single figure by name with timeline
CREATE OR REPLACE FUNCTION get_figure_by_name(p_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  lifespan TEXT,
  spectrum INTEGER[],
  timeline JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.lifespan,
    f.spectrum,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'label', t.label,
          'spectrum', t.spectrum,
          'note', t.note
        ) ORDER BY t.entry_order
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as timeline
  FROM figures f
  LEFT JOIN timeline_entries t ON f.id = t.figure_id
  WHERE f.name = p_name
  GROUP BY f.id, f.name, f.lifespan, f.spectrum;
END;
$$ LANGUAGE plpgsql;

-- Function to update figure spectrum with history tracking
CREATE OR REPLACE FUNCTION update_figure_spectrum(
  p_figure_id UUID,
  p_new_spectrum INTEGER[],
  p_reason TEXT,
  p_changed_by UUID
)
RETURNS VOID AS $$
DECLARE
  v_old_spectrum INTEGER[];
  v_old_timeline JSONB;
BEGIN
  -- Get current spectrum
  SELECT spectrum INTO v_old_spectrum FROM figures WHERE id = p_figure_id;
  
  -- Get current timeline
  SELECT jsonb_agg(
    jsonb_build_object(
      'label', label,
      'spectrum', spectrum,
      'note', note,
      'order', entry_order
    ) ORDER BY entry_order
  ) INTO v_old_timeline
  FROM timeline_entries
  WHERE figure_id = p_figure_id;
  
  -- Store in history
  INSERT INTO spectrum_history (figure_id, spectrum, timeline_snapshot, reason, changed_by)
  VALUES (p_figure_id, v_old_spectrum, v_old_timeline, p_reason, p_changed_by);
  
  -- Update figure
  UPDATE figures 
  SET spectrum = p_new_spectrum, updated_at = NOW()
  WHERE id = p_figure_id;
END;
$$ LANGUAGE plpgsql;

-- Function to insert a new figure with timeline
CREATE OR REPLACE FUNCTION insert_figure_with_timeline(
  p_name TEXT,
  p_lifespan TEXT,
  p_spectrum INTEGER[],
  p_is_featured BOOLEAN,
  p_featured_order INTEGER,
  p_timeline JSONB,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;
