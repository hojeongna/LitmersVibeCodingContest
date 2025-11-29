import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/issues/[issueId]/comments - 댓글 목록 조회
export async function GET(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  try {
    const { issueId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 이슈 조회 및 팀 멤버십 검증
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*, project:projects!inner(id, team_id)')
      .eq('id', issueId)
      .is('deleted_at', null)
      .single();

    if (issueError || !issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이슈를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', issue.project.team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 전체 댓글 수 조회
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('issue_id', issueId)
      .is('deleted_at', null);

    // 댓글 목록 조회 (페이지네이션, 최신순)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
        id,
        issue_id,
        content,
        created_at,
        updated_at,
        author:profiles!comments_author_id_fkey(id, name, avatar_url)
      `
      )
      .eq('issue_id', issueId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (commentsError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '댓글 조회 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total: count || 0,
          has_more: count ? from + limit < count : false,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/issues/[issueId]/comments error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// POST /api/issues/[issueId]/comments - 댓글 작성
export async function POST(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
  try {
    const { issueId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const { content } = body;

    // 입력 검증
    if (!content || typeof content !== 'string' || content.length === 0 || content.length > 1000) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '댓글 내용은 1-1000자여야 합니다' } },
        { status: 400 }
      );
    }

    // 이슈 조회 및 팀 멤버십 검증
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*, project:projects!inner(id, team_id)')
      .eq('id', issueId)
      .is('deleted_at', null)
      .single();

    if (issueError || !issue) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '이슈를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', issue.project.team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 댓글 생성
    const { data: newComment, error: createError } = await supabase
      .from('comments')
      .insert({
        issue_id: issueId,
        author_id: user.id,
        content,
      })
      .select(
        `
        id,
        issue_id,
        content,
        created_at,
        updated_at,
        author:profiles!comments_author_id_fkey(id, name, avatar_url)
      `
      )
      .single();

    if (createError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '댓글 생성 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { comment: newComment },
    });
  } catch (error) {
    console.error('POST /api/issues/[issueId]/comments error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
