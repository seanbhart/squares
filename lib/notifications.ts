import { supabaseServer } from '@/lib/supabase/server'

interface SendNotificationParams {
  fid: number
  title: string
  body: string
  targetUrl: string
  notificationId: string
}

interface NotificationToken {
  notification_url: string
  notification_token: string
  enabled: boolean
}

interface SendNotificationResponse {
  result: {
    successfulTokens: string[]
    rateLimitedTokens: string[]
    invalidTokens: string[]
  }
}

/**
 * Send a notification to a user via their Farcaster client
 */
export async function sendNotification({
  fid,
  title,
  body,
  targetUrl,
  notificationId,
}: SendNotificationParams): Promise<boolean> {
  try {
    const supabase = await supabaseServer()
    
    // Get user's notification token from database
    const { data: tokenData, error } = await supabase
      .from('notification_tokens')
      .select('notification_url, notification_token, enabled')
      .eq('fid', fid)
      .eq('enabled', true)
      .single()
    
    if (error || !tokenData) {
      console.log(`[Notifications] No valid notification token for FID ${fid}`)
      return false
    }
    
    const { notification_url, notification_token } = tokenData as NotificationToken
    
    // Send notification to Farcaster client
    const response = await fetch(notification_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId,
        title,
        body,
        targetUrl,
        tokens: [notification_token],
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Notifications] Failed to send notification: ${response.status}`, errorText)
      return false
    }
    
    const result: SendNotificationResponse = await response.json()
    console.log(`[Notifications] Notification sent to FID ${fid}:`, result)
    
    return true
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error)
    return false
  }
}

/**
 * Send notifications to multiple users (batch up to 100)
 */
export async function sendBatchNotification({
  fids,
  title,
  body,
  targetUrl,
  notificationId,
}: Omit<SendNotificationParams, 'fid'> & { fids: number[] }): Promise<number> {
  try {
    const supabase = await supabaseServer()
    
    // Get notification tokens for all FIDs
    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('fid, notification_url, notification_token')
      .in('fid', fids)
      .eq('enabled', true)
    
    if (error || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      console.log('[Notifications] No valid tokens found for batch')
      return 0
    }
    
    // Group by notification_url (different Farcaster clients may have different URLs)
    const groupedByUrl = (tokens as Array<{ notification_url: string; notification_token: string }>).reduce((acc, token) => {
      if (!acc[token.notification_url]) {
        acc[token.notification_url] = []
      }
      acc[token.notification_url].push(token.notification_token)
      return acc
    }, {} as Record<string, string[]>)
    
    let successCount = 0
    
    // Send to each URL (batch up to 100 tokens per request)
    for (const [url, tokenList] of Object.entries(groupedByUrl)) {
      // Split into chunks of 100
      for (let i = 0; i < tokenList.length; i += 100) {
        const chunk = tokenList.slice(i, i + 100)
        
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              notificationId,
              title,
              body,
              targetUrl,
              tokens: chunk,
            }),
          })
          
          if (response.ok) {
            const result: SendNotificationResponse = await response.json()
            successCount += result.result.successfulTokens.length
            console.log(`[Notifications] Batch sent: ${result.result.successfulTokens.length} successful`)
          }
        } catch (error) {
          console.error('[Notifications] Error in batch send:', error)
        }
      }
    }
    
    return successCount
  } catch (error) {
    console.error('[Notifications] Error in batch notification:', error)
    return 0
  }
}

/**
 * Check if a user has notifications enabled
 */
export async function hasNotificationsEnabled(fid: number): Promise<boolean> {
  try {
    const supabase = await supabaseServer()
    
    const { data, error } = await supabase
      .from('notification_tokens')
      .select('enabled')
      .eq('fid', fid)
      .eq('enabled', true)
      .single()
    
    return !error && !!data
  } catch (error) {
    return false
  }
}
