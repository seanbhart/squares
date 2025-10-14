/**
 * Admin authentication for API key management
 */

import { NextRequest } from 'next/server';
import { supabaseServer } from '../supabase/server';
import { errorResponse } from './errors';

/**
 * Verify that the request is from an authenticated admin user
 * Returns the user ID if authenticated, or an error response
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<{ userId: string } | Response> {
  const supabase = await supabaseServer();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return errorResponse(
      'unauthorized',
      'Authentication required',
      401
    );
  }
  
  // Check if user is admin
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('roles')
    .eq('id', user.id)
    .single();
  
  if (userError || !userData) {
    return errorResponse(
      'forbidden',
      'Access denied',
      403
    );
  }
  
  if (!userData.roles || !userData.roles.includes('admin')) {
    return errorResponse(
      'forbidden',
      'Admin access required',
      403
    );
  }
  
  return { userId: user.id };
}
