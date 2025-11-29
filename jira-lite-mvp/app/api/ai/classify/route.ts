import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/ai/openai-client'
import { checkRateLimit, checkRateLimitWithDetails, recordUsage } from '@/lib/ai/rate-limiter'
import { PROMPTS } from '@/lib/ai/prompts'
import { withRetry } from '@/lib/ai/utils'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { user, error: authError } = await verifyFirebaseAuth()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      )
    }

    const rateLimit = await checkRateLimitWithDetails(user.uid)
    if (!rateLimit.allowed) {
      const resetIn = rateLimit.resetIn?.minute || rateLimit.resetIn?.daily || 60
      const message = rateLimit.remaining.minute === 0 
        ? `분당 사용 제한에 도달했습니다. ${resetIn}초 후 다시 시도하세요.`
        : `일일 사용 제한에 도달했습니다. 내일 다시 시도하세요.`
        
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message,
            details: rateLimit 
          } 
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { title, description, project_id } = body

    if (!title || !project_id) {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_REQUEST', message: 'title and project_id are required' } },
            { status: 400 }
        )
    }

    // Check team membership via project
    const { data: project } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', project_id)
        .single()
    
    if (!project) {
        return NextResponse.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
            { status: 404 }
        )
    }

    const { data: member } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', project.team_id)
        .eq('user_id', user.uid)
        .single()
    
    if (!member) {
            return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: '팀 멤버만 접근할 수 있습니다' } },
            { status: 403 }
        )
    }

    // Fetch project labels
    const { data: labels } = await supabase
        .from('labels')
        .select('id, name, color')
        .eq('project_id', project_id)

    if (!labels || labels.length === 0) {
        return NextResponse.json({ success: true, data: { labels: [] } })
    }

    const labelNames = labels.map(l => l.name).join(', ')

    // Generate suggestions
    const suggestions = await withRetry(async () => {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: PROMPTS.LABEL_SUGGEST.system
              },
              {
                role: 'user',
                content: PROMPTS.LABEL_SUGGEST.userTemplate(title, description || '', labelNames)
              }
            ],
            response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
    })

    const suggestedLabels = suggestions.suggestions?.map((s: any) => {
        const label = labels.find(l => l.name === s.label_name)
        return label ? { ...label, confidence: s.confidence } : null
    }).filter(Boolean) || []

    await recordUsage(user.uid, 'classify')

    return NextResponse.json({
      success: true,
      data: {
        labels: suggestedLabels
      }
    })

  } catch (error) {
    console.error('AI Classify Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: 'AI 분류에 실패했습니다' } },
      { status: 500 }
    )
  }
}
