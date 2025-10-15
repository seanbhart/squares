# Farcaster Mini App Setup

## Official Specification Reference

Based on https://miniapps.farcaster.xyz/docs/specification

---

## Required Images (Exact Specs)

### Icon (`iconUrl`) - REQUIRED
- **Size**: 1024x1024px PNG
- **Format**: PNG with **no alpha channel** (no transparency)
- **Your file**: `/public/icon-1024x1024.png` ✅

### Splash Image (`splashImageUrl`) - OPTIONAL but RECOMMENDED
- **Size**: 200x200px
- **Your file**: `/public/splash-200x200.png` ✅

### Hero Image (`heroImageUrl`) - OPTIONAL
- **Size**: 1200x630px (1.91:1 aspect ratio)
- **Your file**: `/public/hero-image.png` ✅

### OG Image (`ogImageUrl`) - OPTIONAL
- **Size**: 1200x630px (1.91:1 aspect ratio) PNG
- **Your file**: `/public/og-image.png` ✅

### Screenshots (`screenshotUrls`) - OPTIONAL
- **Size**: 1284x2778px (portrait)
- **Max**: 3 screenshots
- **Status**: Not added yet (optional)

---

## Manifest Structure

Location: `/public/.well-known/farcaster.json`

```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "miniapp": {
    "version": "1",
    "name": "Squares Political Spectrum",
    "homeUrl": "https://squares.vote/miniapp",
    "iconUrl": "https://squares.vote/icon-1024x1024.png",
    "splashImageUrl": "https://squares.vote/splash-200x200.png",
    "splashBackgroundColor": "#1a1a1a",
    "webhookUrl": "https://squares.vote/api/farcaster/webhook",
    "subtitle": "Map your political views",
    "description": "Map your political positions across Trade, Abortion, Migration, Economics, and Rights using the TAME-R framework.",
    "primaryCategory": "social",
    "tags": ["politics", "spectrum", "assessment", "community", "leaderboard"],
    "heroImageUrl": "https://squares.vote/hero-image.png",
    "tagline": "Map your political dimensions",
    "ogTitle": "Squares Political Spectrum",
    "ogDescription": "You're not one word—your politics are unique.",
    "ogImageUrl": "https://squares.vote/og-image.png"
  }
}
```

---

## Field Constraints

| Field | Required | Max Length | Notes |
|-------|----------|------------|-------|
| `version` | Yes | - | Must be "1" |
| `name` | Yes | 32 chars | App name |
| `homeUrl` | Yes | 1024 chars | Launch URL |
| `iconUrl` | Yes | 1024 chars | 1024x1024 PNG, no alpha |
| `splashImageUrl` | No | 32 chars | 200x200px |
| `splashBackgroundColor` | No | - | Hex color |
| `webhookUrl` | No | 1024 chars | Required for notifications |
| `subtitle` | No | 30 chars | No emojis/special chars |
| `description` | No | 170 chars | No emojis/special chars |
| `screenshotUrls` | No | - | 1284x2778, max 3 |
| `primaryCategory` | No | - | See categories below |
| `tags` | No | - | Max 5, 20 chars each, lowercase |
| `heroImageUrl` | No | - | 1200x630 (1.91:1) |
| `tagline` | No | 30 chars | - |
| `ogTitle` | No | 30 chars | - |
| `ogDescription` | No | 100 chars | - |
| `ogImageUrl` | No | - | 1200x630 PNG |

### Valid Categories
`games`, `social`, `finance`, `utility`, `productivity`, `health-fitness`, `news-media`, `music`, `shopping`, `education`, `developer-tools`, `entertainment`, `art-creativity`

---

## SDK Implementation

### Lazy Loading (Recommended for Hybrid Apps)

Since your app serves both a website and miniapp from the same domain, lazy load the SDK:

```typescript
// components/miniapp/MiniAppClient.tsx
useEffect(() => {
  const init = async () => {
    // Dynamically import SDK
    const { sdk } = await import('@farcaster/miniapp-sdk');
    
    // Initialize...
    const context = await sdk.context;
    await sdk.actions.ready(); // Dismiss splash screen
    
    // Continue setup...
  };
  
  init();
}, []);
```

### Ready() Timeout

Always call `sdk.actions.ready()` within 2-3 seconds to dismiss the splash screen:

```typescript
const readyTimeout = setTimeout(async () => {
  await sdk.actions.ready();
}, 2000);
```

---

## Meta Tags for Home URL Embed

**Status**: ✅ Already configured in `app/miniapp/page.tsx`

The following metadata is already set up for proper preview when the miniapp URL is shared:

```typescript
export const metadata: Metadata = {
  title: 'Squares Political Spectrum',
  description: '...',
  openGraph: {
    title: 'Squares Political Spectrum',
    description: "You're not one word—your politics are unique.",
    images: [{ 
      url: 'https://squares.vote/og-image.png',
      width: 1200,
      height: 630 
    }],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://squares.vote/og-image.png',
    'fc:frame:button:1': 'Map Your Squares',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://squares.vote/miniapp',
  },
};
```

---

## Account Association

Generate the signature for your domain:

1. Go to https://farcaster.xyz/~/developers
2. Find your mini app
3. Update domain to `squares.vote`
4. Copy new `header`, `payload`, and `signature`
5. Update `accountAssociation` in farcaster.json

---

## Testing Checklist

```bash
# Verify manifest
curl https://squares.vote/.well-known/farcaster.json | jq .

# Verify images load
curl -I https://squares.vote/icon-1024x1024.png     # Should be 200 OK
curl -I https://squares.vote/splash-200x200.png     # Should be 200 OK
curl -I https://squares.vote/hero-image.png         # Should be 200 OK
curl -I https://squares.vote/og-image.png           # Should be 200 OK

# Verify meta tags
curl https://squares.vote/miniapp | grep 'og:image'

# Test in Warpcast
# 1. Share URL in cast
# 2. Verify preview shows
# 3. Open miniapp
# 4. Verify splash dismisses < 2 seconds
```

---

## App Surface Specs

- **Mobile**: Device dimensions (fullscreen)
- **Web**: 424x695px vertical modal
- **Orientation**: Vertical only

---

## Current Status ✅

| Item | Status |
|------|--------|
| Icon (1024x1024 PNG, no alpha) | ✅ |
| Splash (200x200) | ✅ |
| Hero (1200x630) | ✅ |
| OG Image (1200x630) | ✅ |
| Manifest updated | ✅ |
| Account association | ✅ |
| SDK lazy loading | ✅ |
| Ready() timeout | ✅ |
| Meta tags | ✅ |

**Optional:**
- Screenshots (1284x2778) - Not added
- Can be added later for app store listing

---

## Deprecated Fields

These fields are deprecated and have been removed:

- `imageUrl` - Use `ogImageUrl` instead
- `buttonTitle` - No longer used

---

## Official Resources

- **Specification**: https://miniapps.farcaster.xyz/docs/specification
- **Publishing Guide**: https://miniapps.farcaster.xyz/docs/guides/publishing
- **SDK Reference**: https://miniapps.farcaster.xyz/docs/sdk
- **Developer Console**: https://farcaster.xyz/~/developers
