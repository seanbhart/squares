# Farcaster Mini App - Assets Setup Guide

## Required Assets

Your mini app needs several image assets. Here's what you need and where to put them:

### 1. **Logo** (`/public/logo.png`)
- **Size**: 512x512px (square)
- **Purpose**: App icon, shown in app listings
- **Requirements**: 
  - Clear, simple design
  - Works at small sizes
  - PNG with transparency recommended
  
**Suggestion**: Use your favicon or create a simple colored square with "S" or "SQUARES" text

### 2. **Splash Image** (`/public/splash-image.png`)
- **Size**: 1200x630px (OG image size) or square 512x512px
- **Purpose**: Shown while app loads
- **Background**: Should match `splashBackgroundColor` in farcaster.json
  
**Suggestion**: Use logo centered on colored background, or use the OG image

### 3. **Screenshots** (for app store listing)
- **Files**: `/public/screenshot1.png`, `/public/screenshot2.png`
- **Size**: 1170x2532px (iPhone dimensions) or 1080x1920px (standard mobile)
- **Purpose**: Show users what your app looks like
- **Content**:
  - Screenshot 1: Assessment questions
  - Screenshot 2: Results/leaderboard
  
### 4. **Hero Image** (`/public/hero-image.png`)
- **Size**: 1200x630px
- **Purpose**: Featured image in app store
- **Content**: Overview of what the app does

---

## Quick Setup (Use Existing Assets)

If you don't have custom images yet, you can reuse what you already have:

```bash
# In /public directory:

# 1. Create logo from favicon
cp favicon.png logo.png

# 2. Use OG image as splash
cp og-image.png splash-image.png

# 3. Use OG image as hero
cp og-image.png hero-image.png

# 4. Create placeholder screenshots (optional - you can skip these for now)
# Take actual screenshots from your deployed miniapp and save them
```

---

## Update farcaster.json

After creating the images, update `/public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjQ2MTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhmQmFkOGM0NUM2Njk3MDYwNzFBNEYwNTAyZDMyMzcxQzMwNjM5NzFiIn0",
    "payload": "eyJkb21haW4iOiJzcXVhcmVzLnZvdGUifQ",
    "signature": "YOUR_NEW_SIGNATURE_HERE"
  },
  "miniapp": {
    "version": "1",
    "name": "Squares Political Spectrum",
    "iconUrl": "https://squares.vote/logo.png",
    "homeUrl": "https://squares.vote/miniapp",
    "imageUrl": "https://squares.vote/og-image.png",
    "buttonTitle": "Map Your Squares",
    "splashImageUrl": "https://squares.vote/splash-image.png",
    "splashBackgroundColor": "#1a1a1a",
    "webhookUrl": "https://squares.vote/api/farcaster/webhook",
    "subtitle": "Map your political views",
    "description": "Map your political positions across Trade, Abortion, Migration, Economics, and Rights using the TAME-R framework. See where you stand compared to the community.",
    "screenshotUrls": [
      "https://squares.vote/screenshot1.png",
      "https://squares.vote/screenshot2.png"
    ],
    "primaryCategory": "social",
    "tags": ["politics", "spectrum", "assessment", "community", "leaderboard"],
    "heroImageUrl": "https://squares.vote/hero-image.png",
    "tagline": "Map your political dimensions",
    "ogTitle": "Squares Political Spectrum",
    "ogDescription": "You're not one word—you're many dimensions. Map your positions with TAME-R.",
    "ogImageUrl": "https://squares.vote/og-image.png"
  }
}
```

**Important**: 
- Replace `squares.vote` with your actual domain
- The `payload` and `signature` must match your domain - you'll need to regenerate these

---

## Fixing "Ready not called" Error

The error occurs when the SDK takes too long to initialize. Here's what we've already done:

### Current Implementation (Already in MiniAppClient.tsx)

```typescript
useEffect(() => {
  const init = async () => {
    try {
      // Get context
      const context = await sdk.context;
      
      // Signal ready IMMEDIATELY after getting context
      await sdk.actions.ready();
      
      // Then do other work (fetch data, etc.)
      // ...
    } catch (error) {
      // Call ready even on error to dismiss splash
      await sdk.actions.ready();
    }
  };
  init();
}, []);
```

### Additional Fix: Timeout Safety

If the SDK is still not initializing, add a timeout:

```typescript
useEffect(() => {
  let readyCalled = false;
  
  // Fallback: call ready after 2 seconds no matter what
  const timeout = setTimeout(async () => {
    if (!readyCalled) {
      console.log('[Squares] Timeout - calling ready()');
      await sdk.actions.ready();
      readyCalled = true;
    }
  }, 2000);
  
  const init = async () => {
    try {
      const context = await sdk.context;
      
      if (!readyCalled) {
        await sdk.actions.ready();
        readyCalled = true;
        clearTimeout(timeout);
      }
      
      // Continue initialization...
    } catch (error) {
      if (!readyCalled) {
        await sdk.actions.ready();
        readyCalled = true;
        clearTimeout(timeout);
      }
    }
  };
  
  init();
  
  return () => clearTimeout(timeout);
}, []);
```

---

## Image Creation Tips

### Using Figma/Canva
1. **Logo**: Create 512x512px artboard, simple square design
2. **Splash**: Create 512x512px, add logo + background color
3. **Screenshots**: Create 1170x2532px, take actual app screenshots
4. **Hero**: Create 1200x630px, add app preview + tagline

### Using Screenshot Tools
1. Open your miniapp in mobile browser
2. Use browser dev tools (iPhone 12 Pro, 390x844)
3. Take screenshots of:
   - Question slide with spectrum selector
   - Results slide with colored squares
   - Leaderboard with sample data

### Quick & Dirty
```bash
# Just copy existing assets for now
cd public
cp favicon.png logo.png
cp og-image.png splash-image.png
cp og-image.png hero-image.png
# Skip screenshots for now - they're optional
```

---

## Regenerating Account Association

When you change domains, you need new `payload` and `signature`:

### Using Farcaster CLI (if available)
```bash
npx @farcaster/cli miniapp:verify --domain squares.vote
```

### Manual Process
1. Go to Warpcast settings
2. Go to Developer settings
3. Find your mini app
4. Update domain to `squares.vote`
5. Copy new payload and signature
6. Update farcaster.json

---

## Testing Checklist

After setup:

- [ ] All image URLs return 200 (not 404)
- [ ] Logo is square, clear at 64x64px
- [ ] Splash image matches background color
- [ ] Screenshots show actual app UI
- [ ] farcaster.json validates (check Warpcast dev console)
- [ ] Domain in farcaster.json matches your actual domain
- [ ] Mini app loads without "Ready not called" error
- [ ] Splash screen dismisses within 2 seconds

---

## Common Issues

### "Ready not called" still showing
- Check browser console for SDK errors
- Ensure SDK is actually loaded (check network tab)
- Add timeout fallback (see above)
- Check if running in Farcaster client vs regular browser

### Images not loading
- Check CORS headers (should allow Farcaster domains)
- Verify URLs are publicly accessible
- Check image file sizes (keep under 1MB)

### Domain verification failing
- Payload must encode your actual domain
- Signature must match the payload
- Use Farcaster CLI or dev console to regenerate

---

## Next Steps

1. Create/copy image assets
2. Update farcaster.json with correct URLs
3. Regenerate account association for your domain
4. Deploy and test in Warpcast
5. Submit to Farcaster Mini App directory
