import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import { markAsRead } from '@/lib/notifications/service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    await markAsRead(id, user.uid)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark Notification Read Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '알림 읽음 처리 실패' } },
      { status: 500 }
    )
  }
}
