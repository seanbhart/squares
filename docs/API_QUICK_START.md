# Squares API - Quick Start Guide

**Phase 1 Status**: ✅ Core infrastructure complete (authentication, rate limiting, key management)  
**Phase 2 Status**: ⏳ Analysis endpoints coming soon

## Get an API Key

Contact the Squares team to request an API key. You'll receive:
- API key (format: `sq_live_...`)
- Tier assignment (free, standard, or enterprise)
- Rate limits

**Important**: Store your API key securely. It will only be shown once!

## Authentication

Include your API key in the `Authorization` header:

```bash
curl https://squares.vote/api/v1/usage \
  -H "Authorization: Bearer sq_live_your_key_here"
```

## Check Your Usage

```bash
GET /api/v1/usage
```

Response:
```json
{
  "current_period": {
    "period": "2025-01-23",
    "requests_count": 42,
    "requests_limit": 100,
    "requests_remaining": 58
  },
  "rate_limits": {
    "per_minute": 5,
    "per_day": 100
  },
  "last_request_at": "2025-01-23T14:30:00Z"
}
```

## Rate Limits by Tier

| Tier | Requests/Min | Requests/Day | Batch Size |
|------|--------------|--------------|------------|
| **Free** | 5 | 100 | 3 URLs |
| **Standard** | 30 | 1,000 | 10 URLs |
| **Enterprise** | 100 | 10,000 | 50 URLs |

## Coming in Phase 2

### Analyze Content (Single URL)

```bash
POST /api/v1/analyze
Content-Type: application/json

{
  "url": "https://example.com/article",
  "options": {
    "include_reasoning": true,
    "include_confidence": true
  }
}
```

Response:
```json
{
  "id": "analysis_abc123",
  "url": "https://example.com/article",
  "spectrum": {
    "trade": 2,
    "abortion": 4,
    "migration": 3,
    "economics": 5,
    "rights": 1
  },
  "reasoning": {
    "trade": "Article advocates for selective trade agreements...",
    "abortion": "Strong support for state-level restrictions...",
    ...
  },
  "confidence": {
    "trade": 0.85,
    "abortion": 0.92,
    ...
  },
  "emoji_signature": "🟩🟧🟨🟥🟦",
  "text_signature": "T2 A4 M3 E5 R1",
  "metadata": {
    "title": "Article Title",
    "excerpt": "First 200 characters...",
    "analyzed_at": "2025-01-23T14:30:00Z",
    "processing_time_ms": 3450,
    "cached": false
  }
}
```

### Batch Analysis (Multiple URLs)

```bash
POST /api/v1/analyze/batch

{
  "urls": [
    "https://example.com/article1",
    "https://example.com/article2"
  ],
  "options": {
    "include_reasoning": false
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": {}
}
```

Common errors:
- `401` - `authentication_required` - Missing or invalid API key
- `403` - `feature_not_available` - Feature not included in your tier
- `429` - `rate_limit_exceeded` - Rate limit exceeded
- `503` - `service_unavailable` - Content couldn't be fetched/analyzed

## Rate Limit Headers

Every response includes:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1705243200
```

## Best Practices

1. **Cache results** - Analysis results are stable, cache them locally
2. **Handle rate limits** - Implement exponential backoff
3. **Batch when possible** - More efficient than individual requests
4. **Monitor usage** - Check `/api/v1/usage` regularly
5. **Secure your key** - Never commit keys to git, use environment variables

## Example: TypeScript Client

```typescript
class SquaresAPI {
  constructor(private apiKey: string) {}
  
  async getUsage() {
    const response = await fetch('https://squares.vote/api/v1/usage', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  }
  
  // More methods coming in Phase 2
}

// Usage
const client = new SquaresAPI(process.env.SQUARES_API_KEY!);
const usage = await client.getUsage();
console.log(`${usage.current_period.requests_remaining} requests remaining`);
```

## Support

- **Documentation**: [Full API docs](/api/v1/docs) (coming in Phase 3)
- **Status**: Check service status at status.squares.vote
- **Issues**: Report bugs via GitHub
- **Contact**: api@squares.vote

## Changelog

### Phase 1 (2025-01-23)
- ✅ API key authentication
- ✅ Rate limiting
- ✅ Usage tracking
- ✅ Admin key management

### Phase 2 (Coming Soon)
- ⏳ Content analysis endpoint
- ⏳ Batch processing
- ⏳ Result caching
- ⏳ Historical queries

### Phase 3 (Future)
- 📋 Interactive API docs (Swagger)
- 📋 Admin dashboard
- 📋 Official SDKs (TypeScript, Python)
- 📋 Webhooks for async processing
