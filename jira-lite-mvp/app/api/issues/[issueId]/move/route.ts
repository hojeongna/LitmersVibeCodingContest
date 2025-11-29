import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PUT /api/issues/[issueId]/move - 이슈 이동 (상태 변경 및 순서 변경)
export async function PUT(request: Request, { params }: { params: Promise<{ issueId: string }> }) {
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

    const { status_id, position } = body;

    if (!status_id || typeof position !== 'number') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'status_id와 position이 필요합니다' } },
        { status: 400 }
      );
    }

    // 이슈 조회
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

    // 팀 멤버십 검증
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

    const oldStatusId = issue.status_id;
    const statusChanged = oldStatusId !== status_id;

    // 이슈 업데이트
    const { data: updatedIssue, error: updateError } = await supabase
      .from('issues')
      .update({
        status_id,
        position,
        updated_at: new Date().toISOString(),
      })
      .eq('id', issueId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '이슈 업데이트 실패' } },
        { status: 500 }
      );
    }

    // 상태 변경 시 issue_history 기록
    if (statusChanged) {
      await supabase.from('issue_history').insert({
        issue_id: issueId,
        changed_by: user.id,
        field_name: 'status',
        old_value: oldStatusId,
        new_value: status_id,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        issue: updatedIssue,
        affected_issues: [], // Fractional Indexing 사용 시 다른 이슈 업데이트 불필요
      },
    });
  } catch (error) {
    console.error('PUT /api/issues/[issueId]/move error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
