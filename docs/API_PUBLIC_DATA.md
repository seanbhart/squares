# Squares Public Data API

**Endpoint**: `GET /api/v1/data/spectrums`  
**Authentication**: None required (public data)  
**Rate Limiting**: Shared limits with other endpoints

## Overview

The Public Data API provides access to political spectrum data from Squares users who have opted to share their data publicly. This endpoint is useful for:

- Research and analysis of political distributions
- Data visualization projects
- Academic studies
- Demographic analysis
- Building third-party tools and dashboards

## Key Features

✅ **No authentication required** - Open access to public data  
✅ **Opt-in only** - Users must explicitly choose to share their data  
✅ **Comprehensive data** - Includes all 5 TAME-R dimensions  
✅ **Pagination support** - Handle large datasets efficiently  
✅ **Flexible filtering** - Filter by diversity score  
✅ **Multiple sort options** - Sort by date, diversity, or update frequency

## Endpoint Details

### Request

```http
GET /api/v1/data/spectrums?page=1&limit=100&sort=created_at&order=desc
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `100` | Results per page (max: 1000) |
| `sort` | string | `created_at` | Sort field: `created_at`, `updated_at`, `diversity_score`, `times_updated` |
| `order` | string | `desc` | Sort order: `asc` or `desc` |
| `min_diversity` | float | none | Minimum diversity score filter (0.0+) |
| `max_diversity` | float | none | Maximum diversity score filter |

### Response Format

```json
{
  "data": [
    {
      "id": "uuid",
      "fid": 12345,
      "username": "alice",
      "display_name": "Alice Smith",
      "pfp_url": "https://...",
      "trade_score": 2,
      "abortion_score": 4,
      "migration_score": 3,
      "economics_score": 5,
      "rights_score": 1,
      "times_updated": 3,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-20T14:20:00Z",
      "diversity_score": 1.58
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total_results": 5432,
    "total_pages": 55,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "query_timestamp": "2025-01-27T12:00:00Z",
    "data_type": "public_user_spectrums",
    "note": "Only includes users who have opted to share their data publicly"
  }
}
```

### Response Fields

#### Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the spectrum record |
| `fid` | integer | Farcaster ID of the user |
| `username` | string | Farcaster username (may be null) |
| `display_name` | string | User's display name (may be null) |
| `pfp_url` | string | Profile picture URL (may be null) |
| `trade_score` | integer | Trade policy position (0-6 scale) |
| `abortion_score` | integer | Abortion policy position (0-6 scale) |
| `migration_score` | integer | Migration policy position (0-6 scale) |
| `economics_score` | integer | Economic policy position (0-6 scale) |
| `rights_score` | integer | Civil rights position (0-6 scale) |
| `times_updated` | integer | Number of times user has updated their spectrum |
| `created_at` | ISO 8601 | When the spectrum was first created |
| `updated_at` | ISO 8601 | When the spectrum was last updated |
| `diversity_score` | float | Calculated political diversity (standard deviation from center) |

#### Score Scale (0-6)

Each dimension uses a 7-point scale from progressive to conservative:

- **0**: Very Progressive / Maximum Openness
- **1**: Progressive
- **2**: Lean Progressive
- **3**: Centrist / Moderate
- **4**: Lean Conservative
- **5**: Conservative
- **6**: Very Conservative / Maximum Restriction

#### Diversity Score

The `diversity_score` represents how far the user's positions are from the political center (3.0 on each dimension). Higher scores indicate more extreme or diverse positions across dimensions.

Formula:
```
diversity_score = sqrt(sum((score - 3)^2 for each dimension) / 5)
```

Interpretation:
- **0.0-1.0**: Moderate/Centrist across all dimensions
- **1.0-2.0**: Some clear leanings on specific issues
- **2.0-3.0**: Strong positions across most dimensions
- **3.0+**: Very strong or extreme positions

## Example Requests

### Basic Query (Default Parameters)

```bash
curl https://squares.vote/api/v1/data/spectrums
```

### Paginated Query

```bash
curl "https://squares.vote/api/v1/data/spectrums?page=2&limit=50"
```

### Sort by Diversity Score

```bash
curl "https://squares.vote/api/v1/data/spectrums?sort=diversity_score&order=desc&limit=10"
```

### Filter by Diversity Range

```bash
# Get users with moderate diversity scores (1.5-2.5)
curl "https://squares.vote/api/v1/data/spectrums?min_diversity=1.5&max_diversity=2.5"
```

### Get Most Active Users

```bash
curl "https://squares.vote/api/v1/data/spectrums?sort=times_updated&order=desc&limit=20"
```

## JavaScript Example

```javascript
async function fetchPublicSpectrums(options = {}) {
  const params = new URLSearchParams({
    page: options.page || 1,
    limit: options.limit || 100,
    sort: options.sort || 'created_at',
    order: options.order || 'desc',
    ...(options.minDiversity && { min_diversity: options.minDiversity }),
    ...(options.maxDiversity && { max_diversity: options.maxDiversity }),
  });

  const response = await fetch(
    `https://squares.vote/api/v1/data/spectrums?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Usage
const data = await fetchPublicSpectrums({
  page: 1,
  limit: 100,
  sort: 'diversity_score',
  order: 'desc',
});

console.log(`Fetched ${data.data.length} spectrums`);
console.log(`Total: ${data.pagination.total_results}`);
```

## Python Example

```python
import requests

def fetch_public_spectrums(
    page=1,
    limit=100,
    sort='created_at',
    order='desc',
    min_diversity=None,
    max_diversity=None
):
    params = {
        'page': page,
        'limit': limit,
        'sort': sort,
        'order': order,
    }
    
    if min_diversity is not None:
        params['min_diversity'] = min_diversity
    if max_diversity is not None:
        params['max_diversity'] = max_diversity
    
    response = requests.get(
        'https://squares.vote/api/v1/data/spectrums',
        params=params
    )
    response.raise_for_status()
    return response.json()

# Usage
data = fetch_public_spectrums(
    page=1,
    limit=100,
    sort='diversity_score',
    order='desc'
)

print(f"Fetched {len(data['data'])} spectrums")
print(f"Total: {data['pagination']['total_results']}")

# Calculate average scores
if data['data']:
    avg_trade = sum(s['trade_score'] for s in data['data']) / len(data['data'])
    avg_abortion = sum(s['abortion_score'] for s in data['data']) / len(data['data'])
    print(f"Average trade score: {avg_trade:.2f}")
    print(f"Average abortion score: {avg_abortion:.2f}")
```

## Data Visualization Page

Visit **[squares.vote/data](https://squares.vote/data)** to explore the public data through an interactive dashboard featuring:

- 📊 **Interactive charts** showing score distributions for each dimension
- 📋 **Sortable data table** with user profiles and scores
- ⬇️ **CSV export** for offline analysis
- 📈 **Summary statistics** including total users and average diversity

## Privacy & Ethics

### User Consent

- Users must **explicitly opt-in** to share their data publicly via the "Show Squares" button in the miniapp
- Default setting is **opt-out** (private)
- Users can toggle public/private status at any time
- When set to private, data is immediately removed from public endpoints

### Data Included

**Public data includes:**
- Farcaster ID (FID)
- Username and display name (if provided)
- Profile picture URL (if provided)
- Political spectrum scores across 5 dimensions
- Timestamp and update frequency metadata

**Data NOT included:**
- IP addresses
- Email addresses
- Private user metadata
- Analysis reasoning or detailed responses
- Any other PII

### Recommended Use

✅ **Appropriate uses:**
- Academic research on political distributions
- Aggregate statistical analysis
- Data visualization projects
- Educational tools
- Third-party applications

❌ **Inappropriate uses:**
- Harassment or targeting of individuals
- Doxxing or privacy violations
- Deceptive practices
- Discriminatory applications
- Selling or monetizing user data without consent

## Error Responses

### 400 Bad Request

```json
{
  "error": "invalid_parameters",
  "message": "Invalid sort field or order"
}
```

### 500 Internal Server Error

```json
{
  "error": "database_error",
  "message": "Failed to fetch public spectrums"
}
```

## Rate Limiting

This endpoint shares the same rate limits as authenticated API endpoints:

- **No API key required** for basic access
- Subject to general rate limiting to prevent abuse
- For high-volume usage, consider caching results locally
- Batch requests when possible to minimize load

## Data Freshness

- Data is updated in real-time as users complete or update their spectrums
- No caching on the API side
- `query_timestamp` in response indicates when data was fetched
- For analytics, consider caching results for 5-15 minutes

## TAME-R Framework

The five dimensions measured:

1. **Trade** - International trade policy (protectionism ↔ free trade)
2. **Abortion** - Reproductive rights policy (unrestricted ↔ total ban)
3. **Migration** - Immigration and border policy (open ↔ closed borders)
4. **Economics** - Economic intervention (free market ↔ state control)
5. **Rights** - Civil liberties & equality (full equality ↔ traditional hierarchy)

## Change Log

### 2025-01-27
- ✅ Initial release of public data API
- ✅ Added pagination support
- ✅ Added diversity score filtering
- ✅ Added multiple sort options
- ✅ Launched interactive data visualization page

## Support

- **Documentation**: [API Docs](https://squares.vote/api/docs)
- **Data Page**: [squares.vote/data](https://squares.vote/data)
- **Issues**: Report bugs via GitHub
- **Contact**: api@squares.vote

## Related Endpoints

- `GET /api/farcaster/spectrum?fid={fid}` - Get specific user's spectrum (requires opt-in)
- `POST /api/farcaster/spectrum` - Save user spectrum (authenticated)
- `GET /api/v1/usage` - Check API usage (requires API key)
