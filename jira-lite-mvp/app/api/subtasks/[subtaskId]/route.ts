import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateSubtaskSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(200, '제목은 최대 200자까지 입력 가능합니다').optional(),
  is_completed: z.boolean().optional(),
});

import { verifyFirebaseAuth } from '@/lib/firebase/auth-server';

// PUT /api/subtasks/[subtaskId] - 서브태스크 수정 (제목, 완료 상태)
export async function PUT(request: Request, { params }: { params: Promise<{ subtaskId: string }> }) {
  try {
    const { subtaskId } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 입력 검증
    const validation = updateSubtaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    // 서브태스크 조회 및 팀 멤버십 검증
    const { data: subtask } = await supabase
      .from('subtasks')
      .select('*, issue:issues!inner(*, project:projects!inner(*, team:teams!inner(id)))')
      .eq('id', subtaskId)
      .single();

    if (!subtask) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '서브태스크를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', subtask.issue.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 서브태스크 수정
    const { data: updated, error: updateError } = await supabase
      .from('subtasks')
      .update(validation.data)
      .eq('id', subtaskId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '서브태스크 수정 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/subtasks/[subtaskId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// DELETE /api/subtasks/[subtaskId] - 서브태스크 삭제
export async function DELETE(request: Request, { params }: { params: Promise<{ subtaskId: string }> }) {
  try {
    const { subtaskId } = await params;
    const supabase = createAdminClient();

    const { user, error: authError } = await verifyFirebaseAuth();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 서브태스크 조회 및 팀 멤버십 검증
    const { data: subtask } = await supabase
      .from('subtasks')
      .select('*, issue:issues!inner(*, project:projects!inner(*, team:teams!inner(id)))')
      .eq('id', subtaskId)
      .single();

    if (!subtask) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '서브태스크를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', subtask.issue.project.team.id)
      .eq('user_id', user.uid)
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 서브태스크 삭제
    const { error: deleteError } = await supabase.from('subtasks').delete().eq('id', subtaskId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '서브태스크 삭제 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/subtasks/[subtaskId] error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
