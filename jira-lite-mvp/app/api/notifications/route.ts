import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor') // timestamp

    let query = supabase
        .from('notifications')
        .select(`
            *,
            issue:issues!issue_id(title, project_id)
        `)
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (cursor) {
        query = query.lt('created_at', cursor)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    // Fetch actor profiles separately
    const actorIds = [...new Set(notifications.map(n => n.actor_id).filter(Boolean) as string[])]
    const actorProfiles: Record<string, any> = {}
    
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', actorIds)
      
      actors?.forEach(actor => {
        actorProfiles[actor.id] = actor
      })
    }

    // Transform notifications with actor data
    const transformedNotifications = notifications.map(n => ({
        ...n,
        actor: n.actor_id && actorProfiles[n.actor_id] ? {
            name: actorProfiles[n.actor_id].name,
            avatar_url: actorProfiles[n.actor_id].avatar_url
        } : null
    }))

    return NextResponse.json({ 
        success: true, 
        data: transformedNotifications,
        nextCursor: notifications.length === limit ? notifications[notifications.length - 1].created_at : null
    })
  } catch (error) {
    console.error('Notifications API Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '알림 조회 실패' } },
      { status: 500 }
    )
  }
}
