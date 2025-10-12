import { supabaseServer } from '../supabase/server';

// Server-side functions (use in API routes or server components)
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
