-- Create farcaster_spectrums table for storing user political positions
CREATE TABLE IF NOT EXISTS farcaster_spectrums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fid BIGINT NOT NULL UNIQUE,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  
  -- TAME-R spectrum values (0-6 scale)
  trade_score SMALLINT NOT NULL CHECK (trade_score >= 0 AND trade_score <= 6),
  abortion_score SMALLINT NOT NULL CHECK (abortion_score >= 0 AND abortion_score <= 6),
  migration_score SMALLINT NOT NULL CHECK (migration_score >= 0 AND migration_score <= 6),
  economics_score SMALLINT NOT NULL CHECK (economics_score >= 0 AND economics_score <= 6),
  rights_score SMALLINT NOT NULL CHECK (rights_score >= 0 AND rights_score <= 6),
  
  -- Stats
  times_updated INTEGER DEFAULT 1,
  last_ip TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_farcaster_spectrums_fid ON farcaster_spectrums(fid);
CREATE INDEX idx_farcaster_spectrums_created_at ON farcaster_spectrums(created_at DESC);
CREATE INDEX idx_farcaster_spectrums_times_updated ON farcaster_spectrums(times_updated DESC);

-- Enable RLS
ALTER TABLE farcaster_spectrums ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read spectrums (for leaderboard)
CREATE POLICY "Anyone can read spectrums" ON farcaster_spectrums
  FOR SELECT USING (true);

-- Allow anyone to insert their own spectrum
CREATE POLICY "Anyone can insert spectrum" ON farcaster_spectrums
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own spectrum
CREATE POLICY "Users can update own spectrum" ON farcaster_spectrums
  FOR UPDATE USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_farcaster_spectrum_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.times_updated = OLD.times_updated + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamp and increment counter
DROP TRIGGER IF EXISTS update_farcaster_spectrum_timestamp ON farcaster_spectrums;
CREATE TRIGGER update_farcaster_spectrum_timestamp
  BEFORE UPDATE ON farcaster_spectrums
  FOR EACH ROW EXECUTE FUNCTION update_farcaster_spectrum_timestamp();

-- Create a view for leaderboard stats
CREATE OR REPLACE VIEW farcaster_leaderboard AS
SELECT 
  fid,
  username,
  display_name,
  pfp_url,
  trade_score,
  abortion_score,
  migration_score,
  economics_score,
  rights_score,
  times_updated,
  created_at,
  updated_at,
  -- Calculate diversity score (standard deviation of scores)
  SQRT(
    (POWER(trade_score - 3, 2) + 
     POWER(abortion_score - 3, 2) + 
     POWER(migration_score - 3, 2) + 
     POWER(economics_score - 3, 2) + 
     POWER(rights_score - 3, 2)) / 5.0
  ) as diversity_score
FROM farcaster_spectrums
ORDER BY created_at DESC;
