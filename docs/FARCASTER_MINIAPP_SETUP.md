# Farcaster Mini App Setup Guide

## Overview

The Squares Farcaster Mini App allows users to map their political positions directly within Farcaster clients, with their results saved to a community leaderboard.

## Features

- **Interactive Widget**: Users take the TAME-R assessment directly in the mini app
- **Persistent Storage**: Results are saved with Farcaster ID in Supabase
- **Update Detection**: If users retake the assessment with different answers, they're prompted to update
- **Initial State**: Returning users see their results immediately with option to edit
- **Community Leaderboard**: View and compare positions with other users
- **Multiple Sorting**: Sort by recency, diversity score, or update frequency

## Project Structure

```
app/
├── miniapp/
│   └── page.tsx              # Mini app entry point
├── api/farcaster/
│   ├── spectrum/route.ts     # Spectrum CRUD endpoints
│   └── leaderboard/route.ts  # Leaderboard data endpoint

components/miniapp/
├── MiniAppClient.tsx         # Main mini app logic
├── MiniApp.module.css        # Mini app styles
├── Leaderboard.tsx           # Leaderboard component
└── Leaderboard.module.css    # Leaderboard styles

supabase/migrations/
└── 20250120_create_farcaster_spectrums.sql  # Database schema

public/.well-known/
└── farcaster.json           # Mini app manifest
```

## Database Schema

The `farcaster_spectrums` table stores:
- User's Farcaster ID (fid)
- Profile info (username, display_name, pfp_url)
- TAME-R scores (5 dimensions, 0-6 scale each)
- Metadata (times_updated, timestamps)

The `farcaster_leaderboard` view adds a calculated diversity score.

## Setup Instructions

### 1. Database Migration

Run the migration to create the farcaster_spectrums table:

```bash
# Apply to local Supabase (if using local dev)
supabase migration up

# Or apply directly to production Supabase via dashboard
# Navigate to SQL Editor and paste the migration file content
```

### 2. Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Manifest Configuration

Update `public/.well-known/farcaster.json`:

1. **Generate Account Association**: 
   - Visit https://farcaster.xyz/~/developers/mini-apps/manifest
   - Enter your domain (e.g., squares.vote)
   - Sign with your Farcaster account
   - Copy the accountAssociation object

2. **Update URLs**:
   - Replace all `squares.vote` URLs with your actual domain
   - For local dev, use `localhost:3000` or your ngrok URL

3. **Optional: Use Hosted Manifests**:
   Instead of serving the file, you can use Farcaster's hosted manifest service and set up a redirect in `next.config.js`:
   
   ```js
   async redirects() {
     return [
       {
         source: '/.well-known/farcaster.json',
         destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/YOUR_ID',
         permanent: false,
       },
     ]
   }
   ```

### 4. Update Widget Package

The widget has been updated to support initial state and spectrum callbacks:

```bash
# In your main app
npm install @squares-app/react@^2.4.0

# Or link locally during development
cd packages/react
npm link
cd ../..
npm link @squares-app/react
```

## Local Development & Testing

### Prerequisites

- **Node.js 22.11.0+** (required by Farcaster SDK)
- **Farcaster Account** with developer mode enabled
- **ngrok** or similar tunneling tool (for local testing)

### Steps

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```

2. **Create Public URL** (choose one):

   **Option A: ngrok (recommended)**:
   ```bash
   ngrok http 3000
   ```
   
   **Option B: localtunnel**:
   ```bash
   npx localtunnel --port 3000
   ```
   
   **Option C: cloudflared**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

3. **Update Manifest**:
   - Copy your ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Update ALL URLs in `farcaster.json` to use your ngrok domain
   - Generate a new account association for the ngrok domain

4. **Enable Developer Mode**:
   - Visit https://farcaster.xyz/~/settings/developer-tools
   - Toggle on "Developer Mode"

5. **Test Mini App**:
   
   **Method 1: Direct URL**:
   - Visit `https://farcaster.xyz/~/developers/mini-apps/test`
   - Enter your ngrok URL + `/miniapp`
   - Click "Open in Client"

   **Method 2: Manifest Tool**:
   - Visit https://farcaster.xyz/~/developers/mini-apps/manifest
   - Enter your ngrok URL
   - Click "Validate" to check manifest
   - Click "Open" to test in Warpcast

6. **Test Flow**:
   - New user: Should see widget from slide 1
   - Complete assessment: Results saved to database
   - Close and reopen: Should see results slide with "Start Over" option
   - Make changes: Should prompt to update
   - Check leaderboard: Your entry should appear

### Debugging Tips

1. **Check SDK Initialization**:
   - Open browser console
   - Look for Farcaster SDK logs
   - Verify `sdk.context` returns user info

2. **Verify Database**:
   ```sql
   SELECT * FROM farcaster_spectrums ORDER BY created_at DESC LIMIT 10;
   ```

3. **Test API Endpoints**:
   ```bash
   # Get spectrum
   curl http://localhost:3000/api/farcaster/spectrum?fid=YOUR_FID
   
   # Get leaderboard
   curl http://localhost:3000/api/farcaster/leaderboard?sortBy=recent&limit=10
   ```

4. **Common Issues**:
   - **Infinite loading**: Did you call `sdk.actions.ready()`?
   - **No user context**: Is developer mode enabled?
   - **Manifest errors**: Check all URLs match your domain exactly
   - **Database errors**: Did you run the migration?

## Production Deployment

1. **Deploy to Vercel/Production**:
   ```bash
   npm run build
   # Deploy to your hosting service
   ```

2. **Update Manifest**:
   - Replace all ngrok URLs with production domain
   - Generate new account association for production domain
   - Update in Farcaster manifest tool

3. **Register Mini App**:
   - Visit https://farcaster.xyz/~/developers/mini-apps/manifest
   - Validate your production manifest
   - Submit for indexing

4. **Enable Notifications** (Optional):
   - Implement webhook endpoint at `/api/farcaster/webhook`
   - Handle events: `miniapp_added`, `miniapp_removed`, etc.
   - See Farcaster docs for notification API

## API Endpoints

### GET /api/farcaster/spectrum
Fetch a user's saved spectrum.

**Query Params**:
- `fid` (required): Farcaster ID

**Response**:
```json
{
  "spectrum": {
    "fid": 12345,
    "trade_score": 2,
    "abortion_score": 1,
    ...
  }
}
```

### POST /api/farcaster/spectrum
Create or update a user's spectrum.

**Body**:
```json
{
  "fid": 12345,
  "username": "alice",
  "displayName": "Alice",
  "pfpUrl": "https://...",
  "spectrum": {
    "trade": 2,
    "abortion": 1,
    "migration": 3,
    "economics": 4,
    "rights": 1
  }
}
```

### GET /api/farcaster/leaderboard
Get leaderboard data.

**Query Params**:
- `sortBy`: `recent` | `diversity` | `updates` (default: recent)
- `limit`: number (default: 50)

**Response**:
```json
{
  "leaderboard": [...],
  "stats": {
    "totalUsers": 100,
    "avgDiversity": 1.8,
    "avgUpdates": 2.3
  }
}
```

## Widget Integration

The mini app uses the updated `@squares-app/react` widget with new props:

```tsx
<SquaresWidget
  onClose={(spectrum) => {
    // Called when user closes widget
    // spectrum contains current values if user completed assessment
  }}
  initialSpectrum={existingSpectrum}  // Pre-fill if user has taken it before
  initialStep={3}  // Start on results slide for returning users
  primaryColor="#57534e"
/>
```

## Resources

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz)
- [Farcaster SDK Reference](https://miniapps.farcaster.xyz/docs/sdk)
- [Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
- [Developer Tools](https://farcaster.xyz/~/settings/developer-tools)

## Support

For issues:
1. Check browser console for errors
2. Validate manifest at manifest tool
3. Test API endpoints directly
4. Reach out on Farcaster: @pirosb3, @linda, @deodad
