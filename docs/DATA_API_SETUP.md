# Public Data API - Setup Guide

## Overview

The Public Data API (`/api/v1/data/spectrums`) now requires API key authentication for security and rate limiting. This prevents abuse and allows us to monitor usage.

## Architecture

```
External Users → /api/v1/data/spectrums (requires API key)
                 ↓
                 Rate Limiting + Auth + Logging
                 ↓
                 Supabase Data

Public /data Page → /api/v1/data/internal (no key needed)
                    ↓
                    Uses INTERNAL_DATA_API_KEY
                    ↓
                    /api/v1/data/spectrums
```

## Setup Steps

### 1. Create Internal API Key

The `/data` page needs an internal API key to access the data endpoint without exposing credentials to the browser.

**In Supabase SQL Editor**, create a dedicated internal key:

```sql
-- First, make sure you're an admin
INSERT INTO users (id, email, roles)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com'),
  'your-email@gmail.com',
  ARRAY['admin']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET roles = ARRAY['admin']::TEXT[];
```

**Then create the internal API key via the admin API:**

```bash
# Using curl (or use your admin UI)
curl -X POST https://squares.vote/api/admin/keys \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Internal Data Page",
    "organization": "Squares Internal",
    "contact_email": "dev@squares.vote",
    "tier": "enterprise",
    "metadata": {
      "purpose": "Internal use for /data page",
      "created_by": "system"
    }
  }'
```

**Response will include:**
```json
{
  "api_key": "live_xxx...xxx",  // ⚠️ SAVE THIS - Only shown once!
  "key_prefix": "live_xxx",
  "id": "uuid",
  "name": "Internal Data Page",
  "tier": "enterprise"
}
```

### 2. Add Environment Variable

Add the API key to your environment:

**Local Development** (`.env.local`):
```bash
INTERNAL_DATA_API_KEY=live_xxx...xxx
```

**Vercel** (Project Settings → Environment Variables):
```
Name: INTERNAL_DATA_API_KEY
Value: live_xxx...xxx
Environment: Production, Preview, Development
```

### 3. Deploy & Test

```bash
# Deploy to Vercel
git add .
git commit -m "Add API key authentication to data endpoint"
git push

# Test the endpoint
curl -X GET https://squares.vote/api/v1/data/spectrums \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

# Should return data with rate limit headers:
# X-RateLimit-Limit: 1000
# X-RateLimit-Remaining: 999
# X-RateLimit-Reset: 1234567890
```

---

## API Key Tiers

### Free Tier
- **Rate Limit**: 60 requests/minute, 10,000/day
- **Max Results**: 1000 per request
- **Cost**: Free
- **Use Case**: Individual researchers, students

### Standard Tier
- **Rate Limit**: 300 requests/minute, 100,000/day
- **Max Results**: 1000 per request  
- **Cost**: TBD
- **Use Case**: Small teams, data analysts

### Enterprise Tier
- **Rate Limit**: 1000 requests/minute, 1,000,000/day
- **Max Results**: 1000 per request
- **Cost**: Custom
- **Use Case**: Large organizations, research institutions

---

## Vercel Monitoring Setup

### 1. Enable Web Analytics

**In Vercel Dashboard:**
1. Go to your project → **Analytics** tab
2. Click **Enable Web Analytics**
3. This tracks:
   - Page views
   - Unique visitors
   - Top pages
   - Devices & browsers

### 2. Set Up Speed Insights

**In Vercel Dashboard:**
1. Go to **Speed Insights** tab
2. Click **Enable Speed Insights**
3. Monitor:
   - Core Web Vitals (LCP, FID, CLS)
   - API response times
   - Edge function performance

### 3. Configure Usage Alerts

**Set up bandwidth & execution alerts:**

1. Go to **Settings** → **Usage & Billing**
2. Click **Configure Alerts**
3. Set thresholds:
   - **Bandwidth**: Alert at 80 GB (80% of free tier)
   - **Function Execution**: Alert at 80 GB-hours
   - **Serverless Function Invocations**: Alert at 1M

**Email notifications will be sent when limits are approached.**

### 4. Add Custom Monitoring (Optional)

Install Vercel's monitoring package:

```bash
npm install @vercel/analytics
```

Add to your app:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 5. Monitor API Usage

**Check Supabase Dashboard:**
1. Go to **Reports** → **API**
2. Monitor:
   - Request count
   - Response times
   - Error rates
   - Top endpoints

**Check `api_usage_logs` table:**

```sql
-- Recent API usage
SELECT 
  api_key_id,
  endpoint,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY api_key_id, endpoint
ORDER BY request_count DESC;

-- Top users by volume
SELECT 
  k.name,
  k.organization,
  COUNT(l.*) as total_requests,
  AVG(l.response_time_ms) as avg_response_time
FROM api_usage_logs l
JOIN api_keys k ON l.api_key_id = k.id
WHERE l.created_at > NOW() - INTERVAL '24 hours'
GROUP BY k.id, k.name, k.organization
ORDER BY total_requests DESC
LIMIT 10;
```

---

## Security Best Practices

### 1. Rotate Keys Periodically

```bash
# Create new key
curl -X POST https://squares.vote/api/admin/keys \
  -H "Authorization: Bearer JWT" \
  -d '{ ... }'

# Update env var in Vercel
# Revoke old key
curl -X DELETE https://squares.vote/api/admin/keys/OLD_KEY_ID \
  -H "Authorization: Bearer JWT"
```

### 2. Monitor for Suspicious Activity

Watch for:
- ⚠️ Sudden spike in requests from one key
- ⚠️ High error rates (400s/500s)
- ⚠️ Unusual query patterns
- ⚠️ Requests at odd hours

### 3. Set Expiration Dates

For temporary access:

```sql
UPDATE api_keys 
SET expires_at = NOW() + INTERVAL '30 days'
WHERE name = 'Research Project X';
```

### 4. Use HTTPS Only

All API requests automatically use HTTPS on Vercel.

---

## Troubleshooting

### "Authentication Required" Error

**Cause**: No API key in request
**Fix**: Add header: `Authorization: Bearer YOUR_API_KEY`

### "Rate Limit Exceeded" Error

**Cause**: Too many requests
**Fix**: 
- Wait for rate limit reset (see `X-RateLimit-Reset` header)
- Request higher tier
- Implement exponential backoff

### "Internal API Key Not Configured" Error

**Cause**: `INTERNAL_DATA_API_KEY` not set in Vercel
**Fix**: Add environment variable in Vercel dashboard

### Slow Response Times

**Check**:
1. Query complexity (large `limit` values)
2. Database performance in Supabase
3. Vercel function logs for cold starts

---

## API Usage Examples

### Basic Request

```bash
curl -X GET "https://squares.vote/api/v1/data/spectrums?page=1&limit=100" \
  -H "Authorization: Bearer live_xxx...xxx"
```

### Filter by Divergence Score

```bash
curl -X GET "https://squares.vote/api/v1/data/spectrums?min_divergence=2.0&max_divergence=3.0" \
  -H "Authorization: Bearer live_xxx...xxx"
```

_Note: Legacy parameters `min_extremity`/`max_extremity` and `min_diversity`/`max_diversity` are still supported as aliases._

### Sort by Spread Score

```bash
curl -X GET "https://squares.vote/api/v1/data/spectrums?sort=spread_score&order=desc&limit=50" \
  -H "Authorization: Bearer live_xxx...xxx"
```

### JavaScript Example

```javascript
const API_KEY = 'live_xxx...xxx';

async function fetchSpectrums(page = 1) {
  const response = await fetch(
    `https://squares.vote/api/v1/data/spectrums?page=${page}&limit=100`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );
  
  if (!response.ok) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (response.status === 429) {
      const resetDate = new Date(parseInt(rateLimitReset) * 1000);
      throw new Error(`Rate limit exceeded. Resets at ${resetDate}`);
    }
    
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## Cost Monitoring

### Estimated Costs (Free Tier Limits)

**Vercel:**
- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours execution/month
- ✅ 1M function invocations/month

**At 5KB per response:**
- 100 GB = **~20M requests/month** (unlikely to hit)
- Rate limiting prevents abuse

**Supabase:**
- ✅ 500 MB storage
- ✅ 5 GB bandwidth/month  
- ✅ 50k API requests/month

**At 5KB per response:**
- 5 GB = **~1M requests/month**
- With rate limiting (60/min max), theoretical max = **2.6M/month**
- **⚠️ Most likely to hit this limit first**

### Upgrade Triggers

**Consider upgrading when:**
- Bandwidth consistently > 80% of limit
- Regular rate limit errors
- More than 10 active API keys
- Enterprise customers need SLAs

---

## Next Steps

- [ ] Create internal API key
- [ ] Add `INTERNAL_DATA_API_KEY` to Vercel
- [ ] Enable Vercel Analytics & Speed Insights
- [ ] Set up usage alerts
- [ ] Test public data page works
- [ ] Monitor for first week
- [ ] Document API for external users
- [ ] Create signup flow for API keys
