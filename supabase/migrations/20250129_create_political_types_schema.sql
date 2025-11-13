-- CORE Political Typology Database Schema
-- Tables for storing political type configuration data

-- Colors table: stores hex color codes used in visualization
CREATE TABLE IF NOT EXISTS colors (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    hex_code TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families table: stores the 4 political families (GM, GS, NS, NM)
CREATE TABLE IF NOT EXISTS families (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types table: stores the 16 base political types
CREATE TABLE IF NOT EXISTS types (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    family_code TEXT NOT NULL REFERENCES families(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    core_scores INTEGER[] NOT NULL CHECK (array_length(core_scores, 1) = 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure all scores are in valid range (0-5)
    CONSTRAINT valid_scores CHECK (
        core_scores[1] BETWEEN 0 AND 5 AND
        core_scores[2] BETWEEN 0 AND 5 AND
        core_scores[3] BETWEEN 0 AND 5 AND
        core_scores[4] BETWEEN 0 AND 5
    )
);

-- Variations table: stores intensity variations (moderate, default, extreme) for each type
CREATE TABLE IF NOT EXISTS variations (
    id BIGSERIAL PRIMARY KEY,
    type_code TEXT NOT NULL REFERENCES types(code) ON DELETE CASCADE,
    intensity TEXT NOT NULL CHECK (intensity IN ('moderate', 'default', 'extreme')),
    name TEXT NOT NULL,
    scores INTEGER[] NOT NULL CHECK (array_length(scores, 1) = 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint on type + intensity
    CONSTRAINT unique_type_intensity UNIQUE (type_code, intensity),
    
    -- Ensure all scores are in valid range (0-5)
    CONSTRAINT valid_scores CHECK (
        scores[1] BETWEEN 0 AND 5 AND
        scores[2] BETWEEN 0 AND 5 AND
        scores[3] BETWEEN 0 AND 5 AND
        scores[4] BETWEEN 0 AND 5
    )
);

-- Intensity colors table: stores color mappings for each intensity level
CREATE TABLE IF NOT EXISTS intensity_colors (
    id BIGSERIAL PRIMARY KEY,
    intensity TEXT UNIQUE NOT NULL CHECK (intensity IN ('moderate', 'default', 'extreme')),
    less_government_color TEXT NOT NULL,
    more_government_color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_types_family ON types(family_code);
CREATE INDEX IF NOT EXISTS idx_variations_type ON variations(type_code);
CREATE INDEX IF NOT EXISTS idx_variations_intensity ON variations(intensity);

-- Add helpful comments
COMMENT ON TABLE families IS 'The 4 political families: Builders (GM), Diplomats (GS), Unionists (NS), Proprietors (NM)';
COMMENT ON TABLE types IS 'The 16 base political types, each belonging to a family';
COMMENT ON TABLE variations IS 'Intensity variations (moderate/default/extreme) for each type';
COMMENT ON COLUMN types.core_scores IS 'CORE scores as [C, O, R, E] array where C=Civil Rights, O=Openness, R=Redistribution, E=Ethics';
COMMENT ON COLUMN variations.scores IS 'Variation scores as [C, O, R, E] array';

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE intensity_colors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Allow public read access" ON colors FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON families FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON types FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON variations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON intensity_colors FOR SELECT USING (true);
