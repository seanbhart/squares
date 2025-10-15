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
  event: 'miniapp_added' | 'miniapp_removed' | 'notifications_enabled' | 'notifications_disabled'
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
    
    const supabase = await supabaseServer()
    
    switch (event) {
      case 'miniapp_added':
        // User added your app - notifications enabled by default
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
          
          console.log(`[Webhook] Enabled notifications for FID ${fid}`)
        }
        break
        
      case 'notifications_disabled':
        // User disabled notifications - mark as disabled
        const { error: disableError } = await supabase
          .from('notification_tokens')
          .update({ 
            enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq('fid', fid)
        
        if (disableError) {
          console.error('[Webhook] Error disabling notifications:', disableError)
          throw disableError
        }
        
        console.log(`[Webhook] Disabled notifications for FID ${fid}`)
        break
        
      case 'miniapp_removed':
        // User removed your app - delete token
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
