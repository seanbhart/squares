-- Create figures table
CREATE TABLE figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  lifespan TEXT NOT NULL,
  spectrum INTEGER[] NOT NULL CHECK (array_length(spectrum, 1) = 5),
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  analysis_notes TEXT,
  source_urls TEXT[]
);

-- Create indexes for figures
CREATE INDEX idx_figures_featured ON figures(is_featured, featured_order);
CREATE INDEX idx_figures_name ON figures(name);

-- Create timeline_entries table
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_id UUID NOT NULL REFERENCES figures(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  spectrum INTEGER[] NOT NULL CHECK (array_length(spectrum, 1) = 5),
  note TEXT NOT NULL,
  entry_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(figure_id, entry_order)
);

-- Create index for timeline_entries
CREATE INDEX idx_timeline_figure ON timeline_entries(figure_id, entry_order);

-- Create analysis_requests table
CREATE TABLE analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  request_type TEXT NOT NULL CHECK (request_type IN ('new', 'reanalysis')),
  figure_id UUID REFERENCES figures(id),
  context_notes TEXT,
  ai_analysis JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  requested_by UUID REFERENCES auth.users(id)
);

-- Create indexes for analysis_requests
CREATE INDEX idx_analysis_status ON analysis_requests(status, created_at);
CREATE INDEX idx_analysis_figure ON analysis_requests(figure_id);

-- Create spectrum_history table
CREATE TABLE spectrum_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figure_id UUID NOT NULL REFERENCES figures(id) ON DELETE CASCADE,
  spectrum INTEGER[] NOT NULL CHECK (array_length(spectrum, 1) = 5),
  timeline_snapshot JSONB,
  reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for spectrum_history
CREATE INDEX idx_spectrum_history_figure ON spectrum_history(figure_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE spectrum_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for figures table
CREATE POLICY "Allow public read access to figures" ON figures
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to figures" ON figures
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for timeline_entries table
CREATE POLICY "Allow public read access to timeline_entries" ON timeline_entries
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to timeline_entries" ON timeline_entries
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policies for analysis_requests table
CREATE POLICY "Allow public read of analysis requests" ON analysis_requests
  FOR SELECT USING (true);

CREATE POLICY "Allow request creation" ON analysis_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update requests" ON analysis_requests
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('admin', 'service_role')
  );

-- RLS Policies for spectrum_history table
CREATE POLICY "Allow public read access to spectrum_history" ON spectrum_history
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to spectrum_history" ON spectrum_history
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
