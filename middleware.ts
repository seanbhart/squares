import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Clear old Supabase cookies from different projects
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-') && !cookie.name.includes('wbafltmchtqbagrsudlf')) {
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
    
    // Redirect to remove the code from the URL - use res which has cookies
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
