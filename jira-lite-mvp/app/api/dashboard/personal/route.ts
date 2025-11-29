import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import { getPersonalStats } from '@/lib/dashboard/stats'

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
    const teamId = searchParams.get('team_id')

    if (!teamId) {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_REQUEST', message: 'team_id is required' } },
            { status: 400 }
        )
    }

    const stats = await getPersonalStats(user.uid, teamId)

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Dashboard Personal Stats Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '통계 조회 실패' } },
      { status: 500 }
    )
  }
}
