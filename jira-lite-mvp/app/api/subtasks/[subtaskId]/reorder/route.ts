import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const reorderSchema = z.object({
  position: z.number().int().positive('position은 양수여야 합니다'),
});

// PUT /api/subtasks/[subtaskId]/reorder - 서브태스크 순서 변경
export async function PUT(request: Request, { params }: { params: Promise<{ subtaskId: string }> }) {
  try {
    const { subtaskId } = await params;
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

    // 입력 검증
    const validation = reorderSchema.safeParse(body);
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
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 순서 변경
    const { data: updated, error: updateError } = await supabase
      .from('subtasks')
      .update({ position: validation.data.position })
      .eq('id', subtaskId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '서브태스크 순서 변경 실패' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/subtasks/[subtaskId]/reorder error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
