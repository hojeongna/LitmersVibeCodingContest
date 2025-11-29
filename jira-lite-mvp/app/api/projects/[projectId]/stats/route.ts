import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import { getProjectStats } from '@/lib/dashboard/stats'

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const supabase = createAdminClient()
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as '7d' | '30d') || '7d'

    const stats = await getProjectStats(projectId, period)

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Project Stats Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '프로젝트 통계 조회 실패' } },
      { status: 500 }
    )
  }
}
