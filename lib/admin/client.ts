import { supabaseBrowser } from '../supabase/browser';

// Client-side only functions
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
