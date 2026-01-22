import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import {
  type ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from '@farcaster/miniapp-node'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature using Farcaster's official library
    // This validates that the webhook came from a legitimate Farcaster client
    // and was signed with a valid app key for the user
    let data: Awaited<ReturnType<typeof parseWebhookEvent>>
    try {
      data = await parseWebhookEvent(body, verifyAppKeyWithNeynar)
    } catch (e: unknown) {
      const error = e as ParseWebhookEvent.ErrorType

      switch (error.name) {
        case 'VerifyJsonFarcasterSignature.InvalidDataError':
        case 'VerifyJsonFarcasterSignature.InvalidEventDataError':
          console.error('[Webhook] Invalid webhook data:', error.message)
          return NextResponse.json(
            { error: 'Invalid webhook data' },
            { status: 400 }
          )
        case 'VerifyJsonFarcasterSignature.InvalidAppKeyError':
          console.error('[Webhook] Invalid app key - signature verification failed')
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          )
        case 'VerifyJsonFarcasterSignature.VerifyAppKeyError':
          console.error('[Webhook] Error verifying app key:', error.message)
          // Internal error - caller may want to retry
          return NextResponse.json(
            { error: 'Verification service error' },
            { status: 503 }
          )
        default:
          console.error('[Webhook] Signature verification failed:', error)
          return NextResponse.json(
            { error: 'Signature verification failed' },
            { status: 401 }
          )
      }
    }

    const { fid, event } = data
    const notificationDetails = 'notificationDetails' in event ? event.notificationDetails : undefined

    // Log only non-sensitive metadata (redact tokens)
    console.log(`[Webhook] Received event: ${event.event} for FID: ${fid}`)
    if (notificationDetails) {
      console.log(`[Webhook] Notification URL provided: ${notificationDetails.url ? 'yes' : 'no'}, Token provided: ${notificationDetails.token ? 'yes' : 'no'}`)
    }
    
    const supabase = await supabaseServer()
    const eventType = event.event

    switch (eventType) {
      case 'miniapp_added':
        // User added/installed your frame/miniapp
        // IMPORTANT: Just adding the app does NOT mean notifications are enabled
        // We only enable notifications if we explicitly receive notification token details
        if (notificationDetails) {
          // Received notification token - notifications ARE enabled
          const { error } = await supabase
            .from('notification_tokens')
            .upsert({
              fid,
              notification_url: notificationDetails.url,
              notification_token: notificationDetails.token,
              app_installed: true,
              enabled: true, // Explicitly enabled with token
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'fid'
            })
          
          if (error) {
            console.error('[Webhook] Error saving notification token:', error)
            throw error
          }
          
          console.log(`[Webhook] App installed WITH notifications enabled for FID ${fid}`)
        } else {
          // No notification details - just mark app as installed, notifications OFF
          const { error } = await supabase
            .from('notification_tokens')
            .upsert({
              fid,
              app_installed: true,
              enabled: false, // App installed but notifications NOT enabled
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'fid'
            })
          
          if (error) {
            console.error('[Webhook] Error marking app as installed:', error)
          } else {
            console.log(`[Webhook] App installed WITHOUT notifications for FID ${fid}`)
          }
        }
        break
        
      case 'notifications_enabled':
        // User enabled notifications (app should still be installed)
        if (notificationDetails) {
          // Have new token details - upsert
          const { error } = await supabase
            .from('notification_tokens')
            .upsert({
              fid,
              notification_url: notificationDetails.url,
              notification_token: notificationDetails.token,
              app_installed: true, // If enabling notifications, app must be installed
              enabled: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'fid'
            })
          
          if (error) {
            console.error('[Webhook] Error updating notification token:', error)
            throw error
          }
          
          console.log(`[Webhook] Notifications enabled for FID ${fid} (with new token)`)
        } else {
          // No new token details - just update enabled flag
          const { error } = await supabase
            .from('notification_tokens')
            .update({ 
              app_installed: true, // Ensure app_installed is true
              enabled: true,
              updated_at: new Date().toISOString(),
            })
            .eq('fid', fid)
          
          if (error) {
            console.error('[Webhook] Error enabling notifications:', error)
          } else {
            console.log(`[Webhook] Notifications enabled for FID ${fid} (existing token)`)
          }
        }
        break
        
      case 'notifications_disabled':
        // User disabled notifications - mark as disabled (but app might still be installed)
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
          console.log(`[Webhook] No record found to disable for FID ${fid} (user may have never added the app)`)
        } else {
          console.log(`[Webhook] Notifications disabled for FID ${fid} (app still installed: ${disableData[0].app_installed})`)
        }
        break
        
      case 'miniapp_removed':
        // User removed/uninstalled your frame/miniapp - mark as not installed
        // We keep the record for historical tracking but mark app_installed = false
        const { error: removeError, data: removeData } = await supabase
          .from('notification_tokens')
          .update({
            app_installed: false,
            enabled: false, // If app is removed, notifications are definitely disabled
            updated_at: new Date().toISOString(),
          })
          .eq('fid', fid)
          .select()
        
        if (removeError) {
          console.error('[Webhook] Error marking app as removed:', removeError)
        } else if (!removeData || removeData.length === 0) {
          console.log(`[Webhook] No record found for FID ${fid} to mark as removed`)
        } else {
          console.log(`[Webhook] App uninstalled for FID ${fid}`)
        }
        break
        
      default:
        // Log unexpected events so we can add support for them (redacted - no sensitive data)
        console.log(`[Webhook] Unknown event type: ${eventType} for FID ${fid}`)
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
