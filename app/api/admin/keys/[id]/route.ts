/**
 * Admin API endpoints for managing individual API keys
 * PATCH /api/admin/keys/[id] - Update API key
 * DELETE /api/admin/keys/[id] - Revoke API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api/admin-auth';
import { invalidRequestError, handleError } from '@/lib/api/errors';
import { getServiceSupabase } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/keys/[id]
 * Update an API key's settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { userId } = authResult;
    const { id } = params;
    
    // Parse request body
    const body = await request.json();
    
    // Build update object
    const updates: Record<string, unknown> = {};
    
    // Allow updating these fields
    if (body.name !== undefined) updates.name = body.name;
    if (body.organization !== undefined) updates.organization = body.organization;
    if (body.contact_email !== undefined) updates.contact_email = body.contact_email;
    if (body.status !== undefined) {
      if (!['active', 'suspended', 'revoked'].includes(body.status)) {
        return invalidRequestError('Invalid status. Must be: active, suspended, or revoked');
      }
      updates.status = body.status;
      
      // If revoking, set revoked_at and revoked_by
      if (body.status === 'revoked') {
        updates.revoked_at = new Date().toISOString();
        updates.revoked_by = userId;
        if (body.revoke_reason) {
          updates.revoke_reason = body.revoke_reason;
        }
      }
    }
    
    if (body.rate_limit_per_minute !== undefined) {
      updates.rate_limit_per_minute = parseInt(body.rate_limit_per_minute);
    }
    if (body.rate_limit_per_day !== undefined) {
      updates.rate_limit_per_day = parseInt(body.rate_limit_per_day);
    }
    if (body.max_batch_size !== undefined) {
      updates.max_batch_size = parseInt(body.max_batch_size);
    }
    if (body.expires_at !== undefined) {
      updates.expires_at = body.expires_at;
    }
    if (body.metadata !== undefined) {
      updates.metadata = body.metadata;
    }
    
    if (Object.keys(updates).length === 0) {
      return invalidRequestError('No fields to update');
    }
    
    // Update the key
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating API key:', error);
      return invalidRequestError('Failed to update API key: ' + error.message);
    }
    
    if (!data) {
      return invalidRequestError('API key not found', { id });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/keys/[id]
 * Revoke an API key (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    
    const { userId } = authResult;
    const { id } = params;
    
    // Parse optional reason from query params
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Revoked by admin';
    
    // Revoke the key (soft delete)
    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revoke_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error revoking API key:', error);
      return invalidRequestError('Failed to revoke API key: ' + error.message);
    }
    
    if (!data) {
      return invalidRequestError('API key not found', { id });
    }
    
    return NextResponse.json({
      message: 'API key revoked successfully',
      key: data,
    });
  } catch (error) {
    return handleError(error);
  }
}
