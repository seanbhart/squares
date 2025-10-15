# Farcaster Notifications Implementation Guide

## Overview

This guide covers the notification system implemented for the Squares mini app.

## Architecture

### 1. Webhook Endpoint
**Location:** `app/api/farcaster/webhook/route.ts`

Receives events from Farcaster clients when users:
- Add the mini app (`miniapp_added`)
- Remove the mini app (`miniapp_removed`)
- Enable notifications (`notifications_enabled`)
- Disable notifications (`notifications_disabled`)

Each event includes a notification token that allows sending push notifications to that user.

### 2. Database Schema
**Migration:** `supabase/migrations/20250124_notification_tokens.sql`

Table: `notification_tokens`
- `fid` (INTEGER, PRIMARY KEY) - User's Farcaster ID
- `notification_url` (TEXT) - URL to send notifications to
- `notification_token` (TEXT) - Secret token for authentication
- `enabled` (BOOLEAN) - Whether notifications are currently enabled
- `created_at` (TIMESTAMP) - When token was first created
- `updated_at` (TIMESTAMP) - Last update time

### 3. Notification Utilities
**Location:** `lib/notifications.ts`

Functions:
- `sendNotification()` - Send to a single user
- `sendBatchNotification()` - Send to up to 100 users
- `hasNotificationsEnabled()` - Check if user has notifications enabled

## Setup Instructions

### 1. Apply Database Migration

Run the migration to create the `notification_tokens` table:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase dashboard
```

### 2. Deploy to Production

⚠️ **Important:** The `addMiniApp()` action only works on your production domain (`farcaster.squares.vote`).

```bash
npm run build
# Deploy to Vercel
```

### 3. Test the Flow

1. Open your mini app at `https://farcaster.squares.vote/miniapp`
2. Complete the assessment
3. You should see a prompt asking to add the mini app
4. Check your database - you should see a new entry in `notification_tokens`
5. Check server logs for webhook events

## Sending Notifications

### Example 1: Welcome Notification

Send a welcome notification when a user adds the app:

```typescript
import { sendNotification } from '@/lib/notifications'

// In your webhook handler or elsewhere
await sendNotification({
  fid: userFid,
  title: 'Welcome to Squares!',
  body: 'Thanks for adding Squares. Get notified when others match your political views.',
  targetUrl: 'https://farcaster.squares.vote/miniapp',
  notificationId: `welcome-${userFid}`,
})
```

### Example 2: Match Notification

Notify a user when someone with similar squares joins:

```typescript
await sendNotification({
  fid: targetUserFid,
  title: 'New Political Match!',
  body: `@${username} shares ${matchPercentage}% of your political views`,
  targetUrl: `https://farcaster.squares.vote/miniapp?highlight=${username}`,
  notificationId: `match-${targetUserFid}-${timestamp}`,
})
```

### Example 3: Weekly Summary (Batch)

Send weekly summaries to all active users:

```typescript
import { sendBatchNotification } from '@/lib/notifications'

// Get all users with notifications enabled
const { data: users } = await supabase
  .from('notification_tokens')
  .select('fid')
  .eq('enabled', true)

const fids = users?.map(u => u.fid) || []

const successCount = await sendBatchNotification({
  fids,
  title: 'Your Weekly Squares Summary',
  body: '25 new users joined this week. 5 match your political views.',
  targetUrl: 'https://farcaster.squares.vote/miniapp',
  notificationId: `weekly-summary-${weekNumber}`,
})

console.log(`Sent to ${successCount} users`)
```

## Rate Limits

Farcaster enforces these rate limits:
- **1 notification per 30 seconds** per token
- **100 notifications per day** per token

The system automatically handles these by:
- Using unique `notificationId` for deduplication
- Batching up to 100 users per request
- Retrying failed notifications

## User Experience

### When User Completes Assessment (First Time)

1. Results slide appears
2. After 1.5 seconds, prompt to add mini app appears
3. If user accepts:
   - App is added to their Farcaster client
   - Webhook receives `miniapp_added` event
   - Notification token is saved
   - User can now receive notifications

### When User Opens from Notification

When a user clicks a notification:
- App opens at the `targetUrl` specified
- `sdk.context.location.type` will be `'notification'`
- Access notification details via `sdk.context.location.notification`

## Best Practices

### 1. Use Meaningful notificationIds

Use descriptive IDs that prevent duplicates:
```typescript
// Good
notificationId: `daily-summary-2025-01-15`
notificationId: `match-${userId}-${matchedUserId}`

// Bad
notificationId: Math.random().toString() // No deduplication
```

### 2. Handle Errors Gracefully

```typescript
const success = await sendNotification({...})
if (!success) {
  console.log('User may have disabled notifications')
  // Don't retry immediately
}
```

### 3. Respect User Preferences

Check if notifications are enabled before sending:
```typescript
import { hasNotificationsEnabled } from '@/lib/notifications'

if (await hasNotificationsEnabled(fid)) {
  await sendNotification({...})
}
```

### 4. Don't Spam

- Aggregate updates into summaries
- Use daily/weekly digests instead of real-time notifications
- Let users control notification frequency

## Debugging

### Check Webhook Logs

```typescript
// Logs appear in Vercel/server logs
[Webhook] Received event: miniapp_added for FID: 12345
[Webhook] Saved notification token for FID 12345
```

### Check Database

```sql
-- See all notification tokens
SELECT fid, enabled, created_at, updated_at
FROM notification_tokens
ORDER BY updated_at DESC;

-- Check specific user
SELECT * FROM notification_tokens WHERE fid = 12345;
```

### Test Notification Sending

Create a test endpoint:

```typescript
// app/api/test-notification/route.ts
import { sendNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  const { fid } = await request.json()
  
  const success = await sendNotification({
    fid,
    title: 'Test Notification',
    body: 'This is a test from Squares!',
    targetUrl: 'https://farcaster.squares.vote/miniapp',
    notificationId: `test-${Date.now()}`,
  })
  
  return Response.json({ success })
}
```

## Common Issues

### "No valid notification token for FID"
- User hasn't added the mini app yet
- User disabled notifications
- Token was deleted

### "Failed to send notification: 401"
- Notification token expired or invalid
- User removed the app

### "addMiniApp() not working"
- Must be on production domain (`farcaster.squares.vote`)
- Won't work with tunnel URLs (ngrok, localtunnel)
- Check manifest is deployed and signed correctly

## Next Steps

### Implement Notification Features

1. **Match notifications** - When users with similar squares join
2. **Weekly digests** - Summary of community activity
3. **Response notifications** - When someone comments on their squares
4. **Milestone notifications** - When they reach certain milestones

### Monitor Performance

- Track notification delivery rates
- Monitor user engagement with notifications
- A/B test notification copy
- Measure conversion from notification to app usage

## Resources

- [Farcaster Notifications Spec](https://miniapps.farcaster.xyz/docs/specification#notifications)
- [Farcaster Webhooks Guide](https://miniapps.farcaster.xyz/docs/guides/notifications)
- [Example Implementation](https://github.com/farcasterxyz/frames-v2-demo)
