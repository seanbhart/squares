import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

interface WebhookEvent {
  header: string
  payload: string
  signature: string
}

interface NotificationDetails {
  url: string
  token: string
}

interface DecodedPayload {
  event: 'frame_added' | 'frame_removed' | 'miniapp_added' | 'miniapp_removed' | 'notifications_enabled' | 'notifications_disabled'
  notificationDetails?: NotificationDetails
}

interface DecodedHeader {
  fid: number
  type: string
  key: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookEvent = await request.json()
    
    const { header, payload, signature } = body
    
    // Decode payload
    const decodedPayload: DecodedPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    )
    
    const { event, notificationDetails } = decodedPayload
    
    // Extract FID from header
    const decodedHeader: DecodedHeader = JSON.parse(
      Buffer.from(header, 'base64url').toString('utf-8')
    )
    const fid = decodedHeader.fid
    
    console.log(`[Webhook] Received event: ${event} for FID: ${fid}`)
    console.log(`[Webhook] Notification details:`, notificationDetails)
    
    const supabase = await supabaseServer()
    
    switch (event) {
      case 'frame_added':
      case 'miniapp_added':
        // User added your frame/miniapp - notifications enabled by default
        if (notificationDetails) {
          const { error } = await supabase
            .from('notification_tokens')
            .upsert({
              fid,
              notification_url: notificationDetails.url,
              notification_token: notificationDetails.token,
              enabled: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'fid'
            })
          
          if (error) {
            console.error('[Webhook] Error saving notification token:', error)
            throw error
          }
          
          console.log(`[Webhook] Saved notification token for FID ${fid}`)
        }
        break
        
      case 'notifications_enabled':
        // User re-enabled notifications
        if (notificationDetails) {
          // Have new token details - upsert
          const { error } = await supabase
            .from('notification_tokens')
            .upsert({
              fid,
              notification_url: notificationDetails.url,
              notification_token: notificationDetails.token,
              enabled: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'fid'
            })
          
          if (error) {
            console.error('[Webhook] Error updating notification token:', error)
            throw error
          }
          
          console.log(`[Webhook] Enabled notifications for FID ${fid} (with new token)`)
        } else {
          // No new token details - just update enabled flag
          const { error } = await supabase
            .from('notification_tokens')
            .update({ 
              enabled: true,
              updated_at: new Date().toISOString(),
            })
            .eq('fid', fid)
          
          if (error) {
            console.error('[Webhook] Error enabling notifications:', error)
          } else {
            console.log(`[Webhook] Enabled notifications for FID ${fid} (existing token)`)
          }
        }
        break
        
      case 'notifications_disabled':
        // User disabled notifications - mark as disabled (but keep token for potential re-enable)
        const { error: disableError, data: disableData } = await supabase
          .from('notification_tokens')
          .update({ 
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq('fid', fid)
          .select()
        
        if (disableError) {
          console.error('[Webhook] Error disabling notifications:', disableError)
        } else if (!disableData || disableData.length === 0) {
          console.log(`[Webhook] No token found to disable for FID ${fid} (user may have never added the app)`)
        } else {
          console.log(`[Webhook] Disabled notifications for FID ${fid}`)
        }
        break
        
      case 'frame_removed':
      case 'miniapp_removed':
        // User removed your frame/miniapp - delete token
        const { error: deleteError } = await supabase
          .from('notification_tokens')
          .delete()
          .eq('fid', fid)
        
        if (deleteError) {
          console.error('[Webhook] Error deleting notification token:', deleteError)
          throw deleteError
        }
        
        console.log(`[Webhook] Deleted notification token for FID ${fid}`)
        break
        
      default:
        // Log unexpected events so we can add support for them
        console.log(`[Webhook] Unknown event type: ${event} for FID ${fid}`)
        console.log(`[Webhook] Full payload:`, decodedPayload)
        break
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Invalid request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
