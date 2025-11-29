import { createClient } from '@/lib/supabase/server'

const RATE_LIMITS = {
  MINUTE: 10,
  DAILY: 100
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Get current usage
  const { data: usage, error } = await supabase
    .from('ai_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Rate limit check error:', error)
    return false // Fail safe
  }

  const now = new Date()
  
  if (!usage) {
    // Create new record
    await supabase.from('ai_rate_limits').insert({
      user_id: userId,
      minute_count: 0,
      minute_reset_at: new Date(now.getTime() + 60 * 1000).toISOString(),
      daily_count: 0,
      daily_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    })
    return true
  }

  // Check resets
  let updates: any = {}
  let minuteCount = usage.minute_count
  let dailyCount = usage.daily_count

  if (usage.minute_reset_at && new Date(usage.minute_reset_at) < now) {
    minuteCount = 0
    updates.minute_count = 0
    updates.minute_reset_at = new Date(now.getTime() + 60 * 1000).toISOString()
  }

  if (usage.daily_reset_at && new Date(usage.daily_reset_at) < now) {
    dailyCount = 0
    updates.daily_count = 0
    updates.daily_reset_at = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('ai_rate_limits').update(updates).eq('user_id', userId)
  }

  if (minuteCount >= RATE_LIMITS.MINUTE || dailyCount >= RATE_LIMITS.DAILY) {
    return false
  }

  return true
}

export async function recordUsage(userId: string, type: string) {
  const supabase = await createClient()
  
  const { data: usage } = await supabase
    .from('ai_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (usage) {
    await supabase.from('ai_rate_limits').update({
      minute_count: usage.minute_count + 1,
      daily_count: usage.daily_count + 1
    }).eq('user_id', userId)
  }
}
