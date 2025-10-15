# Notification State Logic

## Core Principle

**Adding the miniapp/frame does NOT automatically mean notifications are enabled.**

We track two separate states:
- **`app_installed`** - Whether the user has the frame/miniapp installed
- **`enabled`** - Whether notifications are explicitly enabled (requires notification token)

## Webhook Event Handling

### `frame_added` / `miniapp_added`

**WITH notification details:**
```
app_installed: true
enabled: true
notification_url: <provided>
notification_token: <provided>
```
✅ App installed AND notifications enabled

**WITHOUT notification details:**
```
app_installed: true
enabled: false
notification_url: null
notification_token: null
```
✅ App installed but notifications NOT enabled

### `notifications_enabled`

**WITH notification details:**
```
app_installed: true (forced)
enabled: true
notification_url: <provided>
notification_token: <provided>
```
✅ Notifications explicitly enabled (updates or creates token)

**WITHOUT notification details:**
```
app_installed: true (forced)
enabled: true
notification_url: <unchanged>
notification_token: <unchanged>
```
✅ Notifications enabled using existing token

### `notifications_disabled`

```
app_installed: <unchanged>
enabled: false
notification_url: <unchanged>
notification_token: <unchanged>
```
⚠️ Notifications disabled but app may still be installed

### `frame_removed` / `miniapp_removed`

```
app_installed: false
enabled: false
notification_url: <unchanged>
notification_token: <unchanged>
```
❌ App removed (record kept for analytics)

## User State Matrix

| app_installed | enabled | Meaning | Can Send Notifications? |
|--------------|---------|---------|------------------------|
| true | true | App installed, notifications on | ✅ YES |
| true | false | App installed, notifications off | ❌ NO |
| false | true | Invalid state* | ❌ NO |
| false | false | App removed | ❌ NO |

*Invalid state: If app is not installed, notifications cannot be enabled. Webhook handlers prevent this by forcing `enabled: false` when `app_installed: false`.

## Admin Dashboard Display

### Stats Cards
- **Total Records** - All records in database
- **App Installed** - `WHERE app_installed = true`
- **App Removed** - `WHERE app_installed = false`
- **Notifications Enabled** - `WHERE enabled = true`
- **Notifications Disabled** - `WHERE enabled = false`

### Token Table
Shows for each user:
- **App Status** - "Installed" or "Removed" badge
- **Notifications** - "On" or "Off" badge
- **Test Button** - Only visible if `app_installed = true AND enabled = true`

## Example User Journeys

### Journey 1: Conservative User
```
1. User adds frame → app_installed: true, enabled: false
   (No notification token provided)
   
2. User later enables notifications → app_installed: true, enabled: true
   (Notification token now provided)
   
3. User disables notifications → app_installed: true, enabled: false
   (Still has app, just disabled notifications)
```

### Journey 2: Engaged User
```
1. User adds frame → app_installed: true, enabled: true
   (Notification token provided immediately)
   
2. User receives notifications → ✅ Working
   
3. User removes frame → app_installed: false, enabled: false
   (Record kept but no longer active)
```

### Journey 3: Re-installer
```
1. User adds frame → app_installed: true, enabled: false
2. User removes frame → app_installed: false, enabled: false
3. User re-adds frame → app_installed: true, enabled: true
   (New token provided this time)
   (Record updated, not duplicated)
```

## Broadcasting Logic

When sending broadcast notifications:

```sql
-- Get all users who can receive notifications
SELECT fid, notification_token
FROM notification_tokens
WHERE app_installed = true
  AND enabled = true
  AND notification_token IS NOT NULL
```

Only users with **both** app installed AND notifications enabled will receive broadcasts.

## Key Takeaways

1. ✅ **App installation ≠ Notification permission**
2. ✅ **Records are never deleted** (only marked `app_installed: false`)
3. ✅ **Notification tokens required** for `enabled: true`
4. ✅ **Both states tracked independently** for better analytics
5. ✅ **Webhook events update states separately** based on user actions
