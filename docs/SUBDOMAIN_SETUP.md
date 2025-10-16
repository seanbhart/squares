# Subdomain Setup Guide

This document explains how to work with subdomains in both local development and production.

## Production Subdomains

- **data.squares.vote** → Maps to `/data` page
- **developer.squares.vote** → Maps to `/embed` page
- **squares.vote** (or www.squares.vote) → Main site

## Local Development Testing

### Option 1: Use *.localhost (Recommended)

Modern browsers support subdomain routing on localhost automatically.

**Access URLs:**
```
http://localhost:3000              → Main site
http://data.localhost:3000         → Data page
http://developer.localhost:3000    → Developer page
```

**No setup required!** Just navigate to the URLs above.

---

### Option 2: Use path-based URLs

You can also test using regular paths in development:
```
http://localhost:3000              → Main site
http://localhost:3000/data         → Data page
http://localhost:3000/embed        → Developer page
```

The middleware handles routing the same way internally.

---

## How It Works

### Middleware Routing
The middleware (`/middleware.ts`) detects the hostname and rewrites requests:

**Production:**
- `data.squares.vote/` → rewrites to `/data`
- `developer.squares.vote/` → rewrites to `/embed`

**Local Development:**
- `data.localhost:3000/` → rewrites to `/data`
- `developer.localhost:3000/` → rewrites to `/embed`
- `localhost:3000/data` → works as normal (no rewrite)

### Cross-Subdomain Links
Links that navigate between subdomains use regular `<a>` tags with environment-based URLs:

```typescript
const dataUrl = process.env.NODE_ENV === 'production' 
  ? 'https://data.squares.vote' 
  : 'http://data.localhost:3000';

<a href={dataUrl}>Public Data</a>
```

This approach:
- ✅ Simple and explicit
- ✅ No client-side detection needed
- ✅ Works in both environments automatically
- ✅ Full page navigation (appropriate for cross-subdomain links)

---

## DNS/Hosting Configuration

### Vercel Deployment

1. **Main site:** Deploy to vercel, add domain `squares.vote`
2. **Data subdomain:** In Vercel dashboard, add custom domain `data.squares.vote` pointing to the same project
3. **Developer subdomain:** Add custom domain `developer.squares.vote` pointing to the same project

All three domains point to the same Next.js deployment. The middleware handles routing internally.

### DNS Records (if not using Vercel DNS)

Add CNAME records in your DNS provider:
```
data.squares.vote       CNAME    cname.vercel-dns.com
developer.squares.vote  CNAME    cname.vercel-dns.com
```

---

## Testing Checklist

- [ ] Main site loads at `localhost:3000`
- [ ] Data page loads at `localhost:3000/data`
- [ ] Data page loads at `data.localhost:3000` (if testing subdomains)
- [ ] Embed page loads at `localhost:3000/embed`
- [ ] Developer page loads at `developer.localhost:3000` (if testing subdomains)
- [ ] All links and navigation work correctly
- [ ] Authentication works across subdomains
