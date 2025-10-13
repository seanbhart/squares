# ⚠️ Database Setup Required

You're seeing API 500 errors because the database tables haven't been created yet.

## Quick Fix

Apply the migration to create the `farcaster_spectrums` table:

### Option 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy and paste the entire contents of:
   ```
   supabase/migrations/20250120_create_farcaster_spectrums.sql
   ```
5. Click **Run** or press `Cmd+Enter`

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed locally
supabase migration up

# Or apply directly to remote
supabase db push
```

## What This Creates

- **Table**: `farcaster_spectrums` - Stores user political positions with FID
- **View**: `farcaster_leaderboard` - Calculated leaderboard with diversity scores
- **RLS Policies**: Public read access, authenticated write
- **Triggers**: Auto-update timestamps and counters

## After Running Migration

1. Refresh your mini app
2. API errors should be gone
3. Complete the assessment
4. Your results will save successfully
5. Leaderboard will display your entry

## Verify It Worked

```sql
-- Run this in Supabase SQL Editor to verify
SELECT COUNT(*) FROM farcaster_spectrums;
```

Should return a count (0 if no users yet, but no error).
