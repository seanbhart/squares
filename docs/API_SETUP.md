# Squares API - Phase 1 Setup Guide

## Overview

Phase 1 implements the core infrastructure for the Squares Content Analysis API:
- ✅ Database schema for API keys and usage tracking
- ✅ Secure API key generation and authentication
- ✅ Rate limiting system
- ✅ Admin endpoints for key management
- ✅ Error handling and validation

## Prerequisites

1. **Supabase Project** - Already configured
2. **Environment Variables** - Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Installation Steps

### 1. Run Database Migration

Apply the new migration to create API tables:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration in Supabase SQL editor:
# File: supabase/migrations/20250123_create_api_keys.sql
```

This creates:
- `api_keys` - Store API key metadata and configuration
- `api_usage_logs` - Track all API requests
- `api_analyses` - Cache analysis results
- `api_keys_with_stats` - View with aggregated statistics

### 2. Make Yourself an Admin

Run this SQL in Supabase SQL Editor (replace with your email):

```sql
INSERT INTO users (id, email, roles)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com'),
  'your-email@gmail.com',
  ARRAY['admin']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET roles = ARRAY['admin']::TEXT[];
```

### 3. Deploy Changes

```bash
npm run build
# Deploy to Vercel or your hosting platform
```

## Creating Your First API Key

### Using cURL

```bash
curl -X POST https://your-domain.com/api/admin/keys \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "name": "Test Key",
    "contact_email": "test@example.com",
    "tier": "free",
    "organization": "Test Org"
  }'
```

**Important**: The response includes the plaintext API key - **this is the only time it will be shown!**

```json
{
  "api_key": "sq_live_abc123xyz...",
  "key_prefix": "sq_live_abc1",
  "id": "uuid-here",
  "name": "Test Key",
  "tier": "free",
  "rate_limit_per_minute": 5,
  "rate_limit_per_day": 100,
  "created_at": "2025-01-23T...",
  "expires_at": null
}
```

### Using Admin Dashboard (Future)

A web UI for key management will be added in Phase 3.

## Testing the API

### 1. Check Usage Endpoint

```bash
curl https://your-domain.com/api/v1/usage \
  -H "Authorization: Bearer sq_live_abc123xyz..."
```

Response:
```json
{
  "current_period": {
    "period": "2025-01-23",
    "requests_count": 0,
    "requests_limit": 100,
    "requests_remaining": 100
  },
  "rate_limits": {
    "per_minute": 5,
    "per_day": 100
  },
  "last_request_at": null
}
```

### 2. Test Rate Limiting

Make 6 requests in quick succession to test per-minute limit:

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl https://your-domain.com/api/v1/usage \
    -H "Authorization: Bearer sq_live_abc123xyz..." \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

The 6th request should return `429 Too Many Requests`.

## Managing API Keys

### List All Keys

```bash
curl https://your-domain.com/api/admin/keys \
  -H "Cookie: your-auth-cookie"
```

Query parameters:
- `page=1` - Page number (default: 1)
- `limit=20` - Items per page (default: 20, max: 100)
- `status=active` - Filter by status (active, suspended, revoked)
- `tier=free` - Filter by tier (free, standard, enterprise)

### Update a Key

```bash
curl -X PATCH https://your-domain.com/api/admin/keys/{key-id} \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "status": "suspended",
    "rate_limit_per_minute": 10
  }'
```

Updatable fields:
- `name` - Display name
- `organization` - Organization name
- `contact_email` - Contact email
- `status` - active, suspended, or revoked
- `rate_limit_per_minute` - Custom rate limit
- `rate_limit_per_day` - Custom daily limit
- `max_batch_size` - Maximum URLs in batch request
- `expires_at` - Expiration date
- `metadata` - Custom JSON metadata

### Revoke a Key

```bash
curl -X DELETE https://your-domain.com/api/admin/keys/{key-id}?reason=Security%20concern \
  -H "Cookie: your-auth-cookie"
```

## Rate Limiting

### Current Implementation

Phase 1 uses **in-memory rate limiting**:
- Suitable for single-server deployments
- Data persists only during server runtime
- Automatically cleans up expired entries

### Tier Limits

| Tier | Per Minute | Per Day | Max Batch |
|------|------------|---------|-----------|
| Free | 5 | 100 | 3 |
| Standard | 30 | 1,000 | 10 |
| Enterprise | 100 | 10,000 | 50 |

### Response Headers

Every API response includes rate limit headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1705243200
```

### Rate Limit Errors

When exceeded, returns `429 Too Many Requests`:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 23 seconds.",
  "retry_after": 23
}
```

## Production Considerations

### Upgrade to Redis (Recommended)

For production with multiple servers, use **Upstash Redis**:

1. Install dependencies:
   ```bash
   npm install @upstash/redis
   ```

2. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=your_url
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```

3. Update `lib/api/rate-limit.ts` to use Redis instead of in-memory Map

### Database Maintenance

Run cleanup periodically (e.g., via cron):

```sql
-- Clean up old usage logs (older than 90 days)
SELECT cleanup_old_usage_logs(90);
```

### Monitoring

Monitor these metrics:
- API request count by endpoint
- Error rate by status code
- Rate limit hits
- Processing time
- Database size of `api_usage_logs`

## Security Best Practices

1. **Never log plaintext API keys** - Only log key_prefix
2. **Use HTTPS only** - API keys transmitted in headers
3. **Rotate admin credentials** - Regularly update admin passwords
4. **Monitor for abuse** - Watch for unusual patterns
5. **Set expiration dates** - For temporary keys
6. **Revoke compromised keys** - Immediately if suspected

## Troubleshooting

### "Authentication required"

- Check Authorization header format: `Bearer sq_live_...`
- Verify API key is active (not revoked/suspended)
- Check key hasn't expired

### "Rate limit exceeded"

- Wait for reset time (check `X-RateLimit-Reset` header)
- Upgrade tier if limits are too low
- Check for rate limit customization on key

### "Admin access required"

- Verify user has `'admin'` in `roles` array in users table
- Check authentication cookie is valid
- Ensure using correct Supabase credentials

## Next Steps (Phase 2)

Phase 2 will add the actual analysis functionality:
- Content fetching from URLs
- AI-powered TAME-R analysis
- Result caching
- Batch processing
- Historical query endpoints

## File Structure

```
lib/api/
├── auth.ts              # API key authentication
├── admin-auth.ts        # Admin user authentication
├── config.ts            # Tier configuration
├── crypto.ts            # Key generation & hashing
├── errors.ts            # Error responses
├── rate-limit.ts        # Rate limiting logic
└── types.ts             # TypeScript types

app/api/
├── admin/
│   └── keys/
│       ├── route.ts     # POST (create), GET (list)
│       └── [id]/
│           └── route.ts # PATCH (update), DELETE (revoke)
└── v1/
    └── usage/
        └── route.ts     # GET usage stats

supabase/migrations/
└── 20250123_create_api_keys.sql
```

## Support

For issues or questions:
- Check logs in Supabase dashboard
- Review error messages in responses
- Check database state in Supabase SQL editor
