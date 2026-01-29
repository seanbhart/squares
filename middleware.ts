import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl.clone();
  
  // Subdomain routing for production
  if (process.env.NODE_ENV === 'production') {
    // data.squares.vote -> /data page
    if (hostname.startsWith('data.')) {
      if (url.pathname === '/') {
        url.pathname = '/data';
        return NextResponse.rewrite(url);
      }
    }
    
    // developer.squares.vote -> /developer page
    if (hostname.startsWith('developer.')) {
      if (url.pathname === '/') {
        url.pathname = '/developer';
        return NextResponse.rewrite(url);
      }
    }
    
    // admin.squares.vote -> /admin page
    if (hostname.startsWith('admin.')) {
      if (url.pathname === '/') {
        url.pathname = '/admin';
        return NextResponse.rewrite(url);
      }
    }
  }
  
  // For local development with subdomain testing:
  // Use *.localhost:3000 (e.g., data.localhost:3000)
  if (hostname.includes('localhost')) {
    const subdomain = hostname.split('.')[0];
    
    if (subdomain === 'data' && url.pathname === '/') {
      url.pathname = '/data';
      return NextResponse.rewrite(url);
    }
    
    if (subdomain === 'developer' && url.pathname === '/') {
      url.pathname = '/developer';
      return NextResponse.rewrite(url);
    }
    
    if (subdomain === 'admin' && url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
  }
  
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Clear old Supabase cookies from different projects
  // Extract project ref from NEXT_PUBLIC_SUPABASE_URL dynamically
  const supabaseProjectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] || '';
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-') && supabaseProjectRef && !cookie.name.includes(supabaseProjectRef)) {
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
      // Redirect to auth error page on failure
      return NextResponse.redirect(new URL('/auth/error', req.url));
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
