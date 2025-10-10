# Admin Setup Guide

## Initial Setup

### 1. Enable Google OAuth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your OAuth credentials from Google Cloud Console

### 2. Create Your First Admin

After signing in with Google for the first time, you need to grant yourself admin access.

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → Table Editor → `users` table
2. Find your user record (it should be auto-created after first sign-in)
3. Edit the `roles` column to `{admin}` (PostgreSQL array format)

**Option B: Via SQL**
Run this in the Supabase SQL Editor or via CLI:

```sql
UPDATE users 
SET roles = ARRAY['admin'] 
WHERE email = 'your-email@gmail.com';
```

### 3. Access Admin Panel

Navigate to `/admin` and sign in with your Google account. You should now have full admin access!

## Managing Other Admins

Once you're an admin, you can grant/revoke admin access to other users:

1. Go to `/admin`
2. Click the "Admins" tab
3. Find the user you want to promote
4. Click "Make Admin" or "Remove Admin"

## Database Migrations

To apply new migrations:

```bash
supabase db push
```

All migrations are tracked in `supabase/migrations/` and will be applied in order.

## Troubleshooting

**Can't access admin panel?**
- Make sure you've set your role to `admin` in the `users` table
- Try signing out and signing back in
- Check browser console for errors

**User record not created?**
- The trigger should auto-create user records on sign-in
- If it doesn't exist, manually insert:
  ```sql
  INSERT INTO users (id, email, roles)
  VALUES (
    'your-auth-user-id',
    'your-email@gmail.com',
    ARRAY['admin']
  );
  ```

**Note on Roles:**
- Users can have multiple roles (e.g., `{admin, moderator, user}`)
- The system checks if `admin` is in the roles array
- Future roles can be added without schema changes
