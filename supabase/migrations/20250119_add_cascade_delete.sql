-- Drop the existing foreign key constraint
ALTER TABLE analysis_requests 
  DROP CONSTRAINT IF EXISTS analysis_requests_figure_id_fkey;

-- Add it back with CASCADE on delete
ALTER TABLE analysis_requests
  ADD CONSTRAINT analysis_requests_figure_id_fkey
  FOREIGN KEY (figure_id) 
  REFERENCES figures(id) 
  ON DELETE CASCADE;

-- Do the same for timeline_entries to ensure cascade delete works
ALTER TABLE timeline_entries
  DROP CONSTRAINT IF EXISTS timeline_entries_figure_id_fkey;

ALTER TABLE timeline_entries
  ADD CONSTRAINT timeline_entries_figure_id_fkey
  FOREIGN KEY (figure_id)
  REFERENCES figures(id)
  ON DELETE CASCADE;

-- And spectrum_history
ALTER TABLE spectrum_history
  DROP CONSTRAINT IF EXISTS spectrum_history_figure_id_fkey;

ALTER TABLE spectrum_history
  ADD CONSTRAINT spectrum_history_figure_id_fkey
  FOREIGN KEY (figure_id)
  REFERENCES figures(id)
  ON DELETE CASCADE;
