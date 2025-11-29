import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/ai/openai-client'
import { PROMPTS } from '@/lib/ai/prompts'
import { checkRateLimitWithDetails, recordUsage } from '@/lib/ai/rate-limiter'
import { withRetry } from '@/lib/ai/utils'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import crypto from 'crypto'

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
    const { issue_id } = body

    if (!issue_id) {
        return NextResponse.json(
            { success: false, error: { code: 'INVALID_REQUEST', message: 'issue_id is required' } },
            { status: 400 }
        )
    }

    // Fetch issue and comments
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

    // Fetch comments
    const { data: comments } = await supabase
        .from('comments')
        .select('content, author:profiles(name), created_at')
        .eq('issue_id', issue_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

    if (!comments || comments.length < 5) {
        return NextResponse.json(
            { 
                success: false, 
                error: { 
                    code: 'INSUFFICIENT_COMMENTS', 
                    message: '댓글이 5개 이상일 때만 요약할 수 있습니다',
                    details: {
                        required: 5,
                        current: comments?.length || 0
                    }
                } 
            },
            { status: 400 }
        )
    }

    // Calculate hash
    const commentsText = comments.map(c => `${c.author?.name}: ${c.content}`).join('\n')
    const contentHash = crypto.createHash('sha256').update(commentsText).digest('hex')

    // Check cache
    const { data: cached } = await supabase
        .from('ai_cache')
        .select('result')
        .eq('issue_id', issue_id)
        .eq('cache_type', 'comment_summary')
        .eq('content_hash', contentHash)
        .single()

    if (cached) {
        return NextResponse.json({
            success: true,
            data: {
                summary: (cached.result as any).text,
                cached: true
            }
        })
    }

    // Generate summary
    const summary = await withRetry(async () => {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: PROMPTS.COMMENT_SUMMARY.system
              },
              {
                role: 'user',
                content: PROMPTS.COMMENT_SUMMARY.userTemplate(issue.title, issue.description || '', commentsText)
              }
            ],
            max_completion_tokens: 500,
            temperature: 0.7,
        })
        return response.choices[0].message.content || ''
    })

    // Save to cache
    // Remove old cache for this type
    await supabase.from('ai_cache').delete()
        .eq('issue_id', issue_id)
        .eq('cache_type', 'comment_summary')

    await supabase.from('ai_cache').insert({
        issue_id: issue_id,
        cache_type: 'comment_summary',
        content_hash: contentHash,
        result: { text: summary }
    })

    // Record usage
    await recordUsage(user.uid, 'comment_summary')

    return NextResponse.json({
      success: true,
      data: {
        summary,
        cached: false
      }
    })

  } catch (error) {
    console.error('AI Comment Summary Error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: '댓글 요약에 실패했습니다' } },
      { status: 500 }
    )
  }
}
