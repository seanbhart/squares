# Vercel Monitoring & Alerts Setup

## Quick Start Checklist

- [ ] Enable Web Analytics
- [ ] Enable Speed Insights  
- [ ] Set up Usage Alerts
- [ ] Configure Edge Config (optional)
- [ ] Install Analytics SDK (optional)

---

## 1. Enable Web Analytics (2 minutes)

### Steps:
1. Go to https://vercel.com/[your-team]/squares
2. Click **Analytics** tab
3. Click **Enable Web Analytics**
4. Analytics are automatically injected (no code changes needed)

### What You Get:
- **Page views** - Track /data page traffic
- **Unique visitors** - See user growth
- **Top pages** - Identify popular pages
- **Referrers** - Where traffic comes from
- **Devices** - Desktop vs mobile split
- **Locations** - Geographic distribution

### Cost:
- **Free tier**: 2,500 events/month
- **Pro tier**: Unlimited

---

## 2. Enable Speed Insights (2 minutes)

### Steps:
1. Go to **Speed Insights** tab
2. Click **Enable Speed Insights**
3. Add to your app (recommended):

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### What You Get:
- **Core Web Vitals**
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- **API Response Times**
- **Real User Monitoring (RUM)**
- **Performance scores by page**

---

## 3. Set Up Usage Alerts (5 minutes)

### Bandwidth Alerts

1. Go to **Settings** → **Usage & Billing**
2. Scroll to **Usage Alerts**
3. Click **Configure Alerts**
4. Set up alerts:

**Alert 1: Bandwidth Warning**
```
Type: Bandwidth
Threshold: 80 GB (80% of free tier)
Email: your-email@gmail.com
```

**Alert 2: Bandwidth Critical**
```
Type: Bandwidth  
Threshold: 95 GB (95% of free tier)
Email: your-email@gmail.com
```

### Function Execution Alerts

**Alert 3: Execution Warning**
```
Type: Function Execution
Threshold: 80 GB-hours
Email: your-email@gmail.com
```

### Invocation Alerts

**Alert 4: Invocation Warning**
```
Type: Function Invocations
Threshold: 800,000 (80% of free tier)
Email: your-email@gmail.com
```

---

## 4. Monitor API Endpoint Performance

### View Function Logs

1. Go to **Deployments** → select latest deployment
2. Click **Functions** tab
3. Click on `/api/v1/data/spectrums`
4. View:
   - Invocation count
   - Error rate
   - Average duration
   - Memory usage

### Real-Time Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Tail logs
vercel logs squares --follow
```

### Filter Logs

```bash
# Show only API errors
vercel logs squares --grep "Error" --follow

# Show specific endpoint
vercel logs squares --grep "/api/v1/data/spectrums" --follow
```

---

## 5. Dashboard Overview

### Key Metrics to Monitor

**Daily Checks:**
- ✅ API error rate < 1%
- ✅ Avg response time < 500ms
- ✅ Bandwidth usage trend
- ✅ Active user count

**Weekly Checks:**
- ✅ Month-to-date bandwidth vs limit
- ✅ Top API consumers (check `api_usage_logs`)
- ✅ Function execution hours
- ✅ Core Web Vitals scores

**Monthly Checks:**
- ✅ Review all alerts received
- ✅ Optimize slow endpoints
- ✅ Consider tier upgrade if needed

---

## 6. Advanced Monitoring (Optional)

### Custom Analytics Events

```typescript
// Track specific user actions
import { track } from '@vercel/analytics';

// In your component
track('data_export', {
  format: 'csv',
  row_count: 100,
});

track('api_usage', {
  endpoint: '/api/v1/data/spectrums',
  query: 'sort=divergence_score',
});
```

### Performance Monitoring

```typescript
// Track custom metrics
import { sendToVercelAnalytics } from '@vercel/speed-insights';

const start = performance.now();
// ... your code ...
const duration = performance.now() - start;

sendToVercelAnalytics({
  metric: 'data_fetch_time',
  value: duration,
});
```

---

## 7. Alert Notification Setup

### Email Notifications

**Vercel sends emails automatically for:**
- ❗ Usage threshold alerts
- ❗ Build failures
- ❗ Deployment errors
- ❗ Domain issues

### Slack Integration (Optional)

1. Go to **Settings** → **Integrations**
2. Search for "Slack"
3. Click **Add Integration**
4. Select Slack workspace
5. Choose channels:
   - `#alerts` - Usage alerts
   - `#deployments` - Deployment notifications
   - `#errors` - Error notifications

### Discord Integration (Optional)

Use webhooks:

```bash
# Add webhook to environment
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

```typescript
// In your error handler
async function sendDiscordAlert(message: string) {
  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🚨 **Alert**: ${message}`,
    }),
  });
}
```

---

## 8. Cost Optimization

### Reduce Bandwidth Usage

**Enable caching:**
```typescript
// In your API route
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

**Use Edge Config for static data:**
```bash
npm install @vercel/edge-config
```

**Compress responses:**
```typescript
// Vercel automatically compresses responses > 1KB
// No action needed!
```

### Reduce Function Execution

**Use Edge Runtime:**
```typescript
export const runtime = 'edge'; // Already added!
```

**Minimize cold starts:**
- Keep functions < 50MB
- Use minimal dependencies
- Avoid large imports

---

## 9. Monitoring Checklist

### Daily
- [ ] Check for error spikes in dashboard
- [ ] Review API response times
- [ ] Check alerts inbox

### Weekly  
- [ ] Review bandwidth usage trend
- [ ] Check top API consumers
- [ ] Review `api_usage_logs` for anomalies
- [ ] Check Core Web Vitals scores

### Monthly
- [ ] Export usage report
- [ ] Review all alerts received
- [ ] Optimize slow endpoints
- [ ] Update rate limits if needed
- [ ] Rotate API keys (if security policy requires)

---

## 10. Troubleshooting Common Issues

### High Bandwidth Usage

**Check:**
```sql
-- Top bandwidth consumers
SELECT 
  k.name,
  COUNT(l.*) * 5 / 1024.0 as estimated_mb_used
FROM api_usage_logs l
JOIN api_keys k ON l.api_key_id = k.id
WHERE l.created_at > NOW() - INTERVAL '24 hours'
GROUP BY k.name
ORDER BY estimated_mb_used DESC;
```

**Fix:**
- Reduce default page limit
- Add response caching
- Implement pagination limits

### Slow Response Times

**Check:**
```sql
-- Slow queries
SELECT 
  endpoint,
  AVG(response_time_ms) as avg_ms,
  MAX(response_time_ms) as max_ms,
  COUNT(*) as request_count
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY endpoint
HAVING AVG(response_time_ms) > 1000
ORDER BY avg_ms DESC;
```

**Fix:**
- Add database indexes
- Optimize queries
- Use database connection pooling
- Enable edge caching

### High Error Rate

**Check Vercel Logs:**
```bash
vercel logs squares --grep "Error" --since 1h
```

**Check Error Breakdown:**
```sql
-- Error analysis
SELECT 
  status_code,
  error_message,
  COUNT(*) as error_count
FROM api_usage_logs
WHERE status_code >= 400
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY status_code, error_message
ORDER BY error_count DESC;
```

---

## Quick Reference

### Important URLs

- **Dashboard**: https://vercel.com/[team]/squares
- **Analytics**: https://vercel.com/[team]/squares/analytics
- **Speed Insights**: https://vercel.com/[team]/squares/speed-insights
- **Logs**: https://vercel.com/[team]/squares/logs
- **Settings**: https://vercel.com/[team]/squares/settings

### CLI Commands

```bash
# View logs
vercel logs squares --follow

# Deploy
vercel --prod

# Check environment variables
vercel env ls

# Add environment variable
vercel env add INTERNAL_DATA_API_KEY

# View deployments
vercel ls squares
```

### Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com (Pro plan)
- **Community**: https://github.com/vercel/vercel/discussions
