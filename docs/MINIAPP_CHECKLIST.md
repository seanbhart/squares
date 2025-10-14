# Farcaster Mini App - Setup Checklist

## ✅ Completed

### Images
- ✅ **logo.png** - Created from favicon
- ✅ **splash-image.png** - Created from og-image
- ✅ **hero-image.png** - Created from og-image
- ✅ Changed splash background color to `#1a1a1a` (dark theme)

### Code
- ✅ **sdk.actions.ready()** - Already called in MiniAppClient.tsx
- ✅ **Timeout fallback** - Added 2-second timeout to ensure ready() is called
- ✅ **Error handling** - ready() called even on SDK errors

### Configuration
- ✅ **farcaster.json** - Updated all URLs to use `squares.vote`
- ✅ Removed placeholder screenshot URLs (empty array for now)

---

## 🔄 Next Steps

### 1. Update Account Association (IMPORTANT!)

The `accountAssociation` in farcaster.json still has ngrok domain. You need to regenerate this for `squares.vote`:

**Option A: Using Warpcast**
1. Go to https://warpcast.com/~/developers
2. Find your mini app
3. Update domain to `squares.vote`
4. Copy new `payload` and `signature`
5. Update lines 4-5 in `/public/.well-known/farcaster.json`

**Option B: Using Farcaster CLI**
```bash
# Install if needed
npm install -g @farcaster/cli

# Generate new association
npx @farcaster/cli miniapp:verify --domain squares.vote --fid 4612

# Copy the output to farcaster.json
```

**Current (needs update):**
```json
"payload": "eyJkb21haW4iOiI1NWU2ODJiMWU5MTgubmdyb2stZnJlZS5hcHAifQ",
"signature": "mg7e02/pZS/Avp0lGBR3XK9zdl0o9YrveUHiS+G4CipggTwbqGZvi6VnYo2M7r4BSH5uBFQ5FdK4RiWgJGQE6Rs="
```

### 2. Optional: Add Screenshots

Screenshots make your mini app more attractive in the Farcaster directory:

```bash
# Take screenshots of your miniapp
# 1. Open https://squares.vote/miniapp in Chrome DevTools
# 2. Set device to iPhone 12 Pro (390x844)
# 3. Screenshot the assessment page
# 4. Screenshot the results page

# Save as:
# - public/screenshot1.png (assessment)
# - public/screenshot2.png (results)

# Then update farcaster.json:
"screenshotUrls": [
  "https://squares.vote/screenshot1.png",
  "https://squares.vote/screenshot2.png"
]
```

### 3. Test the Mini App

**After deploying:**

1. **Check image URLs work:**
   ```bash
   curl -I https://squares.vote/logo.png
   curl -I https://squares.vote/splash-image.png
   curl -I https://squares.vote/hero-image.png
   ```
   All should return `200 OK`

2. **Verify farcaster.json:**
   ```bash
   curl https://squares.vote/.well-known/farcaster.json
   ```
   Should return valid JSON

3. **Test in Warpcast:**
   - Open Warpcast app
   - Go to your mini app
   - Check that:
     - Splash screen shows correct image
     - Splash screen dismisses within 2 seconds
     - No "Ready not called" warning
     - App loads correctly

### 4. Submit to Farcaster Directory

Once everything works:

1. Go to https://warpcast.com/~/developers
2. Find your mini app
3. Click "Submit for Review"
4. Fill out any additional details
5. Wait for approval

---

## 🐛 Troubleshooting

### "Ready not called" Still Showing

**Check console logs:**
```javascript
// You should see these in order:
[Squares] Initializing Farcaster SDK...
[Squares] SDK context received: {...}
[Squares] App signaled ready
```

**If you see timeout message:**
```
[Squares] Timeout - calling ready() as fallback
```
This means SDK took >2 seconds. That's OK - splash will still dismiss.

**If SDK completely fails:**
The timeout ensures ready() is called after 2 seconds no matter what.

### Images Not Loading

**CORS issue:**
Check that your hosting allows Farcaster to load images:
```javascript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};
```

**File not found:**
Make sure images are in `/public` directory and publicly accessible.

### Domain Verification Failing

**Issue:** Payload/signature don't match domain

**Fix:** Regenerate account association (see Step 1 above)

---

## 📝 Current Status Summary

### What Works Now
✅ Splash image defined  
✅ ready() called with timeout fallback  
✅ All image assets created  
✅ farcaster.json updated with production URLs  
✅ Dark splash background (#1a1a1a)  

### What Needs Action
⚠️ Account association must be regenerated for squares.vote  
📸 Screenshots are optional but recommended  
🧪 Test in production after deployment  

---

## 🚀 Ready to Deploy

After updating account association:

```bash
# Commit changes
git add .
git commit -m "Setup Farcaster miniapp assets and fix ready() timeout"
git push

# Deploy (Vercel auto-deploys on push)
# Or manually:
vercel --prod
```

---

## 📚 Additional Resources

- **Setup Guide**: `/docs/MINIAPP_ASSETS_SETUP.md` - Detailed image requirements
- **Farcaster Docs**: https://docs.farcaster.xyz/developers/mini-apps
- **Warpcast Developer Console**: https://warpcast.com/~/developers
