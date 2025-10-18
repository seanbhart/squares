# Public Data Count Discrepancy Investigation

## Problem Statement

There are inconsistent counts for public user spectrums across different data sources:

| Source | Count | Status |
|--------|-------|--------|
| `farcaster_spectrums` table (is_public=TRUE) | **84** | ✅ Base truth |
| `public_farcaster_spectrums` view | **84** | ✅ **CONFIRMED - View is correct** |
| API response (`/api/v1/data/spectrums`) | **74** | ❌ **10 rows missing** |
| Public data site (data.squares.vote) | **74** | ❌ Matches API (shows API issue) |

**Updated Analysis**: 
- ~~View is missing 7 records~~ **View has all 84 rows** ✅
- **API only returns 74 rows** ❌ (10 missing)
- CSV export confirms only 74 rows reach the frontend
- No NULL scores, NULL usernames, or invalid data found in view

## Architecture

```
farcaster_spectrums table (is_public=TRUE) → 84 rows ✅
    ↓ (filtered by view definition)
public_farcaster_spectrums view → 84 rows ✅
    ↓ (served by API endpoint - ISSUE HERE)
API response → 74 rows ❌
    ↓ (displayed on frontend)
Public data site → 74 rows ❌
```

**The problem is in the API layer**, not the database or view.

## Potential Causes

### 1. ~~View Calculation Issues~~ **RULED OUT**
The view calculates `divergence_score` and `spread_score` on-the-fly:

```sql
SQRT(
  (POWER(trade_score - 3, 2) + ...) / 5.0
) as divergence_score
```

**Possible issues:**
- NULL values in any score column will cause calculation to return NULL
- The view might implicitly filter out NULL results
- Invalid/corrupt score values

### 2. **Missing Username/Profile Data**
- Some users might have `is_public=TRUE` but missing username or profile data
- The view might be implicitly filtering these out (though not in the WHERE clause)

### 3. **API Filtering** 
The API endpoint applies additional filters:
- Pagination (default limit: 100)
- The public site requests with `limit: 100` 
- If there are >100 results, pagination would cause fewer to show

**However**: 74 < 100, so pagination isn't the issue for the site count.

### 4. **RLS (Row Level Security) Policies**
- There might be RLS policies on `public_farcaster_spectrums` view
- The `anon` role (used by public site) might have different access than authenticated users

### 5. **Caching Issues** (Unlikely)
- The site might be showing stale cached data
- Cache-Control header: `'public, s-maxage=300, stale-while-revalidate=600'`
- Could be showing 5-10 minute old data
- **Status**: Unlikely since CSV export also shows 74 rows

### 6. **PostgREST/Supabase Max Rows Limit** (HIGH PROBABILITY)
- Supabase/PostgREST may have a default max-rows setting
- Check project API settings in Supabase dashboard
- Default PostgREST max-rows is sometimes 1000, but could be lower
- **Check**: Settings → API → Max rows

### 7. **Supabase JS Client Pagination Issue** (MEDIUM PROBABILITY)
- The `.range()` function might not be working as expected
- There might be an implicit limit in the Supabase client
- The count might be calculated differently than the data fetch

### 8. **Query Performance/Timeout** (LOW PROBABILITY)
- The calculated fields might cause slow queries
- Some rows might timeout or fail to calculate
- **Check**: API response time and server logs

## Investigation Steps

Run the queries in `investigate_public_data_discrepancy.sql` to:

1. ✅ Count rows with NULL scores in base table
2. ✅ Count rows with NULL calculated fields in view
3. ✅ Find specific rows missing from view
4. ✅ Check for problematic NULL values
5. ✅ Review view definition for hidden filters
6. ✅ Check RLS policies on the view
7. ✅ Test if calculations produce NULL for any rows

## Recommended Fixes

### Fix #1: Add NULL handling to view definition

```sql
DROP VIEW IF EXISTS public_farcaster_spectrums;

CREATE VIEW public_farcaster_spectrums AS
SELECT 
  id,
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
  -- Only calculate if all scores are non-null
  CASE 
    WHEN trade_score IS NOT NULL 
      AND abortion_score IS NOT NULL 
      AND migration_score IS NOT NULL 
      AND economics_score IS NOT NULL 
      AND rights_score IS NOT NULL
    THEN SQRT(
      (POWER(trade_score - 3, 2) + 
       POWER(abortion_score - 3, 2) + 
       POWER(migration_score - 3, 2) + 
       POWER(economics_score - 3, 2) + 
       POWER(rights_score - 3, 2)) / 5.0
    )
    ELSE NULL
  END as divergence_score,
  -- Similar for spread_score
  CASE 
    WHEN trade_score IS NOT NULL 
      AND abortion_score IS NOT NULL 
      AND migration_score IS NOT NULL 
      AND economics_score IS NOT NULL 
      AND rights_score IS NOT NULL
    THEN SQRT(
      (POWER(trade_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(abortion_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(migration_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(economics_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2) +
       POWER(rights_score - (trade_score + abortion_score + migration_score + economics_score + rights_score) / 5.0, 2)) / 5.0
    )
    ELSE NULL
  END as spread_score
FROM farcaster_spectrums
WHERE is_public = true
  AND username IS NOT NULL  -- Ensure we have valid user data
  AND trade_score IS NOT NULL
  AND abortion_score IS NOT NULL
  AND migration_score IS NOT NULL
  AND economics_score IS NOT NULL
  AND rights_score IS NOT NULL;
```

### Fix #2: Data cleanup

Clean up any rows with incomplete data:

```sql
-- Find and fix rows with NULL scores but is_public=TRUE
UPDATE farcaster_spectrums
SET is_public = false
WHERE is_public = true
  AND (
    trade_score IS NULL OR
    abortion_score IS NULL OR
    migration_score IS NULL OR
    economics_score IS NULL OR
    rights_score IS NULL OR
    username IS NULL OR
    username = ''
  );
```

### Fix #3: Clear cache

If the issue is just stale cache on the public site:
- Wait 10 minutes for cache to expire
- Or manually clear cache/force refresh

## Action Items

### Completed ✅
1. [x] Run investigation queries in Supabase SQL Editor
2. [x] Confirm view has all 84 rows
3. [x] Confirm no NULL values or invalid data
4. [x] Identify that API is the problem layer

### Next Steps 🔍

1. **[ ] Run API test script**
   ```bash
   cd analytics
   INTERNAL_DATA_API_KEY=your_key node test_api_direct.js
   ```
   This will show exactly what the API returns

2. **[ ] Get all FIDs from view**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT fid FROM public_farcaster_spectrums ORDER BY fid;
   ```
   Save results for comparison

3. **[ ] Compare FID lists**
   - Compare API FIDs with view FIDs
   - Identify which 10 specific users are missing
   - Look for patterns (creation date, username, scores, etc.)

4. **[ ] Check Supabase API Settings**
   - Go to Supabase Dashboard → Settings → API
   - Look for "Max rows" or similar settings
   - Check if there's a row limit configured

5. **[ ] Test direct Supabase query**
   - Use Supabase service role key directly
   - Query `public_farcaster_spectrums` with `.select('*').range(0, 99)`
   - See if it returns all 84 or only 74

6. **[ ] Check server logs**
   - Look for any errors or warnings in API logs
   - Check response times
   - Look for timeout or truncation messages

7. **[ ] Apply fix** (once root cause identified)

8. **[ ] Verify counts match across all sources**

9. **[ ] Add monitoring to detect future discrepancies**

## Related Files

- View definition: `/supabase/migrations/20250128000002_remove_legacy_score_fields.sql`
- API endpoint: `/app/api/v1/data/spectrums/route.ts`
- Public site component: `/components/data/DataViewer.tsx`
