import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import { markAllAsRead } from '@/lib/notifications/service'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    await markAllAsRead(user.uid)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '전체 읽음 처리 실패' } },
      { status: 500 }
    )
  }
}
