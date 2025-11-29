import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import { getTeamStats } from '@/lib/dashboard/stats'

export async function GET(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const supabase = createAdminClient()
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as '7d' | '30d' | '90d') || '7d'

    // Check team membership
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.uid)
      .single()

    if (memberError || !teamMember) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '팀 멤버가 아닙니다' } },
        { status: 403 }
      )
    }

    const stats = await getTeamStats(teamId, period)

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Team Stats Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '팀 통계 조회 실패' } },
      { status: 500 }
    )
  }
}
