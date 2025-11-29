import { createAdminClient } from '@/lib/supabase/admin'

const LIMITS = {
  PER_MINUTE: 10,
  PER_DAY: 100
}

interface RateLimitResult {
  allowed: boolean
  remaining: { minute: number; daily: number }
  resetIn?: { minute: number; daily: number } // seconds
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  const result = await checkRateLimitWithDetails(userId)
  return result.allowed
}

export async function checkRateLimitWithDetails(userId: string): Promise<RateLimitResult> {
  const supabase = createAdminClient()
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const startOfDay = new Date(now.setHours(0, 0, 0, 0))

  const [minuteResult, dailyResult] = await Promise.all([
    supabase
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneMinuteAgo.toISOString()),
    supabase
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
  ])

  const minuteCount = minuteResult.count || 0
  const dailyCount = dailyResult.count || 0

  const allowed = minuteCount < LIMITS.PER_MINUTE && dailyCount < LIMITS.PER_DAY

  return {
    allowed,
    remaining: {
      minute: Math.max(0, LIMITS.PER_MINUTE - minuteCount),
      daily: Math.max(0, LIMITS.PER_DAY - dailyCount)
    },
    resetIn: allowed ? undefined : {
      minute: 60 - Math.floor((Date.now() - oneMinuteAgo.getTime()) / 1000),
      daily: Math.floor((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)
    }
  }
}

export async function recordUsage(userId: string, actionType: string) {
  const supabase = createAdminClient()
  await supabase.from('ai_usage').insert({
    user_id: userId,
    action_type: actionType
  })
}
