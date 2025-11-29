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

    // Fetch recent issues (limit 50)
    const { data: issues } = await supabase
        .from('issues')
        .select('id, title, description')
        .eq('project_id', project_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50)

    if (!issues || issues.length === 0) {
        return NextResponse.json({ success: true, data: { duplicates: [] } })
    }

    const existingIssuesJson = JSON.stringify(issues.map(i => ({
        issue_id: i.id,
        title: i.title,
        description: i.description
    })))

    // Detect duplicates
    const duplicates = await withRetry(async () => {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: PROMPTS.DUPLICATE_DETECT.system
              },
              {
                role: 'user',
                content: PROMPTS.DUPLICATE_DETECT.userTemplate(title, description || '', existingIssuesJson)
              }
            ],
            response_format: { type: 'json_object' }
        })
        return JSON.parse(response.choices[0].message.content || '{}')
    })

    const duplicateResults = duplicates.duplicates?.map((d: any) => {
        const issue = issues.find(i => i.id === d.issue_id)
        return issue ? { ...d, issue_key: issue.id.slice(0, 8), title: issue.title } : null
    }).filter(Boolean) || []

    await recordUsage(user.uid, 'duplicate')

    return NextResponse.json({
      success: true,
      data: {
        duplicates: duplicateResults
      }
    })

  } catch (error) {
    console.error('AI Duplicate Detect Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: '중복 탐지에 실패했습니다' } },
      { status: 500 }
    )
  }
}
