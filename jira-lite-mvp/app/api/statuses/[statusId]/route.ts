import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// PUT /api/statuses/[statusId] - 상태 수정
export async function PUT(request: Request, { params }: { params: Promise<{ statusId: string }> }) {
  try {
    const { statusId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const { name, color, position, wip_limit } = body;

    // 입력 검증
    if (name !== undefined && (typeof name !== 'string' || name.length === 0 || name.length > 30)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '상태 이름은 1-30자여야 합니다' } },
        { status: 400 }
      );
    }

    if (color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '색상은 HEX 형식이어야 합니다 (#XXXXXX)' } },
        { status: 400 }
      );
    }

    if (wip_limit !== undefined && wip_limit !== null && (typeof wip_limit !== 'number' || wip_limit < 1 || wip_limit > 50)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'WIP Limit은 1-50 사이여야 합니다' } },
        { status: 400 }
      );
    }

    // 상태 조회
    const { data: status, error: statusError } = await supabase
      .from('statuses')
      .select('*, project:projects!inner(*, team:teams!inner(id))')
      .eq('id', statusId)
      .single();

    if (statusError || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '상태를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 팀 멤버십 및 권한 검증 (OWNER/ADMIN만)
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', status.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'OWNER 또는 ADMIN 권한이 필요합니다' } },
        { status: 403 }
      );
    }

    // position 변경 시 다른 상태들 재정렬 (선택적 구현 - 현재는 단순 업데이트)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (position !== undefined) updateData.position = position;
    if (wip_limit !== undefined) updateData.wip_limit = wip_limit;

    // 상태 업데이트
    const { data: updatedStatus, error: updateError } = await supabase
      .from('statuses')
      .update(updateData)
      .eq('id', statusId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '상태 업데이트 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { status: updatedStatus },
    });
  } catch (error) {
    console.error('PUT /api/statuses/[statusId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// DELETE /api/statuses/[statusId] - 상태 삭제
export async function DELETE(request: Request, { params }: { params: Promise<{ statusId: string }> }) {
  try {
    const { statusId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 상태 조회
    const { data: status, error: statusError } = await supabase
      .from('statuses')
      .select('*, project:projects!inner(*, team:teams!inner(id))')
      .eq('id', statusId)
      .single();

    if (statusError || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '상태를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    // 기본 상태 삭제 차단
    if (status.is_default) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '기본 상태는 삭제할 수 없습니다' } },
        { status: 403 }
      );
    }

    // 팀 멤버십 및 권한 검증 (OWNER/ADMIN만)
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', status.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'OWNER 또는 ADMIN 권한이 필요합니다' } },
        { status: 403 }
      );
    }

    // Backlog 상태 ID 조회
    const { data: backlogStatus } = await supabase
      .from('statuses')
      .select('id')
      .eq('project_id', status.project_id)
      .eq('name', 'Backlog')
      .eq('is_default', true)
      .single();

    if (!backlogStatus) {
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Backlog 상태를 찾을 수 없습니다' } },
        { status: 500 }
      );
    }

    // 해당 상태의 이슈들을 Backlog로 이동
    const { data: movedIssues, error: moveError } = await supabase
      .from('issues')
      .update({
        status_id: backlogStatus.id,
        updated_at: new Date().toISOString(),
      })
      .eq('status_id', statusId)
      .is('deleted_at', null)
      .select('id');

    if (moveError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '이슈 이동 실패' } },
        { status: 500 }
      );
    }

    // 이동된 이슈들에 대한 히스토리 기록
    if (movedIssues && movedIssues.length > 0) {
      const historyRecords = movedIssues.map((issue) => ({
        issue_id: issue.id,
        changed_by: user.uid,
        field_name: 'status',
        old_value: statusId,
        new_value: backlogStatus.id,
      }));

      await supabase.from('issue_history').insert(historyRecords);
    }

    // 상태 삭제
    const { error: deleteError } = await supabase.from('statuses').delete().eq('id', statusId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '상태 삭제 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        moved_issues_count: movedIssues ? movedIssues.length : 0,
      },
    });
  } catch (error) {
    console.error('DELETE /api/statuses/[statusId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
