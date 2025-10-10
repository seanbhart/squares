import { supabase } from '../supabase/client';
import { analyzeFigure, getAnalysisStatus } from '../api/figures';

export interface TimelineEntry {
  label: string;
  spectrum: number[];
  note: string;
}

export interface AdminFigure {
  id: string;
  name: string;
  lifespan: string;
  spectrum: number[];
  is_featured: boolean;
  featured_order: number | null;
  created_at: string;
  updated_at: string;
  timeline?: TimelineEntry[];
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
 * Get a single figure with timeline
 */
export async function getFigureWithTimeline(figureId: string) {
  const { data: figure, error } = await supabase
    .from('figures')
    .select('*')
    .eq('id', figureId)
    .single();

  if (error) throw error;

  const { data: timeline, error: timelineError } = await supabase
    .from('timeline_entries')
    .select('*')
    .eq('figure_id', figureId)
    .order('entry_order');

  if (timelineError) throw timelineError;

  return {
    ...figure,
    timeline: timeline || [],
  };
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
    .limit(1);

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0] : null;
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
 * Add a role to a user
 */
export async function addUserRole(userId: string, role: string) {
  // Get current roles
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('roles')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  const currentRoles = userData?.roles || [];
  if (currentRoles.includes(role)) {
    return; // Role already exists
  }

  const newRoles = [...currentRoles, role];

  const { error } = await supabase
    .from('users')
    .update({ roles: newRoles, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Remove a role from a user
 */
export async function removeUserRole(userId: string, role: string) {
  // Get current roles
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('roles')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  const currentRoles = userData?.roles || [];
  const newRoles = currentRoles.filter((r: string) => r !== role);

  const { error } = await supabase
    .from('users')
    .update({ roles: newRoles, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Remove admin role from user
 */
export async function removeAdmin(userId: string) {
  return removeUserRole(userId, 'admin');
}

/**
 * Add admin role to user
 */
export async function makeAdmin(userId: string) {
  return addUserRole(userId, 'admin');
}

/**
 * Create or update user by email (for pre-assigning roles)
 */
export async function createOrUpdateUserByEmail(email: string, roles: string[]) {
  // Check if user already exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    // User exists, update their roles
    const { error } = await supabase
      .from('users')
      .update({
        roles,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (error) throw error;
  } else {
    // User doesn't exist, create a pending user record
    // Database will auto-generate UUID for id
    const { error } = await supabase
      .from('users')
      .insert({
        email,
        roles,
        is_pending: true,
      });

    if (error) throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
