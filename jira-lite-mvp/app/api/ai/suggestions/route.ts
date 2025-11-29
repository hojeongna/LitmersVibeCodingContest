import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/ai/openai-client'
import { PROMPTS } from '@/lib/ai/prompts'
import { checkRateLimit, recordUsage } from '@/lib/ai/rate-limiter'
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

    // Rate limit check
    const canProceed = await checkRateLimit(user.uid)
    if (!canProceed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'AI 사용 한도를 초과했습니다' } },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { issue_id } = body

    if (!issue_id) {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_REQUEST', message: 'issue_id is required' } },
            { status: 400 }
        )
    }

    // Fetch issue
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('title, description, project_id')
      .eq('id', issue_id)
      .single()

    if (issueError || !issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이슈를 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    // Check team membership
    const { data: project } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', issue.project_id)
        .single()
    
    if (project) {
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
    }

    // Generate suggestions
    const suggestions = await withRetry(async () => {
        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [
              {
                role: 'system',
                content: PROMPTS.ISSUE_SUGGESTION.system
              },
              {
                role: 'user',
                content: PROMPTS.ISSUE_SUGGESTION.userTemplate(issue.title, issue.description || '')
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
    })

    // Save to database
    await supabase
      .from('issues')
      .update({
        ai_suggestions: suggestions,
        ai_generated_at: new Date().toISOString()
      })
      .eq('id', issue_id)

    // Record usage
    await recordUsage(user.uid, 'suggestion')

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI Suggestions Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: 'AI 제안 생성에 실패했습니다' } },
      { status: 500 }
    )
  }
}
