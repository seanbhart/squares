# Farcaster Mini App - Quick Start

## What Was Built

A complete Farcaster Mini App that allows users to:
- ✅ Take the TAME-R political assessment within Farcaster
- ✅ Save results with their Farcaster ID to Supabase
- ✅ View their saved results on subsequent opens
- ✅ Update their spectrum with change detection
- ✅ See a community leaderboard with sorting options
- ✅ Compare their positions with others

## Project Structure

```
app/
├── miniapp/page.tsx                    # Mini app entry point
├── api/farcaster/
│   ├── spectrum/route.ts               # Save/retrieve user spectrums
│   └── leaderboard/route.ts            # Community leaderboard data

components/miniapp/
├── MiniAppClient.tsx                   # Main mini app component
├── MiniApp.module.css                  # Styling
├── Leaderboard.tsx                     # Leaderboard UI
└── Leaderboard.module.css              # Leaderboard styling

packages/react/                         # Updated widget (v2.4.0)
├── src/SquaresWidget.tsx               # Enhanced with callbacks & initial state
└── package.json                        # Now exports initialSpectrum & initialStep props

supabase/migrations/
└── 20250120_create_farcaster_spectrums.sql  # Database schema

public/.well-known/
└── farcaster.json                      # Mini app manifest

scripts/
└── test-miniapp-local.sh               # Local testing helper script
```

## Quick Start (5 minutes)

### 1. Database Setup

```bash
# Option A: If using Supabase CLI
supabase migration up

# Option B: Via Dashboard
# Go to Supabase SQL Editor and run:
# supabase/migrations/20250120_create_farcaster_spectrums.sql
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Install & Build

```bash
npm install
cd packages/react && npm run build && cd ../..
```

### 4. Local Testing

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Create public URL (choose one)
ngrok http 3000                          # Recommended
npx localtunnel --port 3000             # Alternative
cloudflared tunnel --url http://localhost:3000  # Alternative
```

### 5. Configure Manifest

1. Copy your public URL (e.g., `https://abc123.ngrok.io`)
2. Update ALL URLs in `public/.well-known/farcaster.json`
3. Generate account association:
   - Go to https://farcaster.xyz/~/developers/mini-apps/manifest
   - Enter your public URL
   - Sign with Farcaster
   - Copy the `accountAssociation` object into your manifest

### 6. Test in Farcaster

**Method 1: Test Tool**
```
https://farcaster.xyz/~/developers/mini-apps/test
Enter: https://your-ngrok-url.ngrok.io/miniapp
Click "Open in Client"
```

**Method 2: Direct**
- Enable developer mode at https://farcaster.xyz/~/settings/developer-tools
- Use manifest validation tool
- Open in Warpcast mobile app

## How It Works

### User Flow

**New User:**
1. Opens mini app → SDK initializes → Fetches user context
2. Checks database for existing spectrum → None found
3. Shows widget from slide 1 → User completes assessment
4. Saves to database with Farcaster ID
5. Shows leaderboard with their entry

**Returning User:**
1. Opens mini app → SDK initializes → Fetches user context
2. Checks database → Spectrum found
3. Shows widget on **results slide (slide 3)** with their squares
4. Option to "Start Over" if they want to retake
5. Shows leaderboard

**Update Detection:**
1. User opens mini app → Sees results
2. Clicks "Start Over" → Takes assessment again
3. On close, if values changed → Shows update prompt
4. User chooses "Yes, Update" or "No, Keep Current"
5. Updates database if confirmed

### Database Schema

**Table: farcaster_spectrums**
```sql
- id: UUID (primary key)
- fid: BIGINT (unique, Farcaster ID)
- username: TEXT
- display_name: TEXT  
- pfp_url: TEXT
- trade_score: SMALLINT (0-6)
- abortion_score: SMALLINT (0-6)
- migration_score: SMALLINT (0-6)
- economics_score: SMALLINT (0-6)
- rights_score: SMALLINT (0-6)
- times_updated: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**View: farcaster_leaderboard**
- Adds calculated `diversity_score` (standard deviation from center)
- Used for sorting and display

### API Endpoints

**GET `/api/farcaster/spectrum?fid=12345`**
- Returns user's saved spectrum or null

**POST `/api/farcaster/spectrum`**
- Creates or updates spectrum
- Body: `{ fid, username, displayName, pfpUrl, spectrum: {...} }`

**GET `/api/farcaster/leaderboard?sortBy=recent&limit=50`**
- Returns leaderboard with sorting
- sortBy: `recent` | `diversity` | `updates`

### Widget Updates (v2.4.0)

New props added to `@squares-app/react`:

```tsx
interface SquaresWidgetProps {
  onClose: (spectrum?: Record<string, number>) => void;  // Now receives spectrum on close
  primaryColor?: string;
  initialSpectrum?: Record<string, number>;              // NEW: Pre-fill values
  initialStep?: number;                                   // NEW: Start on specific slide
}
```

Usage in mini app:
```tsx
<SquaresWidget
  onClose={(spectrum) => {
    // spectrum contains user's selections
    // Save to database, check for changes, etc.
  }}
  initialSpectrum={existingSpectrum}  // Show saved values
  initialStep={3}                      // Start on results slide
/>
```

## Troubleshooting

### TypeScript Errors

If you see errors about missing props (`initialSpectrum`, `initialStep`):
```bash
# Rebuild widget package
cd packages/react
npm run build
cd ../..

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Widget Not Loading

**Issue**: Infinite loading screen
**Fix**: Ensure `sdk.actions.ready()` is called in `MiniAppClient.tsx` (line 70)

### No User Context

**Issue**: `user` is null
**Fix**: 
- Enable developer mode: https://farcaster.xyz/~/settings/developer-tools
- Test in Farcaster client, not regular browser

### Manifest Errors

**Issue**: "Invalid manifest" or "Domain mismatch"
**Fix**:
- All URLs in manifest must match your domain exactly
- Account association must be generated for the same domain
- No trailing slashes in URLs

### Database Errors

**Issue**: "relation 'farcaster_spectrums' does not exist"
**Fix**: Run the migration in Supabase

**Issue**: RLS policy errors
**Fix**: The migration sets up public read access - check if it ran successfully

## Production Deployment

1. **Deploy app to production** (Vercel, etc.)
2. **Update manifest** with production URLs
3. **Generate new account association** for production domain
4. **Apply database migration** to production Supabase
5. **Register mini app** at https://farcaster.xyz/~/developers/mini-apps/manifest
6. **Test thoroughly** before announcing

## Testing Checklist

- [ ] New user can complete assessment
- [ ] Results save to database (check Supabase)
- [ ] Returning user sees results slide immediately
- [ ] "Start Over" works correctly
- [ ] Update detection shows prompt when values change
- [ ] Leaderboard displays correctly
- [ ] Sorting options work (recent, diversity, updates)
- [ ] User's entry is highlighted in leaderboard
- [ ] Mobile responsive
- [ ] Works in Warpcast app

## Next Steps

### Optional Enhancements

1. **Notifications**: Implement webhook at `/api/farcaster/webhook`
2. **Analytics**: Track usage patterns
3. **Sharing**: Let users share their squares as casts
4. **Comparisons**: Show similarity scores between users
5. **Filters**: Filter leaderboard by date range, diversity range, etc.

### Resources

- Full docs: `FARCASTER_MINIAPP_SETUP.md`
- Farcaster Mini Apps: https://miniapps.farcaster.xyz
- SDK Reference: https://miniapps.farcaster.xyz/docs/sdk
- Community: Farcaster @pirosb3, @linda, @deodad

## Support

**Common Issues:**
1. Check browser console for errors
2. Validate manifest at manifest tool
3. Test API endpoints with curl
4. Check database entries in Supabase

**Still stuck?**
- Review `FARCASTER_MINIAPP_SETUP.md` for detailed troubleshooting
- Test with the helper script: `./scripts/test-miniapp-local.sh`
- Reach out on Farcaster developer channels
