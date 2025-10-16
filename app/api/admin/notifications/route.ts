import { NextRequest, NextResponse } from 'next/server'
import {
  getAllNotificationTokens,
  getNotificationStats,
  sendTestNotification,
  sendBroadcastNotification,
  deleteNotificationToken,
  getNotificationTokensWithUserInfo,
} from '@/lib/admin/notifications'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  try {
    switch (action) {
      case 'list':
        const tokens = await getNotificationTokensWithUserInfo()
        return NextResponse.json({ tokens })
        
      case 'stats':
        const stats = await getNotificationStats()
        return NextResponse.json(stats)
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Admin API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, fid, title, body: messageBody, targetUrl } = body
    
    switch (action) {
      case 'test':
        if (!fid) {
          return NextResponse.json({ error: 'FID required' }, { status: 400 })
        }
        const success = await sendTestNotification(fid)
        return NextResponse.json({ success })
        
      case 'broadcast':
        if (!title || !messageBody) {
          return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
        }
        const result = await sendBroadcastNotification(
          title,
          messageBody,
          targetUrl || 'https://farcaster.squares.vote/miniapp'
        )
        return NextResponse.json(result)
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Admin API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    
    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }
    
    await deleteNotificationToken(parseInt(fid))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
