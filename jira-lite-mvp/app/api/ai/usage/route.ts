import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitWithDetails } from '@/lib/ai/rate-limiter'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    // Get current usage
    const rateLimit = await checkRateLimitWithDetails(user.uid)

    return NextResponse.json({
      success: true,
      data: {
        limits: {
          per_minute: 10,
          per_day: 100
        },
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
        allowed: rateLimit.allowed
      }
    })

  } catch (error) {
    console.error('AI Usage Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '사용량 조회에 실패했습니다' } },
      { status: 500 }
    )
  }
}
