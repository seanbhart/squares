import { supabaseServer } from '@/lib/supabase/server'
import { sendNotification, sendBatchNotification } from '@/lib/notifications'

export interface NotificationTokenRecord {
  fid: number
  notification_url: string
  notification_token: string
  app_installed: boolean
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface NotificationStats {
  total_tokens: number
  app_installed: number
  app_removed: number
  enabled_tokens: number
  disabled_tokens: number
}

/**
 * Get all notification tokens (admin only)
 */
export async function getAllNotificationTokens(): Promise<NotificationTokenRecord[]> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('notification_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notification tokens:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get notification stats (admin only)
 */
export async function getNotificationStats(): Promise<NotificationStats> {
  const supabase = await supabaseServer()
  
  const { data, error } = await supabase
    .from('notification_tokens')
    .select('app_installed, enabled')
  
  if (error) {
    console.error('Error fetching notification stats:', error)
    throw error
  }
  
  const total_tokens = data?.length || 0
  const app_installed = data?.filter(t => t.app_installed).length || 0
  const app_removed = data?.filter(t => !t.app_installed).length || 0
  const enabled_tokens = data?.filter(t => t.enabled).length || 0
  const disabled_tokens = total_tokens - enabled_tokens
  
  return {
    total_tokens,
    app_installed,
    app_removed,
    enabled_tokens,
    disabled_tokens,
  }
}

/**
 * Send a test notification to a specific FID
 */
export async function sendTestNotification(fid: number): Promise<boolean> {
  return await sendNotification({
    fid,
    title: 'Test from Squares Admin',
    body: 'This is a test notification. Your notifications are working!',
    targetUrl: 'https://farcaster.squares.vote/miniapp',
    notificationId: `admin-test-${fid}-${Date.now()}`,
  })
}

/**
 * Send a notification to all enabled users
 */
export async function sendBroadcastNotification(
  title: string,
  body: string,
  targetUrl: string
): Promise<{ sent: number; failed: number }> {
  const supabase = await supabaseServer()
  
  // Get all enabled FIDs
  const { data, error } = await supabase
    .from('notification_tokens')
    .select('fid')
    .eq('enabled', true)
  
  if (error || !data || data.length === 0) {
    return { sent: 0, failed: 0 }
  }
  
  const fids = data.map(t => t.fid)
  const notificationId = `broadcast-${Date.now()}`
  
  const successCount = await sendBatchNotification({
    fids,
    title,
    body,
    targetUrl,
    notificationId,
  })
  
  return {
    sent: successCount,
    failed: fids.length - successCount,
  }
}

/**
 * Delete a notification token (admin only)
 */
export async function deleteNotificationToken(fid: number): Promise<void> {
  const supabase = await supabaseServer()
  
  const { error } = await supabase
    .from('notification_tokens')
    .delete()
    .eq('fid', fid)
  
  if (error) {
    console.error('Error deleting notification token:', error)
    throw error
  }
}

/**
 * Get user info for FIDs with notifications
 */
export async function getNotificationTokensWithUserInfo(): Promise<Array<NotificationTokenRecord & { username?: string }>> {
  const supabase = await supabaseServer()
  
  // Get all notification tokens
  const { data: tokens, error: tokensError } = await supabase
    .from('notification_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (tokensError || !tokens) {
    throw tokensError
  }
  
  // Get user info for those FIDs
  const fids = tokens.map(t => t.fid)
  const { data: users, error: usersError } = await supabase
    .from('farcaster_spectrums')
    .select('fid, username')
    .in('fid', fids)
  
  if (usersError) {
    console.error('Error fetching user info:', usersError)
    return tokens
  }
  
  // Merge user info with tokens
  const userMap = new Map(users?.map(u => [u.fid, u.username]) || [])
  
  return tokens.map(token => ({
    ...token,
    username: userMap.get(token.fid),
  }))
}
