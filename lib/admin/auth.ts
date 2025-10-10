import { supabase } from '../supabase/client';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
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
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw error;
  }

  return user;
}

export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role || null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return false;
    
    const role = await getUserRole(user.id);
    return role === 'admin';
  } catch {
    return false;
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}
