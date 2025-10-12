# Supabase SSR Authentication Setup Guide

Complete guide for setting up Supabase authentication with Next.js App Router and Server-Side Rendering.

## Table of Contents
- [Why This Is Complex](#why-this-is-complex)
- [Installation](#installation)
- [File Structure](#file-structure)
- [Step-by-Step Setup](#step-by-step-setup)
- [Common Issues & Debugging](#common-issues--debugging)
- [Testing the Setup](#testing-the-setup)

---

## Why This Is Complex

Unlike client-only auth (Firebase, Auth0 in SPAs), Supabase with Next.js SSR requires:

1. **Two separate client instances**:
   - Browser client for client components
   - Server client for server components/API routes

2. **Cookie management across boundaries**:
   - OAuth callbacks happen server-side
   - Cookies must persist: middleware → server component → client
   - Each boundary needs explicit cookie handling

3. **Next.js middleware quirks**:
   - Middleware creates responses before Supabase sets cookies
   - Must manually copy cookies to redirect responses

---

## Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## File Structure

```
lib/
├── supabase/
│   ├── browser.ts      # Client-side Supabase client
│   └── server.ts       # Server-side Supabase client
├── admin/
│   ├── client.ts       # Client-side auth functions
│   └── server.ts       # Server-side auth functions
middleware.ts           # OAuth callback handler & session refresh
```

---

## Step-by-Step Setup

### 1. Environment Variables

Create `.env.local` or `.env.development.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important**: Use `NEXT_PUBLIC_` prefix so they're available in both client and server.

### 2. Browser Client (`lib/supabase/browser.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Use in**: Client components, client-side hooks

### 3. Server Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseServer() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookie setting can fail in server components during render
            // This is expected and will be handled by middleware
          }
        },
      }
    }
  );
}
```

**Key points**:
- Must be `async` and `await cookies()`
- Use `getAll()` and `setAll()` (not `get`/`set`)
- Wrap `setAll` in try-catch (fails during render, works in middleware)

**Use in**: Server components, API routes, server actions

### 4. Middleware (`middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Clear old Supabase cookies from different projects (if migrating)
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-') && !cookie.name.includes('your-project-id')) {
      res.cookies.delete(cookie.name);
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, opts: any) => {
          req.cookies.set({ name, value, ...opts });
          res.cookies.set({ name, value, ...opts });
        },
        remove: (name: string, opts: any) => {
          req.cookies.set({ name, value: '', ...opts });
          res.cookies.set({ name, value: '', ...opts });
        }
      }
    }
  );

  // Check if this is an OAuth callback with a code
  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
    }
    
    // CRITICAL: Create new redirect response and copy cookies
    const url = req.nextUrl.clone();
    url.searchParams.delete('code');
    const redirectResponse = NextResponse.redirect(url);
    
    // Copy all cookies from res to the redirect response
    res.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie);
    });
    
    return redirectResponse;
  }

  // Refresh session if it exists
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Critical parts**:
- **OAuth callback handling**: Detect `code` param, exchange for session
- **Cookie copying**: Must copy cookies from `res` to `redirectResponse`
- **Session refresh**: Call `getSession()` on every request

### 5. Client-Side Auth Functions (`lib/admin/client.ts`)

```typescript
import { supabaseBrowser } from '../supabase/browser';

export async function signInWithGoogle() {
  const sb = supabaseBrowser();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const sb = supabaseBrowser();
  const { error } = await sb.auth.signOut();
  if (error) {
    throw error;
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  const sb = supabaseBrowser();
  return sb.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
```

**Use in**: Client components for login/logout actions

### 6. Server-Side Auth Functions (`lib/admin/server.ts`)

```typescript
import { supabaseServer } from '../supabase/server';

export async function getCurrentUser() {
  const sb = await supabaseServer();
  const { data: { user }, error } = await sb.auth.getUser();
  
  if (error) {
    throw error;
  }

  return user;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const sb = await supabaseServer();
  try {
    const { data, error } = await sb
      .from('users')
      .select('roles')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.roles || [];
  } catch {
    return [];
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return false;
    
    const roles = await getUserRoles(user.id);
    return roles.includes('admin');
  } catch {
    return false;
  }
}
```

**Use in**: Server components, API routes for checking auth status

### 7. Protected Server Component Example

```typescript
import { getCurrentUser, isAdmin } from '@/lib/admin/server';
import AdminClient from './AdminClient';
import LoginPage from './LoginPage';

// Force dynamic rendering (don't cache)
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser().catch(() => null);
  
  if (!user) {
    return <LoginPage />;
  }

  const isAdminUser = await isAdmin();
  
  if (!isAdminUser) {
    return <div>Access Denied</div>;
  }

  return <AdminClient initialUser={user} />;
}
```

**Key**: Add `export const dynamic = 'force-dynamic'` to prevent caching

---

## Common Issues & Debugging

### Issue 1: "Auth session missing!" Error

**Symptoms**:
```
AuthSessionMissingError: Auth session missing!
```

**Causes**:
1. Cookies not being set/read properly
2. Old cookies from different Supabase project
3. Server client not awaited

**Debug steps**:

```typescript
// In lib/supabase/server.ts
export async function supabaseServer() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Add this temporarily
  console.log('Server cookies:', allCookies.map(c => c.name).filter(n => n.startsWith('sb-')));
  
  // ... rest of code
}
```

**What to look for**:
- Should see cookies like: `sb-yourproject-auth-token.0`, `sb-yourproject-auth-token.1`
- If you see cookies with different project IDs, clear browser cookies
- If empty array `[]`, cookies aren't being set by middleware

**Fix**:
- Clear browser cookies for localhost
- Verify middleware is copying cookies to redirect response
- Check that `supabaseServer()` is being awaited: `const sb = await supabaseServer()`

### Issue 2: OAuth Callback Not Working

**Symptoms**:
- Redirected back to login page after Google OAuth
- URL has `?code=...` parameter

**Debug steps**:

```typescript
// In middleware.ts
if (code) {
  console.log('OAuth callback detected, exchanging code for session...');
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    console.error('Error exchanging code for session:', error);
  } else {
    console.log('Session created:', data.session ? 'Yes' : 'No');
    console.log('User:', data.user?.email);
  }
  // ... rest
}
```

**What to look for**:
- Should see "OAuth callback detected" in terminal
- Should see "Session created: Yes" and user email
- If error, check Supabase dashboard for OAuth provider setup

**Fix**:
- Ensure cookies are copied to redirect response (see middleware code)
- Verify OAuth redirect URL in Supabase dashboard matches your app URL

### Issue 3: Multiple Supabase Project Cookies

**Symptoms**:
- Cookies from old project: `sb-oldproject-auth-token.0`
- Cookies from new project: `sb-newproject-auth-token.0`

**Fix**:
Add cleanup to middleware (replace `your-project-id` with your actual project ID from the Supabase URL):

```typescript
// In middleware.ts, before creating supabase client
req.cookies.getAll().forEach(cookie => {
  if (cookie.name.startsWith('sb-') && !cookie.name.includes('your-project-id')) {
    res.cookies.delete(cookie.name);
  }
});
```

### Issue 4: Page Shows Cached Login State

**Symptoms**:
- Logged in but still see login page
- Have to refresh multiple times

**Fix**:
Add to protected pages:

```typescript
export const dynamic = 'force-dynamic';
```

This prevents Next.js from caching the page.

### Issue 5: "Cannot read properties of undefined (reading 'auth')"

**Symptoms**:
```
TypeError: Cannot read properties of undefined (reading 'auth')
```

**Cause**: Forgot to `await` the server client

**Fix**:
```typescript
// Wrong
const sb = supabaseServer();
const { data } = await sb.auth.getUser();

// Correct
const sb = await supabaseServer();
const { data } = await sb.auth.getUser();
```

---

## Testing the Setup

### 1. Test OAuth Flow

1. Navigate to `/admin` (or your protected route)
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Check terminal logs:
   ```
   OAuth callback detected, exchanging code for session...
   Session created: Yes
   User: your@email.com
   ```
5. Should be redirected to `/admin` without `?code=` param
6. Should see admin interface (not login page)

### 2. Test Session Persistence

1. Log in successfully
2. Refresh the page
3. Should stay logged in (not redirected to login)
4. Check browser cookies (DevTools → Application → Cookies):
   - Should see `sb-yourproject-auth-token.0`
   - Should see `sb-yourproject-auth-token.1`

### 3. Test Logout

1. Click logout button
2. Should be redirected to login page
3. Browser cookies should be cleared
4. Navigating to `/admin` should show login page

### 4. Test Protected Routes

1. Log out
2. Try to navigate directly to `/admin`
3. Should see login page
4. After login, should see admin interface

---

## Quick Reference: When to Use What

| Context | Use | Example |
|---------|-----|---------|
| Client Component | `supabaseBrowser()` | Login button, auth state listener |
| Server Component | `await supabaseServer()` | Protected pages, data fetching |
| API Route | `await supabaseServer()` | `/api/data` endpoints |
| Middleware | `createServerClient(...)` | OAuth callbacks, session refresh |
| Client Auth Actions | `lib/admin/client.ts` | `signInWithGoogle()`, `signOut()` |
| Server Auth Checks | `lib/admin/server.ts` | `getCurrentUser()`, `isAdmin()` |

---

## Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Both have `NEXT_PUBLIC_` prefix
- [ ] Values match your Supabase project dashboard
- [ ] Restart dev server after changing env vars

---

## Supabase Dashboard Checklist

- [ ] OAuth provider enabled (Google, GitHub, etc.)
- [ ] Redirect URLs configured:
  - `http://localhost:3000/admin` (development)
  - `https://yourdomain.com/admin` (production)
- [ ] Site URL set correctly
- [ ] Email templates configured (if using email auth)

---

## Final Notes

- **Always await** `supabaseServer()` in server contexts
- **Never use** `supabaseServer()` in client components
- **Never use** `supabaseBrowser()` in server components
- **Always add** `export const dynamic = 'force-dynamic'` to protected pages
- **Clear browser cookies** when switching between Supabase projects

---

## Troubleshooting Flowchart

```
Auth not working?
│
├─ Getting "Auth session missing"?
│  ├─ Check: Are cookies being set? (DevTools → Application → Cookies)
│  │  ├─ No cookies → Check middleware cookie copying
│  │  └─ Wrong project cookies → Clear browser cookies
│  └─ Check: Is supabaseServer() awaited?
│
├─ OAuth redirect loops?
│  ├─ Check: Middleware logs show "Session created: Yes"?
│  │  ├─ No → Check Supabase OAuth config
│  │  └─ Yes → Check cookie copying in middleware
│  └─ Check: Protected page has `dynamic = 'force-dynamic'`?
│
└─ Still not working?
   └─ Enable all debug logs and check terminal output
```

---

## Additional Resources

- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Cookies Docs](https://nextjs.org/docs/app/api-reference/functions/cookies)
