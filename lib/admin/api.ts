import { supabase } from '../supabase/client';
import { analyzeFigure, getAnalysisStatus } from '../api/figures';

export interface AdminFigure {
  id: string;
  name: string;
  lifespan: string;
  spectrum: number[];
  is_featured: boolean;
  featured_order: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all figures with admin metadata
 */
export async function getAllFiguresAdmin(): Promise<AdminFigure[]> {
  const { data, error } = await supabase
    .from('figures')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Update figure featured status
 */
export async function updateFigureFeatured(
  figureId: string,
  isFeatured: boolean,
  featuredOrder: number | null
): Promise<void> {
  const { error } = await supabase
    .from('figures')
    .update({
      is_featured: isFeatured,
      featured_order: featuredOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', figureId);

  if (error) throw error;
}

/**
 * Delete a figure
 */
export async function deleteFigure(figureId: string): Promise<void> {
  const { error } = await supabase
    .from('figures')
    .delete()
    .eq('id', figureId);

  if (error) throw error;
}

/**
 * Reanalyze a figure
 */
export async function reanalyzeFigure(
  figureId: string,
  figureName: string,
  contextNotes?: string
): Promise<{ requestId: string }> {
  const result = await analyzeFigure({
    figureName,
    contextNotes,
    requestType: 'reanalysis',
    figureId,
  });

  return { requestId: result.requestId };
}

/**
 * Add a new figure via AI analysis
 */
export async function addNewFigure(
  figureName: string,
  contextNotes?: string
): Promise<{ requestId: string }> {
  const result = await analyzeFigure({
    figureName,
    contextNotes,
    requestType: 'new',
  });

  return { requestId: result.requestId };
}

/**
 * Get analysis request history
 */
export async function getAnalysisHistory(limit = 50) {
  const { data, error } = await supabase
    .from('analysis_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get or create system prompts table and fetch prompts
 */
export async function getSystemPrompts() {
  const { data, error } = await supabase
    .from('system_prompts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }

  return data || null;
}

/**
 * Update system prompts
 */
export async function updateSystemPrompts(prompts: {
  assessor_prompt: string;
  reviewer_prompt?: string;
}) {
  // First, try to get existing prompt
  const existing = await getSystemPrompts();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('system_prompts')
      .update({
        ...prompts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    // Insert new
    const { error } = await supabase
      .from('system_prompts')
      .insert({
        ...prompts,
      });

    if (error) throw error;
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const { error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Remove user (set role to 'user')
 */
export async function removeAdmin(userId: string) {
  return updateUserRole(userId, 'user');
}

/**
 * Make user an admin
 */
export async function makeAdmin(userId: string) {
  return updateUserRole(userId, 'admin');
}
