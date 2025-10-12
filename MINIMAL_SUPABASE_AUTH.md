You want the bare-bones, nothing-cute skeleton: client signs in with Supabase, server API routes run as the signed-in user, row-level security does the real gatekeeping. Here’s the cleanest Next.js App Router setup that isn’t a house of cards.

# What you’re building

* **Client:** creates a browser Supabase client, renders login/logout, calls your API routes with the user’s cookies.
* **Middleware:** keeps the auth session cookie in sync so API routes know who you are.
* **API routes:** create a **server** Supabase client from `cookies()` and make RLS-safe queries “as the user.”
* **DB:** RLS turned on; policies keyed to `auth.uid()`.

# Minimal file tree

```
/app
  /api
    /me/route.ts           // example authenticated API route
  /login/page.tsx          // public page with sign-in UI
  /page.tsx                // protected page
/components
  SupabaseProvider.tsx     // puts browser client in context (optional but tidy)
/lib
  supabaseBrowser.ts       // createBrowserClient()
  supabaseServer.ts        // createServerClient() helper
/middleware.ts             // keeps session fresh
.env.local                 // keys
```

# 1) Install the only deps you actually need

```bash
npm i @supabase/supabase-js @supabase/ssr
```

> You don’t need the older “auth-helpers-nextjs.” `@supabase/ssr` is the current simple path.

# 2) Environment variables

`.env.local`

```ini
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
# Optional: ONLY for admin scripts, NEVER in user-facing routes:
# SUPABASE_SERVICE_ROLE_KEY=...
```

# 3) Tiny Supabase clients

`/lib/supabaseBrowser.ts`

```ts
import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

`/lib/supabaseServer.ts`

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
}
```

# 4) Keep sessions fresh in middleware

This updates auth cookies on navigation so server routes see the user.

`/middleware.ts`

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, opts: any) => {
          res.cookies.set({ name, value, ...opts });
        },
        remove: (name: string, opts: any) => {
          res.cookies.set({ name, value: '', ...opts });
        }
      }
    }
  );

  // touch session so cookies refresh if needed
  await supabase.auth.getUser().catch(() => {});

  return res;
}

// Run on everything, or narrow if you prefer.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

# 5) Simple sign-in page (client)

Use email magic link or whatever provider; here’s email to keep it primitive.

`/app/login/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) alert(error.message);
    else setSent(true);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign in</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: 8, width: 320 }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>Send link</button>
        </form>
      )}
    </main>
  );
}
```

Optional logout button anywhere:

```tsx
'use client';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function LogoutButton() {
  const sb = supabaseBrowser();
  return <button onClick={() => sb.auth.signOut()}>Sign out</button>;
}
```

# 6) Protect a page on the server

If user is missing, punt them to `/login`. No client-side roulette.

`/app/page.tsx`

```tsx
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function Home() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome, {user.email}</h1>
      <p>You’re authenticated. Try the /api/me route.</p>
    </main>
  );
}
```

# 7) Authenticated API route that queries as the user

This is the core trick: build the **server** client from `cookies()` and let RLS do the heavy lift. No service role key here.

`/app/api/me/route.ts`

```ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  const sb = supabaseServer();

  const { data: { user }, error: userErr } = await sb.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Example: fetch rows the user owns
  const { data, error } = await sb
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email }, notes: data });
}
```

Client calls it like any normal fetch:

```ts
const res = await fetch('/api/me', { cache: 'no-store' });
```

# 8) Database setup with RLS that won’t betray you

SQL you run once in Supabase:

```sql
-- Table
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- RLS on
alter table public.notes enable row level security;

-- Policy: users can see only their notes
create policy "read own notes"
on public.notes for select
using (auth.uid() = user_id);

-- Policy: users can insert only for themselves
create policy "insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);

-- Policy: users can update/delete only their rows (optional)
create policy "update own notes"
on public.notes for update
using (auth.uid() = user_id);

create policy "delete own notes"
on public.notes for delete
using (auth.uid() = user_id);
```

# 9) How the pieces fit (mentally, not just in your repo)

* **Auth happens in the browser.** Supabase sets session cookies.
* **Middleware** quietly keeps those cookies fresh on navigation.
* **On the server**, `createServerClient(... cookies ...)` reconstructs the user, so **API routes query as that user**. No secret keys needed, no trust falls.
* **RLS** enforces access. If you screw up a filter, RLS still blocks cross-user reads. Which is the point.

# 10) Common gotchas you can avoid

* If your API route returns 401 randomly, your middleware probably isn’t syncing cookies. Re-check `matcher`.
* Don’t use the **service role** in user-facing routes. That’s the “disable seatbelts and drive faster” key.
* If you SSR a protected page, fetch `auth.getUser()` on the **server** and redirect there, not in the client. Instant fail-fast, no flicker.
* For incremental complexity: server actions work the same pattern as API routes. Just call `supabaseServer()` in the action.

There. Minimal, predictable, and hard to break by accident. If you want me to bolt on OAuth providers, server actions, or optimistic mutations, say so and I’ll pretend I wasn’t already planning to refactor your entire stack.
