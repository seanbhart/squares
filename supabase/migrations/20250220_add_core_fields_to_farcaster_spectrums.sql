-- Add CORE fields to farcaster_spectrums table
ALTER TABLE farcaster_spectrums 
ADD COLUMN IF NOT EXISTS civil_rights_score SMALLINT CHECK (civil_rights_score >= 0 AND civil_rights_score <= 5),
ADD COLUMN IF NOT EXISTS openness_score SMALLINT CHECK (openness_score >= 0 AND openness_score <= 5),
ADD COLUMN IF NOT EXISTS redistribution_score SMALLINT CHECK (redistribution_score >= 0 AND redistribution_score <= 5),
ADD COLUMN IF NOT EXISTS ethics_score SMALLINT CHECK (ethics_score >= 0 AND ethics_score <= 5);

-- Optional: Create an index on these if we plan to query/sort by them
CREATE INDEX IF NOT EXISTS idx_farcaster_spectrums_core_scores 
ON farcaster_spectrums(civil_rights_score, openness_score, redistribution_score, ethics_score);

