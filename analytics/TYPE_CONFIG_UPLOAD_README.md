# CORE Type Configuration Database Upload

This directory contains scripts to upload the CORE political typology configuration to Supabase.

## Files

- **`type_config.json`** - Source data with all 16 types, variations, and colors
- **`type_config_schema.sql`** - Database schema definition
- **`type_config_uploader.py`** - Python script to upload data to Supabase

## Setup

### 1. Install Dependencies

```bash
pip install supabase-py python-dotenv
```

### 2. Create Database Tables

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Copy and paste contents of type_config_schema.sql
```

Or use the Supabase CLI:

```bash
supabase db push type_config_schema.sql
```

### 3. Set Environment Variables

The script will use variables from your existing `.env.development.local`:

```bash
SUPABASE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or set them manually:

```bash
export SUPABASE_SUPABASE_URL='https://your-project.supabase.co'
export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

## Usage

The script will automatically load credentials from `../.env.development.local` if it exists.

Run the upload script:

```bash
cd /Users/seanhart/feedslant/squares/analytics
python type_config_uploader.py
```

Expected output:

```
============================================================
CORE Type Configuration Uploader
============================================================

✓ Loaded configuration from type_config.json
✓ Connected to Supabase

------------------------------------------------------------
Uploading colors...
✓ Uploaded 8 colors
Uploading intensity color mappings...
✓ Uploaded 3 intensity color mappings
Uploading families...
✓ Uploaded 4 families
Uploading types...
✓ Uploaded 16 types
Uploading variations...
✓ Uploaded 48 variations

============================================================
✓ Upload complete!
============================================================
```

## Database Schema

### Tables Created:

1. **`colors`** - Color palette (8 colors)
2. **`intensity_colors`** - Color mappings for intensity levels
3. **`families`** - 4 political families (GM, GS, NS, NM)
4. **`types`** - 16 base political types
5. **`variations`** - 48 intensity variations (3 per type)

### Key Features:

- **Array Format**: CORE scores stored as `INTEGER[]` in format `[C, O, R, E]`
- **Constraints**: Score validation (0-5 range), unique constraints
- **Foreign Keys**: Proper relationships between tables
- **Indexes**: Optimized for common queries
- **RLS**: Row Level Security enabled with public read policies

## Querying the Data

### Get all types with their families:

```sql
SELECT 
  t.code,
  t.name,
  f.name as family_name,
  t.core_scores
FROM types t
JOIN families f ON t.family_code = f.code
ORDER BY f.code, t.code;
```

### Get all variations for a specific type:

```sql
SELECT 
  v.intensity,
  v.name,
  v.scores
FROM variations v
WHERE v.type_code = 'LGMP'
ORDER BY 
  CASE v.intensity 
    WHEN 'moderate' THEN 1 
    WHEN 'default' THEN 2 
    WHEN 'extreme' THEN 3 
  END;
```

### Get types with extreme Authority (C >= 4):

```sql
SELECT code, name, core_scores[1] as authority_score
FROM types
WHERE core_scores[1] >= 4
ORDER BY core_scores[1] DESC;
```

## Data Structure

Each type in `type_config.json` follows this structure:

```json
{
  "code": "LGMP",
  "name": "Optimists",
  "core_scores": [1, 1, 1, 1],
  "variations": {
    "moderate": {
      "name": "Pragmatists",
      "scores": [2, 2, 2, 2]
    },
    "default": {
      "name": "Optimists",
      "scores": [1, 1, 1, 1]
    },
    "extreme": {
      "name": "Visionaries",
      "scores": [0, 0, 0, 0]
    }
  }
}
```

Where scores are `[C, O, R, E]`:
- **C** = Civil Rights (0=Liberty, 5=Authority)
- **O** = Openness (0=Global, 5=National)
- **R** = Redistribution (0=Market, 5=Social)
- **E** = Ethics (0=Progressive, 5=Traditional)

## Updating Data

To update the database after changes to `type_config.json`:

```bash
python type_config_uploader.py
```

The script uses `upsert` operations, so it will update existing records and insert new ones.
